const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  
  unique_id: {
    type: String,
    required: true,
    unique: true
  },
  user_type: {
    type: String,
    enum: ['Doctor', 'Patient', 'Lab'], 
    required: true
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password should be at least 8 characters']
  },
  created_at: {
    type: Date,
    default: Date.now 
  }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
