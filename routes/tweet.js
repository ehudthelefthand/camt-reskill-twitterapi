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

router.get('/', asyncHandler(async (req, res, next) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 10

    let total = await findTweet().count().exec()
    let tweets = await findTweet()
        .skip(offset * limit)
        .limit(limit)
        .exec()
    res.json({
        data: tweets,
        total: total
    })
}))

router.get('/:userId', asyncHandler(async (req, res, next) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 10

    const user = await User.findById(req.params.userId).exec()
    if (!user) {
        res.sendStatus(404)
        return
    }

    const ids = [ ...user.followings, user._id ]
    const total = await findTweet()
        .where({ author: { $in: ids }})
        .count()
        .exec()
    const tweets = await findTweet()
        .where({ author: { $in: ids }})
        .skip(offset * limit)
        .limit(limit)
        .exec() 
    res.json({
        data: tweets,
        total: total
    })
}))

router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
    await Tweet.deleteOne({ _id: req.params.id }).exec()
    res.sendStatus(204)
}))

router.post('/:id/likes', auth, asyncHandler(async (req, res, next) => {
    const tweet = await Tweet.findById(req.params.id)
    if (!tweet) {
        res.sendStatus(404)
        return
    }
    tweet.likes.push(req.User._id)
    await tweet.save()
    res.sendStatus(200)
}))

router.post('/:id/unlikes', auth, asyncHandler(async (req, res, next) => {
    const tweet = await Tweet.findById(req.params.id)
    if (!tweet) {
        res.sendStatus(404)
        return
    }
    tweet.likes = tweet.likes.filter(id => !id.equals(req.User._id))
    await tweet.save()
    res.sendStatus(200)
}))

function findTweet() {
    return Tweet.find()
        .populate('author', { username: true, avatar: true })
        .sort({ createdAt: -1 })
}

module.exports = router