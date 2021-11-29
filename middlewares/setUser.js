const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const User = require('../models/user')

const SECRET = process.env.SECRET || 'secret'

module.exports = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        next()
        return
    }

    const token = authHeader.slice('Bearer '.length)
    if (!token) {
        next()
        return
    }

    const claim = jwt.verify(token, SECRET)
    const user = await User.findOne({ remember: claim.remember }).exec()
    if (!user) {
        next()
        return
    }

    req.User = user
    
    next()
})