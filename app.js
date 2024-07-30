require('dotenv').config()
require('express-async-errors')

// express 
const express = require('express')
const app = express()

// rest of the packages
const morgan = require('morgan')
// const fileUpload = require('express-fileupload')

const rateLimiter = require('express-rate-limit')

// Swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml') 

const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')  
 
// routers   
const apiPricingRouter = require('./routes/apiPriceRoute')

const notFoundMiddlware = require('./middleware/not-found')
// const errorHandlerMiddleware = require('./middleware/error-handler')

//middleware
app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
}))
 
// Security packages
app.use(helmet())
app.use(cors())
app.use(xss())

app.use(morgan('tiny'))
app.use(express.json())
 
// app.use(fileUpload())

app.get('/', (req, res) => {
    res.send('<h1>Billing API</h1><a href="/api-docs">Documentation</a>')
}) 

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  
app.use('/api/v1/billing', apiPricingRouter)

app.use(notFoundMiddlware)
// app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

app.listen(port, console.log(`Listening on port: ${port}...`))
