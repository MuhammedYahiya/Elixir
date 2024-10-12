const bcrypt = require("bcryptjs");
const User = require("../models/users");
const Doctor = require("../models/doctors");
const Patient = require("../models/patient");
const MedicalRecord = require("../models/medicalRecord");
const { v4: uuidv4 } = require('uuid');



exports.doctorSignup = async (req, res) => {
  const { unique_id, fullName, email, age, gender, specialization, password } =
    req.body;

  try {
    const existingUser = await User.findOne({ unique_id: unique_id });
    if (existingUser) {
      return res
        .status(400)
        .json({
          message: "User with this license ID already exists",
          success: false,
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      unique_id: unique_id,
      user_type: "Doctor",
      password: hashedPassword,
    });

    await newUser.save();

    const newDoctor = new Doctor({
      unique_id,
      fullName,
      email,
      age,
      gender,
      specialization,
    });

    await newDoctor.save();

    return res
      .status(201)
      .json({ message: "Doctor registered successfully", success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Signup failed", success: false, error: error.message });
  }
};



exports.createMedicalRecord = async (req, res) => {
  const { patient_id, record_type, description } = req.body;
  const doctor_id = req.params.doctor_id;

  try {
   
    if (!patient_id || !record_type || !description || !doctor_id) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    
    const patient = await Patient.findOne({ unique_id: patient_id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found", success: false });
    }

    
    const doctor = await Doctor.findOne({ unique_id: doctor_id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found", success: false });
    }

    
    const newRecord = new MedicalRecord({
      record_id: uuidv4(),
      patient_id: patient.unique_id,
      doctor_id: doctor.unique_id,
      record_type,
      description,
    });

    
    console.log("Creating new medical record:", newRecord);

    
    await newRecord.save();

    
    return res.status(201).json({
      message: "Medical record created successfully",
      success: true,
      record: {
        record_id: newRecord.record_id, 
        patient_id: newRecord.patient_id,
        doctor_id: newRecord.doctor_id,
        record_type: newRecord.record_type,
        description: newRecord.description,
        date: newRecord.date,
      },
    });
  } catch (error) {
    console.error("Error creating medical record:", error);
    return res.status(500).json({
      message: "Failed to create medical record",
      success: false,
      error: error.message,
    });
  }
};
