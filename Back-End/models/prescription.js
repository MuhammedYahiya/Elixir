const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        default: "General Medicine", // You can set a default or make it dynamic
    },
    prescription_file: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
