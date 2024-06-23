const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name:{type: String, required: true},
    last_name:{type: String, required: true},
    user_name:{type: String, required: true},
    password:{type: String, required: true},
    membership: {type: Boolean,}
})

module.exports =  mongoose.model('User', UserSchema);