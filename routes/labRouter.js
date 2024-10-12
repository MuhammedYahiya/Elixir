const express = require('express');
const { labSignup } = require('../controller/labController'); 

const router = express.Router();


router.route('/lab/signup').post(labSignup);

module.exports = router;
