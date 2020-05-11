const router = require('express').Router();
const { share_document,get_docs_share,dele_user_shared} = require("../Controllers/document_share");
const { upload } = require("../utils/file");
router.post('/share',share_document);
router.get('/get_docs_share/:id',get_docs_share);
router.delete('/delete-user-shared',dele_user_shared);
// router.post('/create', upload, create)
// router.put('/update', upload, update)
// router.delete('/delete/:id', delete_document)

module.exports = router;