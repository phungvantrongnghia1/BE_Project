let express = require('express');
let router = express.Router();
let {uploadMultiConfig} = require('../../public/database/multer.config.js');
 
const awsWorker = require('../Controllers/test');
 
router.post('/file', uploadMultiConfig, awsWorker.doUpload);
router.get('/get-file',awsWorker.getfile)
module.exports = router;