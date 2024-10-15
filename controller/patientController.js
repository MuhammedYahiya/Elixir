const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const User = require("../models/users");
const Patient = require("../models/patient");
const MedicalRecord = require("../models/medicalRecord");
const LabRecord = require("../models/labRecord");
const Lab = require("../models/lab");
const Bill = require("../models/bill");
const cloudinary = require("../config/cloudinary");
const Prescription = require("../models/prescription");

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

exports.viewAllPatients = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requesterType = decodedToken.user_type;

    if (requesterType !== "Doctor" && requesterType !== "Lab") {
      return res
        .status(403)
        .json({ message: "Unauthorized access", success: false });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const patients = await Patient.find()
      .skip(skip)
      .limit(limit)
      .select("unique_id fullName is_profile_public");

    const totalPatients = await Patient.countDocuments();

    return res.status(200).json({
      patients,
      currentPage: page,
      totalPages: Math.ceil(totalPatients / limit),
      totalPatients,
      success: true,
    });
  } catch (error) {
    console.error("Error viewing all patients:", error);
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
      return res.status(403).json({
        message: "Access denied: unauthorized access",
        success: false,
      });
    }

    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });
    }

    const records = await MedicalRecord.find({ patient_id: patient.unique_id });

    const formattedRecords = records.map((record) => ({
      record_id: record._id,
      record_type: record.record_type,
      description: record.description,
      date: record.date,
    }));

    return res.status(200).json({ success: true, records: formattedRecords });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return res.status(500).json({
      message: "Failed to fetch medical records",
      success: false,
      error: error.message,
    });
  }
};

exports.fetchMedicalRecordById = async (req, res) => {
  const { patient_id, record_id } = req.params;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decodedToken.id;

    if (requesterId !== patient_id) {
      return res.status(403).json({
        message: "Access denied: unauthorized access",
        success: false,
      });
    }

    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });
    }

    const record = await MedicalRecord.findOne({
      _id: record_id,
      patient_id: patient.unique_id,
    });

    if (!record) {
      return res
        .status(404)
        .json({ message: "Medical record not found", success: false });
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
    return res.status(500).json({
      message: "Failed to fetch medical record",
      success: false,
      error: error.message,
    });
  }
};

exports.getPatientLabReports = async (req, res) => {
  const patient_id = req.user.id;

  try {
    const labReports = await LabRecord.find({ patient_id });

    if (!labReports.length) {
      return res.status(404).json({
        success: false,
        message: "No lab reports found for this patient.",
      });
    }

    const labIds = labReports.map((report) => report.lab_id);
    const labs = await Lab.find({ unique_id: { $in: labIds } });

    const labMap = labs.reduce((acc, lab) => {
      acc[lab.unique_id] = { name: lab.name, branch: lab.branch };
      return acc;
    }, {});

    const formattedReports = labReports.map((report) => ({
      lab_name: labMap[report.lab_id]?.name || "Unknown Lab",
      lab_branch: labMap[report.lab_id]?.branch || "Unknown Branch",
      file_url: report.file_url,
      createdAt: report.createdAt,
    }));

    res.status(200).json({
      success: true,
      labReports: formattedReports,
    });
  } catch (error) {
    console.error("Error fetching lab reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lab reports",
      error: error.message,
    });
  }
};

exports.uploadBills = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const patient_id = req.user.id;

    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    const billRecord = await Bill.create({
      patient_id: patient.unique_id,
      bill: result.secure_url,
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Bill uploaded successfully",
      billRecord,
    });
  } catch (error) {
    console.error("Error uploading bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload bill",
      error: error.message,
    });
  }
};

exports.viewUploadedBills = async (req, res) => {
  try {
    const patientId = req.user.id; 

    const bills = await Bill.find({ patient_id: patientId });

    if (!bills.length) {
      return res.status(404).json({ success: false, message: "No bills found for this patient." });
    }

    const formattedBills = bills.map(bill => ({
      bill_id: bill._id,
      bill_url: bill.bill,
      createdAt: bill.createdAt,
    }));

    return res.status(200).json({
      success: true,
      bills: formattedBills,
    });
  } catch (error) {
    console.error("Error fetching uploaded bills:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
      error: error.message,
    });
  }
};

exports.uploadPrescription = async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const patient_id = req.user.id;

      const department = req.params.department; 

      const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
      });

      const prescriptionRecord = await Prescription.create({
          patient_id: patient_id,
          department: department, 
          prescription_file: result.secure_url,
      });

      fs.unlinkSync(req.file.path);

      res.status(201).json({
          success: true,
          message: "Prescription uploaded successfully",
          prescriptionRecord,
      });
  } catch (error) {
      console.error("Error uploading prescription:", error);
      res.status(500).json({
          success: false,
          message: "Failed to upload prescription",
          error: error.message,
      });
  }
};
