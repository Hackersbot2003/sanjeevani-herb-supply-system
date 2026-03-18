const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'transporter', 'lab', 'manufacturer', 'government']
  },
  // Location info — used to match transporter/lab/manufacturer to nearby farmers
  region: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  // Extra fields for non-farmer roles
  organizationName: { type: String }, // company/lab/transport name
  licenseNumber: { type: String },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
