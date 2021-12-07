const mongoose = require('mongoose')
require('../models/user')
const Tweet = require('../models/tweet')

async function run() {
    const tweets = await Tweet.find().populate('author').exec()
    const hangingTweets = tweets.filter(t => t.author === null)
    console.log(hangingTweets)
    const ids = hangingTweets.map(ht => ht._id)
    await Tweet.deleteMany({ _id: { $in: ids } })
}

mongoose.connect('mongodb://localhost/twitter_db')
    .then(() => run())
    .catch(err => {
        console.error(err)
    })
    .finally(() => {
        mongoose.disconnect()
    })