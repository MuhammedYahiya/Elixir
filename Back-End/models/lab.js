const mongoose = require("mongoose");
const validator = require("validator");

const labSchema = new mongoose.Schema({
  unique_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    validate: [validator.isEmail, "Invalid email address"],
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
 
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const lab = mongoose.model("Lab", labSchema);

module.exports = lab;
