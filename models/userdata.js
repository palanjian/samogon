const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userdataSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }    
}, { timestamps: true})

const User = mongoose.model('User', userdataSchema)
module.exports = User //exports for use elsewhere in the project