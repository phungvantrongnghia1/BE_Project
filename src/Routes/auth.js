const router = require('express').Router();
const { login, register, updateProfile, changePassword } = require("../Controllers/auth_controller");
const {verifyToken} = require("../utils/verifyToken");
router.post('/register', register)
router.post('/login', login);
router.post('/update-profile',verifyToken,updateProfile);
router.post('/change-password',verifyToken,changePassword);
module.exports = router;