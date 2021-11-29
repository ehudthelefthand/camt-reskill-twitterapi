const express = require('express')
const asyncHandler = require('express-async-handler')
const auth = require('../middlewares/auth')
const User = require('../models/user')

const router = express.Router()

router.get('/', asyncHandler(async (req, res, next) => {
    const users = await User.find().exec()
    res.json(users)
}))

router.get('/:userId', asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId).exec()
    if (!user) {
        res.sendStatus(404)
        return
    }
    res.json(user)
}))

router.post('/:userId/follows', auth, asyncHandler(async (req, res, next) => {
    const followId = req.params.userId
    if (req.User._id.equals(followId)) {
        res.sendStatus(400)
        return
    }
    if (req.User.followings.includes(followId)) {
        res.sendStatus(400)
        return
    }
    const Following = await User.findById(followId)
    if (!Following) {
        res.sendStatus(404)
        return
    }
    req.User.followings.push(followId)
    await req.User.save()
    Following.followers.push(req.User._id)
    await Following.save()
    res.sendStatus(200)
}))

router.post('/:userId/unfollows', auth, asyncHandler(async (req, res, next) => {
    const unfollowId = req.params.userId
    const Following = await User.findById(unfollowId)
    if (!Following) {
        res.sendStatus(404)
        return
    }
    req.User.followings = req.User.followings.filter(id => !id.equals(unfollowId))
    await req.User.save()
    Following.followers = Following.followers.filter(id => !id.equals(req.User._id))
    await Following.save()
    res.sendStatus(200)
}))

module.exports = router