const express = require('express')
const { patientSignup } = require('../controller/patientController')
const router = express.Router()

router.route('/patient/signup').post(patientSignup)


module.exports = router;