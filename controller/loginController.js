const bcrypt = require("bcryptjs");
const User = require("../models/users");
const Patient = require("../models/patient");
const Doctor = require("../models/doctors");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { unique_id, password } = req.body;

  try {
    const user = await User.findOne({ unique_id });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign(
      { id: user.unique_id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(user.user_type);
    
    

    let userInfo = null;
    if (user.user_type === "Patient") {
      userInfo = await Patient.findOne({ unique_id });
    } else if (user.user_type === "Doctor") {
      userInfo = await Doctor.findOne({ unique_id});
    }

    return res.status(200).json({
      message: "Login successful",
      token,
      user_type: user.user_type,
      user: userInfo,
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Login failed", success: false, error: error.message });
  }
};
