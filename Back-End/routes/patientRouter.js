const express = require('express');
const {
  patientSignup, 
  viewPatientProfile, 
  toggleProfileVisibility, 
  fetchMedicalRecords, 
  fetchMedicalRecordById, 
  viewAllPatients, 
  getPatientLabReports, 
  uploadBills, 
  viewUploadedBills, 
  uploadPrescription, 
  getPatientPrescriptions
} = require('../controller/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');
const router = express.Router();

// Patient related routes
router.post('/signup', patientSignup);
router.get('/:patient_id', authMiddleware(['Patient', 'Doctor']), viewPatientProfile);
router.post('/toggle-visibility', authMiddleware('Patient'), toggleProfileVisibility);

// Medical Records
router.get('/:patient_id/records', authMiddleware('Patient'), fetchMedicalRecords);
router.get('/:patient_id/records/:record_id', authMiddleware('Patient'), fetchMedicalRecordById);

// Prescriptions
router.post('/prescriptions/upload/:department', authMiddleware('Patient'), upload.single('file'), uploadPrescription);
router.get('/:patient_id/prescriptions/:department', authMiddleware(['Patient', 'Doctor']), getPatientPrescriptions);

// Bills
router.post('/bills/upload', authMiddleware('Patient'), upload.single('file'), uploadBills);
router.get('/bills', authMiddleware('Patient'), viewUploadedBills);

// Labs
router.get('/:patient_id/reports', authMiddleware('Patient'), getPatientLabReports);

// Admin route
router.get('/patients/all', authMiddleware(['Doctor', 'Lab']), viewAllPatients);

module.exports = router;
