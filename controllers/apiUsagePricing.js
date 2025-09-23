const { StatusCodes } = require("http-status-codes")
const API_Pricing = require("../models/API_Pricing.js")
const mongoose = require('mongoose');
const {
    mustContainProperties,
    calculateApiUsage,
} = require('../utils')
const API_Usage = require("../models/API_Usage.js")
const API_Products = require("../models/API_Products.js")
const billingSumUsage = require("../utils/billingSumUsage.js")
const moment = require('moment')
const API_Call = require("../models/API_Call.js")
const API_Operation = require("../models/API_Operation.js")
const API_Usage_Whatsapp = require("../models/API_Usage_Whatsapp.js")

const setApiPricing = async (req, res) => {

    const { provider, product, currency, price, billingBy, billingUnit, type, clientPrice, format } = req.body

    mustContainProperties(req, ['provider',
        'product',
        'price',
        'billingBy',
        'billingUnit'])

    const normalizedProvider = provider.trim().toLowerCase()
    const normalizedProduct = product.trim().toLowerCase()

    let filter = { provider: normalizedProvider, product: normalizedProduct }

    if(format){
        filter = {...filter, format}
    }

    if (type) {
        filter = { ...filter, type }
    }

    const update = {
        provider: normalizedProvider,
        product: normalizedProduct,
        currency,
        price,
        billingBy,
        billingUnit,
        type,
        clientPrice,
        format
    }
    const options = { new: true, upsert: true }

    const apiPricing = await API_Pricing.findOneAndUpdate(filter, update, options)

    res.status(StatusCodes.OK).json({ apiPricing })
}

const updateProductPricing = async (req, res) => {
    const { price, name, description } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'ID do produto inválido.'
        });
    }

    let existingProduct = await API_Products.findById(id);

    if (!existingProduct) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: 'Produto não encontrado.'
        });
    }

    if (price) {
        const activePriceIndex = existingProduct.priceHistory.findIndex(priceEntry => !priceEntry.endDate);

        if (activePriceIndex !== -1 && existingProduct.priceHistory[activePriceIndex].price != price) {
            existingProduct.priceHistory[activePriceIndex].endDate = new Date();
        }
        else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                msg: `Product with the same price ${price}`
            });
        }
    }

    const newPriceEntry = {
        startDate: new Date(),
        endDate: null, // Novo preço ativo
        price
    };

    if (description) existingProduct.description = description.trim();
    if (name) existingProduct.name = name.trim();
    if (price) existingProduct.priceHistory.push(newPriceEntry);

    await existingProduct.save();

    res.status(StatusCodes.OK).json({
        msg: 'Preço do produto atualizado com sucesso!',
        product: existingProduct
    });

};

const setProductPricing = async (req, res) => {
    const { name, description, price } = req.body;

    console.log("price: ", price)

    mustContainProperties(req, ['name']);

    const normalizedName = name.trim();

    let existingProduct = await API_Products.findOne({ name: normalizedName });

    if (existingProduct) {
        if (price) {

            const activePriceIndex = existingProduct.priceHistory.findIndex(priceEntry => !priceEntry.endDate);

            if (activePriceIndex !== -1 && existingProduct.priceHistory[activePriceIndex].price != price) {
                existingProduct.priceHistory[activePriceIndex].endDate = new Date();
            }
            else {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    msg: `Product with the same price ${price}`
                });
            }

            const newPriceEntry = {
                startDate: new Date(),
                endDate: null, // Novo preço ativo
                price
            };

            existingProduct.priceHistory.push(newPriceEntry);

            if (description) existingProduct.description = description.trim();

            await existingProduct.save();

            return res.status(StatusCodes.OK).json({
                msg: 'Preço do produto atualizado com sucesso!',
                product: existingProduct
            });
        } else {
            return res.status(StatusCodes.CONFLICT).json({
                error: 'Produto já existe. Para atualizar o preço, forneça o campo "price".',
                product: existingProduct
            });
        }
    }

    // Se o produto não existe, criar um novo
    const productData = {
        name: normalizedName,
        description: description?.trim() || '',
        priceHistory: []
    };

    if (price) {
        const priceEntry = {
            startDate: new Date(), // Data atual automática
            endDate: null, // Preço ativo (sem data de fim)
            price,
        };

        productData.priceHistory.push(priceEntry);
    }

    console.log('---------> Dados do produto a ser criado:', productData);

    // Criar o produto
    const newProduct = new API_Products(productData);
    await newProduct.save();

    res.status(StatusCodes.CREATED).json({
        msg: 'Produto criado com sucesso!',
        product: newProduct
    });
};

const listProductPricing = async (req, res) => {
     
    const products = await API_Products.find();

    res.status(StatusCodes.OK).json({
        msg: 'ok', 
        products
    })

}

const registerUsage = async (req, res) => {
    const {
        provider,
        product,
        usage,
        callerId,
        sessionId,
        companyId,
        format

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
        format: format?.trim().toLowerCase()
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
            total_cost: calculateApiUsage(price, billingUnit, usage),
            format
        })

        return res.status(StatusCodes.OK).json({ apiUsage })

    }

    res.status(StatusCodes.NOT_FOUND).json({ msg: `Price not found for ${product} in the API Pricing table` })

}

const registerWhatsappUsage = async (req, res) => {
    const {
        companyId,
        companyPhone,
        clientPhone,
        provider,
        product,
        type,
        msgId,
        ticketId,
        ticketUrl,
        billable,
        pricing_model,
    } = req.body

    mustContainProperties(req, [
        'companyId',
        'provider',
        'product',
        'type',
        'msgId',
        'ticketId',
        'billable',
        'pricing_model',
        'companyPhone',
        'clientPhone',
    ])

    const apiPricing = await API_Pricing.findOne({
        provider: provider.trim().toLowerCase(),
        product: product.trim().toLowerCase(),
        type: type.trim().toLowerCase(),
    })


    if (apiPricing) {

        const { price } = apiPricing

        const apiUsageWhatsapp = await API_Usage_Whatsapp.create({
            companyId,
            companyPhone,
            clientPhone,
            provider: provider.trim().toLowerCase(),
            product: product.trim().toLowerCase(),
            price,
            msgId,
            ticketId,
            ticketUrl,
            billable,
            pricing_model,
            type
        })

        return res.status(StatusCodes.OK).json({ apiUsageWhatsapp })

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
    setProductPricing,
    updateProductPricing,
    listProductPricing,
    registerUsage,
    registerAPICall,
    registerOperation,
    getUsage,
    registerAll,
    registerWhatsappUsage
}