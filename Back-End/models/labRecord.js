const mongoose = require("mongoose");

const labRecordSchema = new mongoose.Schema({
  patient_id: {
    type: String, 
    required: true,
  },
  lab_id: {
    type: String,  
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LabRecord", labRecordSchema);