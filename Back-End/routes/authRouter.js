const express = require('express');
const { login } = require('../controller/loginController');
const router = express.Router();

router.route('/auth/login').post(login);

module.exports = router;
