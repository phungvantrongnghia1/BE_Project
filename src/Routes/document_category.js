const router = require('express').Router();
const { create_document_cate, update_document_cate, delete_document_cate,get_document_cate } = require("../Controllers/document_cate_controller")
router.get('/list-document-cate',get_document_cate)
router.post('/create-document-cate', create_document_cate)
router.put('/update-document-cate', update_document_cate)
router.delete('/delete-document-cate/:id', delete_document_cate)
module.exports = router;