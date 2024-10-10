const mongoose = require("mongoose");
const validator = require("validator")

const patientSchema = new mongoose.Schema({
  unique_id: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    validate: [validator.isEmail, "Invalid email address"],
  },
  privacy_settings: {
    can_view: [
      {
        user_type: { type: String, enum: ["Doctor", "Lab"] },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        access_level: { type: String, enum: ["View", "Edit", "Restricted"] },
      },
    ],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
