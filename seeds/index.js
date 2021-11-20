const mongoose = require('mongoose')
// const Food = require('../models/food')
// const FoodData = require('./food')

const DB_HOST = process.env.DB_HOST

mongoose.connect(DB_HOST, async (err) => {
    if (err) {
        console.error(err)
        return
    }
    
    try {
        // await Food.collection.drop()
        // await Food.insertMany(FoodData)
        await mongoose.disconnect()
    } catch (err) {
        console.error(err)
    }
})