const mongoose = require('mongoose');

const herbSchema = new mongoose.Schema({
  // Core crop info
  herbName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },

  // Farmer reference — always specific to ONE farmer
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },

  // Location of farm (auto-fetched from GPS)
  geoLocation: {
    lat: { type: Number },
    long: { type: Number }
  },
  city: { type: String },
  address: { type: String },
  state: { type: String },
  pincode: { type: String },

  // QR code generated after crop upload
  qrPayload: { type: String },
  qrImage: { type: String }, // base64

  // Supply chain stage tracking
  status: {
    type: String,
    enum: ['registered', 'transport_assigned', 'lab_verified', 'manufactured', 'dispatched'],
    default: 'registered'
  },

  // Chain references
  transportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport' },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' },
  manufactureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacture' },

}, { timestamps: true });

module.exports = mongoose.model('Herb', herbSchema);
