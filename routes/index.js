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
const { Admin } = require('mongodb');


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
            admin: req.body.admin,
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


router.post('/update-membership', asyncHandler( async function(req, res, next){
  if(req.body.guess === 'footsteps'){
    await User.findOneAndUpdate({_id: req.user._id}, {$set: {membership: true}})
    res.render('update_membership', 
      {
      title: 'Update Membership',
      username: req.user, 
      });
  }else{
    res.render('update_membership', 
      {
      title: 'Update Membership',
      username: req.user, 
      });
  }
}))


router.get('/new-message', function(req, res, next){
  res.render('new_message_form', {title: 'New Message'})
});

router.post('/new-message',[
  body('title', 'TItle must not be empty')
    .trim()
    .isLength({ min: 1})
    .escape(),
  body('text', 'Text must not be empty')
    .trim()
    .isLength()
    .escape(),
  asyncHandler(async function(req, res, next){
    const errors = validationResult(req);
    const user = await User.findById(req.user);
    const message = new Message({
      title: req.body.title,
      timestamp: new Date().toISOString().split('T')[0],
      text: req.body.text,
      user: user.user_name,
    });

    if(!errors.isEmpty()){
      res.render('new_message_form', {title: 'New Message'});
    }else{
      await message.save();
      res.redirect('/home')
    }
  })
]);

router.get('/home', asyncHandler(async function(req, res, next) {
  const messages = await Message.find();
  const user = await User.findById(req.user);
  res.render('home', {
    title: 'Home',
    messages: messages,
    admin: user.admin,
  });
}))

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.post('/delete', asyncHandler(async function(req, res, next){
    await Message.findByIdAndDelete(req.body.id)
    res.redirect('/home')
}))

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
