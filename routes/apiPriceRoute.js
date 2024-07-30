const express = require('express')
const router = express.Router()
const { authorization, } = require('../middleware/authentication') 
const { setApiPricing, registerUsage, getUsage} = require('../controllers/apiUsagePricing')

router.route('/create').post(authorization, setApiPricing)  
router.route('/usage').post(authorization, registerUsage)
router.route('/report').post(authorization, getUsage)  



module.exports = router
