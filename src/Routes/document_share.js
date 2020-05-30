const router = require('express').Router();
const {verifyToken} = require('../utils/verifyToken');
const { share_document, get_docs_share, re_share, dele_user_shared, delete_docs_share, update,search_document_share } = require("../Controllers/document_share");
router.post('/share',verifyToken, share_document); // share document
router.post('/re-share',verifyToken, re_share);
router.get('/get_docs_share/',verifyToken, get_docs_share); //Get detail document
router.get('/search',search_document_share)
router.put('/update', update);
router.delete('/delete-user-shared', dele_user_shared);
router.delete('/delete-docs-shared', delete_docs_share);
module.exports = router;