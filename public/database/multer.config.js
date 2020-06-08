const multer = require('multer');
 
var storage = multer.memoryStorage()
var upload = multer({storage: storage});
 
module.exports.upload = module.exports.uploadMulti = (upload.fields([{ name: 'file', maxCount:  8}, { name: 'image', maxCount: 8 }])), (req, res, next) => {
    next();
}