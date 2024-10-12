const bcrypt = require("bcryptjs");
const User = require("../models/users");
const Lab = require("../models/lab"); 

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
