const mongoose = require('../db/connect')

const { Schema } = mongoose

const apiUsageWhatsapp = new Schema({
    companyId: {
        type: String,
        required: true,
    },
    msgId: {
        type: String,
        required: true,
    },
    ticketId: {
        type: String,
        required: true,
    },    
    provider: {
        type: String,
        required: true,
    },
    product: {
        type: String,
        required: true,
    },      
    price: {
        type: String,
        required: true
    },
    billable: {
        type: String, 
        require: true
    },
    pricing_model: {
        type: String,
        default: true 
    },
    type: {
        type: String,
        required: true,
    },       

}, { timestamps: true })
 
const API_Usage_Whatsapp = mongoose.model('API_Usage_Whatsapp', apiUsageWhatsapp)

module.exports = API_Usage_Whatsapp
