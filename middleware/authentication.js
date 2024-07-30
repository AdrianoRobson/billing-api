const CustomError = require('../errors') 

const authorization = async (req, res, next) => { 

    const authHeader = req.headers.authorization

    if (!authHeader) {
        throw new CustomError.BadRequestError('Authorization not found into header!')
    }

    const [, token] = authHeader.split(" "); 

    if (!token) {
        throw new CustomError.BadRequestError('Authorization token not found into header!')
    }

    if (token != process.env.TOKEN){
        throw new CustomError.UnauthorizedError('Authorization token Invalid')
    }

    next() 
     
}

const authorizePermissions = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError('Unauthorized do access to this routes')
        }

        next()
    }

}

module.exports = {
    authorization,
    authorizePermissions,
}