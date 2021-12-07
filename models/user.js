const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        required: true
    },
    lastname: {
        type: String,
        trim: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate: [ validator.isEmail, 'Invalid email' ]
    },
    avatar: {
        type: String,
        trim: true,
        get: avatarPath
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    remember: {
        type: String,
        select: false,
    },
    deleted: {
        type: Boolean,
        default: false
    },
    followings: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    followers: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }
})

function avatarPath(avatar) {
    if (avatar) {
        return `/avatars/${avatar}`    
    }
}

userSchema.set('toObject', { getters: true })
userSchema.set('toJSON', { getters: true })

module.exports = mongoose.model('User', userSchema)