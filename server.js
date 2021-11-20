const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const cors = require('cors')

const authRoute = require('./routes/auth')
const tweetRoute = require('./routes/tweet')
const userRoute = require('./routes/user')

const DB_HOST = process.env.DB_HOST || 'mongodb://localhost/food_db'
const PORT = process.env.PORT || 3000

const app = express()

app.use(express.static('images'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

app.use('/', authRoute)
app.use('/tweets', tweetRoute)
app.use('/users', userRoute)

app.use((err, req, res, next) => {
    console.log(err)
    if (err instanceof jwt.JsonWebTokenError) {
        res.sendStatus(401)
        return
    }
    res.status(500).send(err.message)
})

mongoose.connect(DB_HOST, err => {
    if (err) {
        console.error(err)
        return
    }
    app.listen(PORT, () => console.log(`server started at port ${PORT}`))
})