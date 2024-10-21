const bcrypt = require("bcryptjs");
const fs = require("fs");
const User = require("../models/users");
const Lab = require("../models/lab");
const cloudinary = require("../config/cloudinary");
const LabRecord = require("../models/labRecord");
const Patient = require("../models/patient");

exports.labSignup = async (req, res) => {
  const { unique_id, name, email, branch, password } = req.body;

  try {
    const existingUser = await User.findOne({ unique_id });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this unique ID already exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      unique_id,
      user_type: "Lab",
      password: hashedPassword,
    });

    await newUser.save();

    const newLab = new Lab({
      unique_id,
      name,
      email,
      branch,
    });

    await newLab.save();

    return res.status(201).json({
      message: "Lab registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Signup failed",
      success: false,
      error: error.message,
    });
  }
};

exports.updateLabDetails = async (req, res) => {
  const { lab_id } = req.params; // `lab_id` corresponds to `unique_id` in the Lab model.
  const { name, email, branch } = req.body;

  try {
    // Find the lab by unique_id and update the details
    const updatedLab = await Lab.findOneAndUpdate(
      { unique_id: lab_id }, // Using `unique_id` field for lookup
      { name, email, branch },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators: true` ensures validation
    );

    // If lab not found
    if (!updatedLab) {
      return res.status(404).json({
        message: "Lab not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Lab details updated successfully",
      success: true,
      data: updatedLab,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      message: "Failed to update lab details",
      success: false,
      error: error.message,
    });
  }
};

exports.viewLabDetails = async (req, res) => {
  const { lab_id } = req.params; // `lab_id` corresponds to `unique_id` in the Lab model.

  try {
    // Find the lab by unique_id
    const lab = await Lab.findOne({ unique_id: lab_id });

    // If lab not found
    if (!lab) {
      return res.status(404).json({
        message: "Lab not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Lab details retrieved successfully",
      success: true,
      data: lab,
    });
  } catch (error) {
    console.error("View error:", error);
    return res.status(500).json({
      message: "Failed to retrieve lab details",
      success: false,
      error: error.message,
    });
  }
};



exports.uploadLabReport = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { patient_id } = req.body;
    const lab_id = req.params.lab_id;

    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const lab = await Lab.findOne({ unique_id: lab_id });
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    console.log(result);

    const labRecord = await LabRecord.create({
      patient_id: patient.unique_id,
      lab_id: lab.unique_id,
      file_url: result.secure_url,
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Lab report uploaded successfully",
      labRecord,
    });
  } catch (error) {
    console.error("Error uploading lab report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload lab report",
      error: error.message,
    });
  }
};
