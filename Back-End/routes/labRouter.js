const express = require('express');
const { labSignup, uploadLabReport, updateLabDetails, viewLabDetails } = require('../controller/labController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); // Multer for handling file uploads

const router = express.Router();

// Lab signup
router.post('/signup', labSignup);

// Lab uploading a report
router.post('/:lab_id/reports', authMiddleware('Lab'), upload.single('file'), uploadLabReport);
router.put('/:lab_id/update',authMiddleware(['Lab']),updateLabDetails);
router.get('/:lab_id/view', authMiddleware(['Lab']), viewLabDetails);

module.exports = router;
