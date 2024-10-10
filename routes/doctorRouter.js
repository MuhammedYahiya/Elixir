const express = require('express');
const { doctorSignup } = require('../controller/doctorController');

const router = express.Router();

router.route('/doctor/signup').post(doctorSignup);

module.exports = router;