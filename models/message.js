const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title:{type: String, required: true},
    timestamp:{type: String},
    text:{type: String, required: true},
    user:{type: String, required: true},
})

module.exports =  mongoose.model('Message', MessageSchema);