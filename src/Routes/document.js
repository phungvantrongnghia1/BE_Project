const router = require('express').Router();
const {verifyToken} = require('../utils/verifyToken');
const { create, update,delete_document,getList,getListByID } = require("../Controllers/document_controller");
const { uploadMulti } = require("../utils/file");
router.get('/list/:id',verifyToken,getList);
// router.get('/list/:id',getListByID);
router.post('/create', uploadMulti, create)
router.put('/update', uploadMulti, update)
router.delete('/delete/:id', delete_document)

module.exports = router;