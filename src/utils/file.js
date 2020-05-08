const fs = require('fs');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/file')
    },
    filename: function (req, file, cb) {
        let ext = file.mimetype;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext.substring(ext.lastIndexOf('/') + 1, ext.length)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage })
module.exports.upload = (upload.single('file')), (req, res, next) => {
    next();
}
module.exports.removeFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            return
        }
    })
}