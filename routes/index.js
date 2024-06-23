var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Message = require('../models/message');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session');

const {body, validationResult} = require('express-validator');
const asyncHandler = require('express-async-handler');
const bycrypt = require('bcryptjs');


router.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
router.use(passport.session());
router.use(express.urlencoded({ extended: false }));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' });
});

router.post('/log-in', passport.authenticate('local',{
  successRedirect: "/update-membership",
  failureRedirect: "/"
}));


router.get('/sign-up', function(req, res, next){
  res.render('sign_up', {title: 'Sign Up'})
})

router.post('/sign-up', [
      body('first_name', 'First Name must not be empty')
        .trim()
        .isLength({min: 1})
        .escape(),
      body('last_name', 'Last Name must not be empty')
        .trim()
        .isLength({min: 1})
        .escape(),
      body('user_name', 'User Name must not be empty')
        .trim()
        .isLength({min: 1})
        .escape(),
      body('password', 'Password must not be empty')
        .trim()
        .isLength({min: 1})
        .escape(),
      
      asyncHandler(async(req, res, next)=>{
          const errors = validationResult(req);

          const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            user_name: req.body.user_name,
            password: req.body.password,
            membership: false,
          })

          await bycrypt.hash(req.body.password, 10)
                  .then(hash => {user.password = hash })
                  .catch(err => {console.log(err.message)});
          
          if(!errors.isEmpty()){
            res.render('sign_up', {title: 'Sign Up'})
          }else{
            await user.save()
            res.redirect('/')
          }

      })
])

router.get('/update-membership', function(req, res, next){
    res.render('update_membership', 
      {
      title: 'Update Membership',
      username: req.user, 
      });
});



passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ user_name: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bycrypt.compare(password, user.password);
if (!match) {
// passwords do not match!
return done(null, false, { message: "Incorrect password" })
}

      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});




module.exports = router;
