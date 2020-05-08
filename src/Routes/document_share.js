const router = require('express').Router();
const { share_document} = require("../Controllers/document_share");
const { upload } = require("../utils/file");
router.post('/share',share_document);
// router.get('/list/:id',getListByID);
// router.post('/create', upload, create)
// router.put('/update', upload, update)
// router.delete('/delete/:id', delete_document)

module.exports = router;