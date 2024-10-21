const express = require('express');
const { doctorSignup, createMedicalRecord } = require('../controller/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Doctor signup
router.post('/signup', doctorSignup);

// Creating medical records by doctor
router.post('/:doctor_id/records', authMiddleware('Doctor'), createMedicalRecord);

module.exports = router;
