const router = require('express').Router();
const { create, update,delete_document,getList,getListByID } = require("../Controllers/document_controller");
const { upload,uploadMulti } = require("../utils/file");
router.get('/list',getList);
router.get('/list/:id',getListByID);
router.post('/create', uploadMulti, create)
router.put('/update', upload, update)
router.delete('/delete/:id', delete_document)

module.exports = router;