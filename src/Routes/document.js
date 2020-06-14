const router = require('express').Router();
const { verifyToken } = require('../utils/verifyToken');
let upload = require('../../public/database/multer.config.js');
const { create, update, delete_document, getList, get_category, getDetail } = require("../Controllers/document_controller");
let { uploadMultiConfig } = require('../../public/database/multer.config.js');

const { uploadMulti } = require("../utils/file");
router.get('/list', verifyToken, getList);
router.get('/detail/:id', getDetail);
router.post('/create', verifyToken, uploadMultiConfig, create);
router.put('/update', verifyToken, uploadMultiConfig, update);
router.delete('/delete/:id', verifyToken,delete_document);
router.get('/list-cate', get_category);
module.exports = router;