const mongoose = require('mongoose')

const connectDB = async () => {
  await mongoose.connect(process.env.DB_MONGO_URL, { dbName: process.env.DB_MONGO_NAME })
}

connectDB().catch((err) => console.log(err))
module.exports = mongoose
