const express = require('express')
const router = express.Router()
const { authorization, } = require('../middleware/authentication') 
const { setApiPricing, registerUsage, getUsage, registerAPICall, registerOperation, registerAll} = require('../controllers/apiUsagePricing')

router.route('/create').post(authorization, setApiPricing)  
router.route('/usage').post(authorization, registerUsage)
router.route('/report').post(authorization, getUsage)  
router.route('/api-call').post(authorization, registerAPICall)  
router.route('/api-operation').post(authorization, registerOperation)  
router.route('/api-register-all').post(authorization, registerAll)  



module.exports = router
