const router = require('express').Router();
const { share_document,get_docs_share,dele_user_shared,delete_docs_share,derection_share} = require("../Controllers/document_share");
router.post('/share',share_document);
router.post('/derect-share',derection_share);
router.get('/get_docs_share/:id',get_docs_share);
router.delete('/delete-user-shared',dele_user_shared);
router.delete('/delete-docs-shared',delete_docs_share);
module.exports = router;