const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        required: true, 
    },
    bill: {
        type: String,
        required: true, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Bill", billSchema); 
