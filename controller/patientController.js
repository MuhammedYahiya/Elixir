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


