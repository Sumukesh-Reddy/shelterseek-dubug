const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const managerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  aadhaar: {
    type: String,
    required: true,
    match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits']
  },
  pan: {
    type: String,
    required: true,
    match: [/^[A-Z]{5}\d{4}[A-Z]$/, 'PAN must be in format ABCDE1234F']
  },
  role: { type: String, default: 'Manager' },
  department: { 
    type: String, 
    enum: ['Bookings', 'Listings', 'Support', 'Finance'],
    required: true 
  },
  joiningDate: { type: Date, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, minlength: 8, select: false, required: true },
  accountType: { type: String, enum: ['manager'], default: 'manager' },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'LoginData' });

managerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

managerSchema.methods.correctPassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;