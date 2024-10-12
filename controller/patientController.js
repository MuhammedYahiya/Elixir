const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Patient = require("../models/patient");
const MedicalRecord = require("../models/medicalRecord");

exports.patientSignup = async (req, res) => {
  const {
    unique_id,
    fullName,
    username,
    dob,
    gender,
    mobile,
    email,
    password,
  } = req.body;

  try {
    const existingUser = await User.findOne({ unique_id });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this ID already exists", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      unique_id,
      user_type: "Patient",
      password: hashedPassword,
    });

    await newUser.save();

    const newPatient = new Patient({
      unique_id,
      fullName,
      username,
      dob,
      gender,
      mobile,
      email,
    });

    await newPatient.save();

    return res
      .status(201)
      .json({ message: "Patient registered successfully", success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Signup failed", success: false, error: error.message });
  }
};

exports.viewPatientProfile = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decodedToken.id;
    const requesterType = decodedToken.user_type;

    let patient;

    if (req.params.patient_id) {
      patient = await Patient.findOne({ unique_id: req.params.patient_id });
    } else {
      patient = await Patient.findOne({ unique_id: requesterId });
    }

    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });
    }

    if (requesterId === patient.unique_id || patient.is_profile_public) {
      return res.status(200).json({ patient, success: true });
    }

    if (requesterType === "Doctor" && patient.is_profile_public) {
      return res.status(200).json({ patient, success: true });
    }

    return res
      .status(403)
      .json({ message: "Unauthorized access", success: false });
  } catch (error) {
    console.error("Error viewing patient profile:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

exports.toggleProfileVisibility = async (req, res) => {
  const { is_profile_public } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decodedToken.id;

    const updatedPatient = await Patient.findOneAndUpdate(
      { unique_id: requesterId },
      { is_profile_public },
      { new: true }
    );

    if (!updatedPatient) {
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });
    }

    return res.status(200).json({
      message: `Profile visibility updated to ${
        is_profile_public ? "public" : "private"
      }`,
      success: true,
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating profile visibility:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

exports.fetchMedicalRecords = async (req, res) => {
  const { patient_id } = req.params;
  const token = req.headers.authorization.split(" ")[1]; 
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decodedToken.id;

    if (requesterId !== patient_id) {
      return res.status(403).json({ message: "Access denied: unauthorized access", success: false });
    }

    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found", success: false });
    }

    const records = await MedicalRecord.find({ patient_id: patient.unique_id }); 

    const formattedRecords = records.map(record => ({
      record_id: record._id, 
      record_type: record.record_type,
      description: record.description,
      date: record.date,
    }));

    return res.status(200).json({ success: true, records: formattedRecords });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return res.status(500).json({ message: "Failed to fetch medical records", success: false, error: error.message });
  }
};

exports.fetchMedicalRecordById = async (req, res) => {
  const { patient_id, record_id } = req.params; 
  const token = req.headers.authorization.split(" ")[1]; 

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decodedToken.id; 

    if (requesterId !== patient_id) {
      return res.status(403).json({ message: "Access denied: unauthorized access", success: false });
    }

    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found", success: false });
    }

    const record = await MedicalRecord.findOne({ _id: record_id, patient_id: patient.unique_id }); 

    if (!record) {
      return res.status(404).json({ message: "Medical record not found", success: false });
    }

 
    const formattedRecord = {
      record_id: record._id, 
      record_type: record.record_type,
      description: record.description,
      date: record.date,
    };

    return res.status(200).json({ success: true, record: formattedRecord });
  } catch (error) {
    console.error("Error fetching medical record:", error);
    return res.status(500).json({ message: "Failed to fetch medical record", success: false, error: error.message });
  }
};