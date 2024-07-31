const { StatusCodes } = require("http-status-codes")
const API_Pricing = require("../models/API_Pricing.js")
const {
    mustContainProperties,
    calculateApiUsage,
} = require('../utils')
const API_Usage = require("../models/API_Usage.js")
const billingSumUsage = require("../utils/billingSumUsage.js")
const moment = require('moment')
const API_Call = require("../models/API_Call.js")
const API_Operation = require("../models/API_Operation.js")

const setApiPricing = async (req, res) => {

    const { provider, product, currency, price, billingBy, billingUnit, type } = req.body

    mustContainProperties(req, ['provider',
        'product',
        'price',
        'billingBy',
        'billingUnit'])

    const normalizedProvider = provider.trim().toLowerCase()
    const normalizedProduct = product.trim().toLowerCase()

    const filter = { provider: normalizedProvider, product: normalizedProduct }
    const update = {
        provider: normalizedProvider,
        product: normalizedProduct,
        currency,
        price,
        billingBy,
        billingUnit,
        type
    }
    const options = { new: true, upsert: true }

    const apiPricing = await API_Pricing.findOneAndUpdate(filter, update, options)

    res.status(StatusCodes.OK).json({ apiPricing })
}

const registerUsage = async (req, res) => {
    const {
        provider,
        product,
        usage,
        callerId,
        sessionId,
        companyId, 

    } = req.body

    mustContainProperties(req, [
        'companyId',
        'callerId',
        'sessionId', 
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
            sessionId, 
            usage,
            price,
            billingBy,
            billingUnit,
            companyId,
            total_cost: calculateApiUsage(price, billingUnit, usage)
        })

        return res.status(StatusCodes.OK).json({ apiUsage })

    }

    res.status(StatusCodes.NOT_FOUND).json({ msg: `Price not found for ${product} in the API Pricing table` })

}

const registerAPICall = async (req, res) => {
    const {
        callerId,
        companyId,
        sessionId,
        type,
        requestLogs,
        responseError,
        quantityOfAPICall
    } = req.body

    mustContainProperties(req, [
        'companyId',
        'callerId',
        'sessionId'
    ])


    const apiCall = await API_Call.create({
        callerId,
        companyId,
        sessionId,
        type,
        requestLogs,
        responseError,
        quantityOfAPICall
    })

    res.status(StatusCodes.OK).json({ apiCall })
}

const registerOperation = async (req, res) => {
    const {
        callerId,
        companyId,
        sessionId,
        operation,
        quantityOfOperationAttempts: quantityOfAttempts,
    } = req.body
  
    mustContainProperties(req, [
        'companyId',
        'callerId',
        'sessionId',
        'operation', 
    ])

    const apiOperation = await API_Operation.create({
        callerId,
        companyId,
        sessionId,
        operation,
        quantityOfAttempts
    })

    res.status(StatusCodes.OK).json({ apiOperation })
}

const registerAll = async (req, res) => {
    const {
        callerId,
        companyId,
        sessionId,
        lstUsage,
        lstRequest,
        lstOperation,
    } = req.body

    if (lstUsage) {
        for (const used of lstUsage) {

            const { product, provider, usage } = used

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
                    sessionId, 
                    usage,
                    price,
                    billingBy,
                    billingUnit,
                    companyId,
                    total_cost: calculateApiUsage(price, billingUnit, usage)
                })

            }

        }
    }
    if (lstRequest) {
        for (const request of lstRequest) {

            const { type,
                requestLogs,
                responseError,
                quantityOfAPICall } = request

            const apiCall = await API_Call.create({
                callerId,
                companyId,
                sessionId,
                type,
                requestLogs,
                responseError,
                quantityOfAPICall
            })

        }
    }
    if (lstOperation) {
        for (const op of lstOperation) {
            const { operation, quantityOfOperationAttempts: quantityOfAttempts } = op

            const apiOperation = await API_Operation.create({
                callerId,
                companyId,
                sessionId,
                operation,
                quantityOfAttempts
            })
        }
    }

    res.send(StatusCodes.OK) 
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
    registerAPICall,
    registerOperation,
    getUsage,
    registerAll
}