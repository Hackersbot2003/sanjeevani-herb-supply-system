const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  // Link back to herb
  herb: { type: mongoose.Schema.Types.ObjectId, ref: 'Herb', required: true },

  // Copied from herb for quick access
  herbName: { type: String, required: true },
  quantity: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },

  // Farm location
  farmCity: { type: String },
  farmPincode: { type: String },
  farmGeoLocation: { lat: Number, long: Number },

  // Transporter user reference
  transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Transport details filled by transporter
  driverName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  transportQuantity: { type: Number, required: true },

  // Destination / pickup location
  transportCity: { type: String },
  transportPincode: { type: String },
  transportGeoLocation: { lat: Number, long: Number },

  // New QR generated for next stage (lab)
  qrPayload: { type: String },
  qrImage: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);
