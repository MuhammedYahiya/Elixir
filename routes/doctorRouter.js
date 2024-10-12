const express = require('express');
const { doctorSignup, createMedicalRecord } = require('../controller/doctorController');
const { viewPatientProfile } = require('../controller/patientController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/doctor/signup').post(doctorSignup);
router.route('/patient/:patient_id').get(authMiddleware('Doctor'),viewPatientProfile);
router.route("/doctors/:doctor_id/records").post(authMiddleware("Doctor"), createMedicalRecord);

module.exports = router;