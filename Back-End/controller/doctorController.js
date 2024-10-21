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

exports.viewDoctorDetails = async (req, res) => {
  const { doctorId } = req.params; // Using doctorId as the unique_id

  try {
    // Find the doctor details from the Doctor collection
    const doctor = await Doctor.findOne({ unique_id: doctorId });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }

    // Find the user details from the User collection, excluding the password
    const user = await User.findOne({ unique_id: doctorId }, '-password');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Combine details from both collections (User and Doctor)
    const doctorDetails = {
      unique_id: user.unique_id,
      user_type: user.user_type,
      fullName: doctor.fullName,
      email: doctor.email,
      age: doctor.age,
      gender: doctor.gender,
      specialization: doctor.specialization,
    };

    return res.status(200).json({
      message: "Doctor details retrieved successfully",
      success: true,
      data: doctorDetails,
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return res.status(500).json({
      message: "Failed to retrieve doctor details",
      success: false,
      error: error.message,
    });
  }
};

exports.editDoctorProfile = async (req, res) => {
  const { doctorId } = req.params; // Extracting doctorId (which is unique_id) from request parameters
  const { fullName, email, age, gender, specialization } = req.body; // Extracting the fields that can be updated

  try {
    // Find the doctor profile using the unique_id
    const doctor = await Doctor.findOne({ unique_id: doctorId });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }

    // Update the doctor fields with the provided data, if available
    doctor.fullName = fullName || doctor.fullName;
    doctor.email = email || doctor.email;
    doctor.age = age || doctor.age;
    doctor.gender = gender || doctor.gender;
    doctor.specialization = specialization || doctor.specialization;

    // Save the updated doctor details
    await doctor.save();

    return res.status(200).json({
      message: "Doctor profile updated successfully",
      success: true,
      data: {
        unique_id: doctor.unique_id,
        fullName: doctor.fullName,
        email: doctor.email,
        age: doctor.age,
        gender: doctor.gender,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return res.status(500).json({
      message: "Failed to update doctor profile",
      success: false,
      error: error.message,
    });
  }
};


