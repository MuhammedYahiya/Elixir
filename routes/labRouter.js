const express = require('express');
const { labSignup, uploadLabReport } = require('../controller/labController'); 
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); 

const router = express.Router();


router.route('/lab/signup').post(labSignup);
router.post('/lab/:lab_id/upload-lab-report', authMiddleware(['Lab']), upload.single('file_url'), uploadLabReport);


module.exports = router;
