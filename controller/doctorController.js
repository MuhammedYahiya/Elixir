const bcrypt = require("bcryptjs");
const User = require("../models/users");
const Doctor = require("../models/doctors");



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
