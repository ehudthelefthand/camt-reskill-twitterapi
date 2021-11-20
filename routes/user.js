const express = require('express')
const asyncHandler = require('express-async-handler')
const auth = require('../middlewares/auth')
const User = require('../models/user')

const router = express.Router()

router.get('/', asyncHandler(async (req, res, next) => {
    const users = await User.find().exec()
    res.json(users)
}))

router.get('/:username', asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.params.username }).exec()
    if (!user) {
        res.sendStatus(404)
        return
    }
    res.json(user)
}))

module.exports = router