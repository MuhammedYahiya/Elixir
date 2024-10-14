const express = require('express')
const { patientSignup, viewPatientProfile, toggleProfileVisibility, fetchMedicalRecords, fetchMedicalRecordById, viewAllPatients } = require('../controller/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router()

router.route('/patient/signup').post(patientSignup)
router.route('/patient/me').get(authMiddleware('Patient'),viewPatientProfile);
router.route('/patient/toggle-visibility').post(authMiddleware('Patient'), toggleProfileVisibility);
router.get("/patients/:patient_id/records", authMiddleware("Patient"), fetchMedicalRecords);
router.route('/patients/:patient_id/records/:record_id').get(authMiddleware('Patient'), fetchMedicalRecordById);
router.route('/patients/all').get(authMiddleware(['Doctor', 'Lab']), viewAllPatients);

module.exports = router;