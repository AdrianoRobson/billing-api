const express = require('express')
const router = express.Router()
const { authorization, } = require('../middleware/authentication') 
const { setApiPricing, 
    setProductPricing,
    updateProductPricing,
    listProductPricing,
    registerUsage, 
    getUsage, 
    registerAPICall, 
    registerOperation, 
    registerAll,
registerWhatsappUsage} = require('../controllers/apiUsagePricing')

router.route('/create').post(authorization, setApiPricing)  
router.route('/create-product').post(authorization, setProductPricing)
router.route('/create-product').get(authorization, listProductPricing)
router.route('/create-product/:id').patch(authorization, updateProductPricing)
router.route('/usage').post(authorization, registerUsage)
router.route('/usage-whatsapp').post(authorization, registerWhatsappUsage)  
router.route('/report').post(authorization, getUsage)  
router.route('/api-call').post(authorization, registerAPICall)  
router.route('/api-operation').post(authorization, registerOperation)  
router.route('/api-register-all').post(authorization, registerAll)  

module.exports = router
