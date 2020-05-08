const router = require('express').Router();
const { login, register } = require("../Controllers/auth_controller");
router.post('/register', register)
router.post('/login', login)
module.exports = router;