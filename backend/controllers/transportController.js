const Transport = require('../models/Transport');
const Herb = require('../models/Herb');

// POST /api/transport — transporter scans QR, fills form, submits
exports.createTransport = async (req, res) => {
  try {
    const {
      herbId,
      driverName, vehicleNumber, transportQuantity,
      transportCity, transportPincode, transportGeoLocation,
      qrPayload, qrImage
    } = req.body;

    if (!herbId || !driverName || !vehicleNumber || !transportQuantity) {
      return res.status(400).json({ success: false, error: 'herbId, driverName, vehicleNumber, transportQuantity are required' });
    }

    const herb = await Herb.findById(herbId);
    if (!herb) return res.status(404).json({ success: false, error: 'Herb not found' });

    if (herb.status !== 'registered') {
      return res.status(400).json({ success: false, error: 'This crop has already been picked up by a transporter' });
    }

    if (Number(transportQuantity) > herb.quantity) {
      return res.status(400).json({ success: false, error: `Transport quantity cannot exceed crop quantity (${herb.quantity} kg)` });
    }

    const transport = await Transport.create({
      herb: herb._id,
      herbName: herb.herbName,
      quantity: herb.quantity,
      farmer: herb.farmer,
      farmerName: herb.farmerName,
      farmCity: herb.city,
      farmPincode: herb.pincode,
      farmGeoLocation: herb.geoLocation,
      transporter: req.user._id,
      driverName,
      vehicleNumber,
      transportQuantity: Number(transportQuantity),
      transportCity: transportCity || req.user.city,
      transportPincode: transportPincode || req.user.pincode,
      transportGeoLocation,
      qrPayload,
      qrImage
    });

    // Update herb status and link transport
    await Herb.findByIdAndUpdate(herbId, {
      status: 'transport_assigned',
      transportId: transport._id
    });

    res.status(201).json({ success: true, transport });
  } catch (err) {
    console.error('createTransport error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/transport/:id/qr — update QR
exports.updateTransportQR = async (req, res) => {
  try {
    const { qrPayload, qrImage } = req.body;
    const transport = await Transport.findByIdAndUpdate(
      req.params.id,
      { qrPayload, qrImage },
      { new: true }
    );
    if (!transport) return res.status(404).json({ success: false, error: 'Transport not found' });
    res.json({ success: true, transport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/transport/:id — get by ID (for QR scan)
exports.getTransportById = async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id)
      .populate('farmer', 'name phoneNumber city region pincode')
      .populate('transporter', 'name phoneNumber organizationName');
    if (!transport) return res.status(404).json({ success: false, error: 'Transport record not found' });
    res.json({ success: true, transport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/transport/my — transporter sees their own jobs
exports.getMyTransports = async (req, res) => {
  try {
    const transports = await Transport.find({ transporter: req.user._id })
      .populate('farmer', 'name phoneNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, transports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/transport/area — lab sees transported batches in their pincode (ready for lab test)
exports.getTransportsByArea = async (req, res) => {
  try {
    const transports = await Transport.find({
      transportPincode: req.user.pincode,
      qrPayload: { $exists: true, $ne: null }
    })
      .populate('farmer', 'name phoneNumber')
      .sort({ createdAt: -1 });

    // Filter only those not yet lab tested
    const herbIds = transports.map(t => t.herb);
    const herbs = await Herb.find({ _id: { $in: herbIds }, status: 'transport_assigned' });
    const pendingHerbIds = new Set(herbs.map(h => h._id.toString()));
    const pending = transports.filter(t => pendingHerbIds.has(t.herb.toString()));

    res.json({ success: true, transports: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
