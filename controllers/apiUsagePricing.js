const { StatusCodes } = require("http-status-codes")
const API_Pricing = require("../models/API_Pricing.js")
const {
    mustContainProperties,
    calculateApiUsage,
} = require('../utils')
const API_Usage = require("../models/API_Usage.js")
const billingSumUsage = require("../utils/billingSumUsage.js")
const moment = require('moment')

const setApiPricing = async (req, res) => {

    const { provider, product, currency, price, billingBy, billingUnit, type } = req.body

    mustContainProperties(req, ['provider',
        'product',
        'price',
        'billingBy',
        'billingUnit'])

    const apiPricing = await API_Pricing.create({
        provider: provider.trim().toLowerCase(),
        product: product.trim().toLowerCase(),
        currency,
        price,
        billingBy,
        billingUnit,
        type
    })

    res.status(StatusCodes.OK).json({ apiPricing })
}

const registerUsage = async (req, res) => {
    const { 
        provider,
        product,
        usage,
        callerId, 
        companyId,
        quantityOfOperationAttempts,
        chosenOperation,
        requestLogsOpenAI,
        responseErrorLogsOpenAI,
        quantityOfCallsToFalconFlowAPI,
        requestLogsFalconFlowAPI,
        responseErrorLogsFalconFlowAPI,
    } = req.body

    mustContainProperties(req, [
        'companyId',
        'callerId',
        'quantityOfOperationAttempts',
        'chosenOperation',
        'requestLogsOpenAI',
        // 'responseErrorLogsOpenAI',
        'quantityOfCallsToFalconFlowAPI',
        'requestLogsFalconFlowAPI',
        // 'responseErrorLogsFalconFlowAPI',
        'provider',
        'product',
        'usage',
    ])  

    const apiPricing = await API_Pricing.findOne({
        provider: provider.trim().toLowerCase(),
        product: product.trim().toLowerCase(),
    })
  
    if (apiPricing) {  

        const { price, billingBy, billingUnit } = apiPricing  

        const apiUsage = await API_Usage.create({
            provider: provider.trim().toLowerCase(),
            product: product.trim().toLowerCase(), 
            callerId, 
            quantityOfOperationAttempts,
            chosenOperation,
            requestLogsOpenAI,
            responseErrorLogsOpenAI,
            quantityOfCallsToFalconFlowAPI,
            requestLogsFalconFlowAPI,
            responseErrorLogsFalconFlowAPI,  
            usage,
            price,
            billingBy,
            billingUnit, 
            companyId,
            total_cost: calculateApiUsage(price, billingUnit, usage, billingBy)
        })

        return res.status(StatusCodes.OK).json({ apiUsage })

    }

    res.status(StatusCodes.NOT_FOUND).json({ msg: `Price not found for ${product} in the API Pricing table` })

}

const getUsage = async (req, res) => {

    const { startDate, endDate, companyId, } = req.body

    mustContainProperties(req, ['startDate', 'endDate', 'companyId'])

    const total = await billingSumUsage(startDate, endDate, companyId)

    if (total) {
        const usage = await API_Usage.find({
            createdAt: {
                $gte: moment(startDate, 'YYYY-MM-DD').startOf('day').toDate(),
                $lte: moment(endDate, 'YYYY-MM-DD').endOf('day').toDate()
            },
        })

        return res.status(StatusCodes.OK).json({ usage, total })
    }

    return res.status(StatusCodes.NOT_FOUND).json({})

}

module.exports = {
    setApiPricing,
    registerUsage,
    getUsage
}