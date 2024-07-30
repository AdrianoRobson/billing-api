const multer = require('multer')
const path = require('path')

//Destination to store the file
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `public/uploads`)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname))
    }
})

const audioUpload = multer({
    storage: audioStorage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(mp3|wav|ogg|flac|aac|wma|m4a|mp4|webm|opus|mpeg)$/i)) {
            return cb(new Error('Invalid file type. Send only an audio file!'))
        }
        cb(undefined, true)
    }

})

module.exports = audioUpload 