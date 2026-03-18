const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  herb: { type: mongoose.Schema.Types.ObjectId, ref: 'Herb', required: true },
  transport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', required: true },

  // Copied fields
  herbName: { type: String, required: true },
  quantity: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String },
  driverName: { type: String },
  vehicleNumber: { type: String },

  // Lab user reference
  labUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Lab specific info
  labName: { type: String, required: true },
  qualityAssurance: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' },
  rating: { type: Number, min: 1, max: 10 },
  certificates: [{ type: String }],

  // Test factors
  moistureContent: { type: Number },
  purityLevel: { type: Number },
  pesticideLevel: { type: Number },
  activeCompoundLevel: { type: Number },

  // New QR for manufacturer
  qrPayload: { type: String },
  qrImage: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);
