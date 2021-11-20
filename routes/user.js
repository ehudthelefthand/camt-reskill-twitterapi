const express = require('express')
const asyncHandler = require('express-async-handler')
const auth = require('../middlewares/auth')
const User = require('../models/user')

const router = express.Router()

router.get('/', asyncHandler(async (req, res, next) => {
    const users = await User.find().exec()
    res.json(users)
}))

router.get('/:id', asyncHandler(async (req, res, next) => {
    const user = User.findOne({ _id: req.params.id })
        .populate('tweets')
    if (!user) {
        res.sendStatus(404)
        return
    }

    const tweets = await Tweet
        .find({ author: user._id })
        .populate('author')
        .exec()
    
    res.json(tweets)
}))

router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
    await Tweet.deleteOne({ _id: req.params.id }).exec()
    res.sendStatus(204)
}))

module.exports = router