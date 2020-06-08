let express = require('express');
let router = express.Router();
let {upload} = require('../../public/database/multer.config.js');
 
const awsWorker = require('../Controllers/test');
 
router.post('/file', upload, awsWorker.doUpload);
 
module.exports = router;