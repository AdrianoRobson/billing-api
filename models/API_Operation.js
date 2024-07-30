const mongoose = require('../db/connect')

const { Schema } = mongoose

const apiOperation = new Schema({
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
    operation: {
        type: String,
        required: true,
    }, 

}, { timestamps: true })
 
const API_Operation = mongoose.model('API_Operation', apiOperation)

module.exports = API_Operation
