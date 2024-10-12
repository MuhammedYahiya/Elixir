const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  record_id: { 
    type: String, 
    unique: true 
  },
  patient_id: {
    type: String,
    required: true,
    ref: "Patient", 
  },
  doctor_id: {
    type: String,
    required: true,
    ref: "Doctor", 
  },
  record_type: {
    type: String,
    enum: ["Prescription", "Lab Report", ], 
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

module.exports = MedicalRecord;
