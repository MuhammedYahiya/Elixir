const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const patientRoute = require("./routes/patientRouter");
const doctorRoute = require("./routes/doctorRouter");
const authRoute = require('./routes/authRouter')
const labRoute = require('./routes/labRouter')
require("dotenv").config();

const app = express(); // Initialize express app

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api", authRoute);
app.use("/api/lab",labRoute)

// Connect to MongoDB
connectDB();

// Log when any API route is hit
app.use((req, res, next) => {
  console.log("Request made to:", req.url);
  next();
});

// Root route for testing
app.get("/", (req, res) => {
  console.log("Root route hit!");
  res.send("Backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
