const mongoose = require('mongoose');

const manufactureSchema = new mongoose.Schema({
  herb: { type: mongoose.Schema.Types.ObjectId, ref: 'Herb', required: true },
  transport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', required: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },

  // Copied fields
  herbName: { type: String, required: true },
  quantity: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String },

  // Manufacturer user ref
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Manufacturer details
  companyName: { type: String, required: true },
  productName: { type: String, required: true },
  manufactureDate: { type: Date, default: Date.now },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  processes: [{ type: String }],

  // Final QR for consumer
  qrPayload: { type: String },
  qrImage: { type: String },

  dispatched: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Manufacture', manufactureSchema);
