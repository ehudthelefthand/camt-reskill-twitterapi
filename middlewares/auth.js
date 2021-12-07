const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const User = require('../models/user')

const SECRET = process.env.SECRET || 'secret'

module.exports = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        res.sendStatus(401)
        return
    }

    const token = authHeader.slice('Bearer '.length)
    if (!token) {
        res.sendStatus(401)
        return
    }

    const claim = jwt.verify(token, SECRET)
    console.log(claim)
    const user = await User.findOne({ remember: claim.remember, deleted: false }).exec()
    console.log(user)
    if (!user) {
        res.sendStatus(401)
        return
    }

    req.User = user
    
    next()
})