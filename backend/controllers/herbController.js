const Herb = require('../models/Herb');
const User = require('../models/User');
const Transport = require('../models/Transport');

// POST /api/herbs — Farmer uploads crop
exports.createHerb = async (req, res) => {
  try {
    const {
      herbName, quantity, date,
      geoLocation, city, address, state, pincode,
      qrPayload, qrImage
    } = req.body;

    if (!herbName || !quantity) {
      return res.status(400).json({ success: false, error: 'herbName and quantity are required' });
    }

    const herb = await Herb.create({
      herbName,
      quantity: Number(quantity),
      date: date || new Date(),
      farmer: req.user._id,
      farmerName: req.user.name,
      geoLocation,
      city,
      address,
      state,
      pincode: pincode || req.user.pincode,
      qrPayload,
      qrImage,
      status: 'registered'
    });

    res.status(201).json({ success: true, herb });
  } catch (err) {
    console.error('createHerb error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/herbs/:id/qr — save QR after generation
exports.updateHerbQR = async (req, res) => {
  try {
    const { qrPayload, qrImage } = req.body;
    const herb = await Herb.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      { qrPayload, qrImage },
      { new: true }
    );
    if (!herb) return res.status(404).json({ success: false, error: 'Herb not found' });
    res.json({ success: true, herb });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/herbs/my — farmer sees only THEIR herbs
exports.getMyHerbs = async (req, res) => {
  try {
    const herbs = await Herb.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, herbs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/herbs/:id — get herb by ID (public for QR scan)
exports.getHerbById = async (req, res) => {
  try {
    const herb = await Herb.findById(req.params.id).populate('farmer', 'name phoneNumber region pincode city');
    if (!herb) return res.status(404).json({ success: false, error: 'Herb not found' });
    res.json({ success: true, herb });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/herbs/area — transporter/lab gets herbs in their pincode area (pending transport)
exports.getHerbsByArea = async (req, res) => {
  try {
    const user = req.user;
    // Match herbs in same pincode that are still in 'registered' status
    const herbs = await Herb.find({
      pincode: user.pincode,
      status: 'registered'
    })
      .populate('farmer', 'name phoneNumber city region')
      .sort({ createdAt: -1 });

    res.json({ success: true, herbs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
