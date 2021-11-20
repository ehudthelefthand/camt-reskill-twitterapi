const express = require('express')
const asyncHandler = require('express-async-handler')
const auth = require('../middlewares/auth')
const Tweet = require('../models/tweet')
const User = require('../models/user')

const router = express.Router()

router.post('/', auth, asyncHandler(async (req, res, next) => {
    const { text } = req.body
    await Tweet.create({ text, author: req.User._id })
    res.sendStatus(201)
}))

router.get('/', auth, asyncHandler(async (req, res, next) => {
    const user = req.User
    const tweets = await Tweet
        .find({ author: user._id })
        .populate('author')
        .exec()
    
    res.json(tweets)
}))

router.get('/:username', asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.params.username }).exec()
    if (!user) {
        res.sendStatus(404)
        return
    }

    const tweets = await Tweet
        .find({ author: user._id })
        .exec()
    
    res.json(tweets)
}))

router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
    await Tweet.deleteOne({ _id: req.params.id }).exec()
    res.sendStatus(204)
}))

module.exports = router