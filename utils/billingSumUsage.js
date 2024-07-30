const moment = require('moment')
const API_Usage = require("../models/API_Usage.js")

async function billingSumUsage(startDate, endDate, companyId) {
    try {
        const start = moment(startDate, 'YYYY-MM-DD').startOf('day').toDate()
        const end = moment(endDate, 'YYYY-MM-DD').endOf('day').toDate()

        const result = await API_Usage.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end
                    },
                    companyId
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $toDouble: "$price"  
                        }
                    }
                }
            }
        ])

        if (result.length > 0) {
            return result[0].total
        } else {
            return 0
        }
    } catch (error) {
        console.error('Error calculating sum of prices:', error) 
    }
}

module.exports = billingSumUsage
 


