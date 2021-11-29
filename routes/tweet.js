const express = require('express')
const asyncHandler = require('express-async-handler')
const auth = require('../middlewares/auth')
const setUser = require('../middlewares/setUser')
const Tweet = require('../models/tweet')
const User = require('../models/user')

const router = express.Router()

router.post('/', auth, asyncHandler(async (req, res, next) => {
    const { text } = req.body
    await Tweet.create({ text, author: req.User._id })
    res.sendStatus(201)
}))

router.get('/', setUser, asyncHandler(async (req, res, next) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 10
    
    let query = Tweet.find()
        .populate('author', { username: true, avatar: true })
        .sort({ createdAt: -1 })
    let total = await query.count().exec()
    let paginationQuery = query
        .skip(offset * limit)
        .limit(limit)

    if (req.User) {
        const followings = req.User.followings
        paginationQuery = paginationQuery
            .where({
                author: { $in: followings }
            })
        res.json(tweets)
    }
    
    const tweets = await paginationQuery.exec()
    res.json({
        data: tweets,
        total: total
    })
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