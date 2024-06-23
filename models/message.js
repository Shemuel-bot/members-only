const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title:{type: String, required: true},
    timestamp:{type: Date},
    text:{type: String},
    user:{type: Schema.ObjectId, ref:'User'},
})

module.exports =  mongoose.model('Message', MessageSchema);