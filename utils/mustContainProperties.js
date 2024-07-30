const CustomError = require('../errors')

function mustContainProperties(req, requiredProperties) { 
    
    const missingProperties = requiredProperties.filter(prop => !req.body[prop])

    if (missingProperties.length > 0) {
        throw new CustomError.BadRequestError(`Missing properties: ${missingProperties.join(', ')}`)
    }
}

module.exports = mustContainProperties