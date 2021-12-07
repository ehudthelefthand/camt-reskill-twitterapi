const express = require('express')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const crypto = require('crypto')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const Tweet = require('../models/tweet')

const SECRET = process.env.SECRET || 'secret'
const TOKEN_EXPIRE = process.env.TOKEN_EXPIRE || '8h'

const router = express.Router()
const AVATAR_PATH = 'images/avatars/'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_PATH)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    },
})
const upload = multer({ 
    storage, 
    limits: {
        fileSize: 1000 * 1000 * 2 // 2 MB
    }
})

router.post('/register', upload.single('avatar'), asyncHandler(async (req, res) => {
    const { 
        username,
        password, 
        firstname, 
        lastname,
        email,
        phoneNumber
    } = req.body
    const saltRound = 10
    const passwordHash = await bcrypt.hash(password, saltRound)
    const user = new User({ 
        username,
        password: passwordHash, 
        firstname, 
        lastname,
        email,
        phoneNumber,
    })

    if (req.file && req.file.filename) {
        user.avatar = req.file.filename
    }

    await user.save()

    res.sendStatus(201)
}))

router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username, deleted: false }).select("+password").exec()
    if (!user) {
        res.sendStatus(401)
        return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        res.sendStatus(401)
        return
    }

    const remember = crypto.randomBytes(32).toString('hex')
    user.remember = remember
    await user.save()

    const token = jwt.sign({
        remember,
    }, SECRET, { 
        expiresIn: TOKEN_EXPIRE
    })

    res.json({ token })
}))

router.get('/me', auth, asyncHandler(async (req, res) => {
    res.json(req.User)
}))

router.put('/me', auth, asyncHandler(async (req, res) => {
    const user = req.User
    const { firstname, lastname, phoneNumber, email } = req.body
    if (firstname) {
        user.firstname = firstname
    }
    if (lastname) {
        user.lastname = lastname
    }
    if (phoneNumber) {
        user.phoneNumber = phoneNumber
    }
    if (email) {
        user.email = email
    }
    await user.save()
    res.sendStatus(204)
}))

router.put('/me/avatar', auth, upload.single('avatar'), asyncHandler(async (req, res) => {
    const user = req.User
    if (req.file && req.file.filename) {
        const oldfilename = user.avatar
        user.avatar = req.file.filename
        await user.save()
        if (oldfilename) {
            try {
                fs.unlinkSync(path.resolve(__dirname, '..', AVATAR_PATH, oldfilename))
            } catch {
                console.log('file not found but it is ok.')
            }
        }
    }
    res.sendStatus(204)
}))

router.delete('/me', auth, asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.User._id, { 
        deleted: true, 
        $unset: { remember: 1 }
    }).exec()
    res.sendStatus(204)
}))


router.post('/logout', auth, asyncHandler(async (req, res) => {
    const user = req.User
    await User.findByIdAndUpdate(user._id, { $unset: { remember: 1 } })    
    res.sendStatus(204)
}))

module.exports = router