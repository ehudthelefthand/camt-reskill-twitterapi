const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tweetSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
})

module.exports = mongoose.model('Tweet', tweetSchema)