const mongoose = require('../db/connect')

const { Schema } = mongoose

const apiPricing = new Schema({    
    provider: {
        type: String,
        required: true,
    },
    product: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        enum: ['dollar', 'real',],
        default: 'dollar'
    },
    price: {
        type: String,
        required: true
    }, 
    billingBy:{
        type: String,
        enum: ['minute', 'character', 'token', 'second', 'hour'],
        required: true,
    },
    billingUnit:{
        type: Number,
        required: true
    },
    type: {
        type: String, 
    }

}, { timestamps: true })
 
const API_Pricing = mongoose.model('API_Pricing', apiPricing)

module.exports = API_Pricing
