const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Patient = require("../models/patient");

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

exports.patientLogin = async (req, res) => {
  const { unique_id, password } = req.body;

  try {
    // Find user by unique ID
    const user = await User.findOne({ unique_id });
    if (!user || user.user_type !== "Patient") {
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // Find patient details
    const patient = await Patient.findOne({ unique_id });
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient details not found", success: false });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { unique_id: patient.unique_id, user_type: user.user_type },
      process.env.JWT_SECRET, // Use your secret key from environment variables
      { expiresIn: "1h" } // Token expiration time
    );

    // Respond with success message and patient data (excluding sensitive info)
    return res.status(200).json({
      message: "Login successful",
      success: true,
      token, // Return the token
      patient: {
        unique_id: patient.unique_id,
        fullName: patient.fullName,
        username: patient.username,
        dob: patient.dob,
        gender: patient.gender,
        mobile: patient.mobile,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Login failed", success: false, error: error.message });
  }
};
