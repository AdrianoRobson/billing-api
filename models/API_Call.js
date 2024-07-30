const mongoose = require('../db/connect')

const { Schema } = mongoose

const apiCall = new Schema({
    companyId: {
        type: String,
        required: true,
    },
    callerId: {
        type: String,
        required: true,
    }, 
    sessionId: {
        type: String,
        required: true,
    }, 
    type: {
        type: String,
        enum: ['IAProvider', 'externalAPI',],
    },
    requestLogs: {
        type: String, 
    },
    responseError: {
        type: String, 
    },
    quantityOfAPICall: {
        type: String, 
    }, 

}, { timestamps: true })
 
const API_Call = mongoose.model('API_Call', apiCall)

module.exports = API_Call
