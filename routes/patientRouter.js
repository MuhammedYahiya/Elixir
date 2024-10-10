const express = require('express')
const { patientSignup, patientLogin } = require('../controller/patientController')
const router = express.Router()

router.route('/patient/signup').post(patientSignup)
router.route('/auth/login').post(patientLogin);

module.exports = router;