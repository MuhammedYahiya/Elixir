const express = require('express')
const { patientSignup, viewPatientProfile, toggleProfileVisibility, fetchMedicalRecords, fetchMedicalRecordById, viewAllPatients, getPatientLabReports, uploadBills, viewUploadedBills, uploadPrescription, getPatientPrescriptions } = require('../controller/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router()
const upload = require('../config/multerConfig');

router.route('/patient/signup').post(patientSignup)
router.route('/patient/me').get(authMiddleware('Patient'),viewPatientProfile);
router.route('/patient/toggle-visibility').post(authMiddleware('Patient'), toggleProfileVisibility);
router.get("/patients/:patient_id/records", authMiddleware("Patient"), fetchMedicalRecords);
router.route('/patients/:patient_id/records/:record_id').get(authMiddleware('Patient'), fetchMedicalRecordById);
router.route('/patients/all').get(authMiddleware(['Doctor', 'Lab']), viewAllPatients);
router.get('/patient/lab/reports', authMiddleware(['Patient']), getPatientLabReports);
router.post('/patient/bill/upload-bill', authMiddleware('Patient'), upload.single('file'), uploadBills);
router.get('/patient/bills', authMiddleware('Patient'), viewUploadedBills);
router.post('/patient/prescription/upload/:department', authMiddleware('Patient'), upload.single('file'), uploadPrescription);
router.get('/patient/:patient_id/department/:department', authMiddleware(['Patient', 'Doctor']), getPatientPrescriptions);



module.exports = router;