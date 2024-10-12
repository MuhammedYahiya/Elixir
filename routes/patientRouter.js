const express = require('express')
const { patientSignup, viewPatientProfile, toggleProfileVisibility } = require('../controller/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router()

router.route('/patient/signup').post(patientSignup)
router.route('/patient/me').get(authMiddleware('Patient'),viewPatientProfile);
router.route('/patient/toggle-visibility').post(authMiddleware('Patient'), toggleProfileVisibility);


module.exports = router;