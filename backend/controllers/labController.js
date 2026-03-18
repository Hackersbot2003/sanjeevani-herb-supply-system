const Lab = require('../models/Lab');
const Herb = require('../models/Herb');
const Transport = require('../models/Transport');

// POST /api/lab — lab scans transport QR, fills test form
exports.createLabRecord = async (req, res) => {
  try {
    const {
      transportId,
      labName,
      qualityAssurance,
      rating,
      certificates,
      moistureContent,
      purityLevel,
      pesticideLevel,
      activeCompoundLevel,
      qrPayload,
      qrImage
    } = req.body;

    if (!transportId || !labName || !qualityAssurance) {
      return res.status(400).json({ success: false, error: 'transportId, labName, qualityAssurance are required' });
    }

    const transport = await Transport.findById(transportId);
    if (!transport) return res.status(404).json({ success: false, error: 'Transport record not found' });

    const herb = await Herb.findById(transport.herb);
    if (!herb) return res.status(404).json({ success: false, error: 'Herb not found' });

    if (herb.status !== 'transport_assigned') {
      return res.status(400).json({ success: false, error: 'This batch is not ready for lab testing' });
    }

    const lab = await Lab.create({
      herb: herb._id,
      transport: transport._id,
      herbName: herb.herbName,
      quantity: transport.transportQuantity,
      farmer: herb.farmer,
      farmerName: herb.farmerName,
      driverName: transport.driverName,
      vehicleNumber: transport.vehicleNumber,
      labUser: req.user._id,
      labName: labName || req.user.organizationName,
      qualityAssurance,
      rating: Number(rating),
      certificates: certificates || [],
      moistureContent: Number(moistureContent) || 0,
      purityLevel: Number(purityLevel) || 0,
      pesticideLevel: Number(pesticideLevel) || 0,
      activeCompoundLevel: Number(activeCompoundLevel) || 0,
      qrPayload,
      qrImage
    });

    // Update herb status
    await Herb.findByIdAndUpdate(herb._id, {
      status: 'lab_verified',
      labId: lab._id
    });

    res.status(201).json({ success: true, lab });
  } catch (err) {
    console.error('createLabRecord error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/lab/:id/qr
exports.updateLabQR = async (req, res) => {
  try {
    const { qrPayload, qrImage } = req.body;
    const lab = await Lab.findByIdAndUpdate(req.params.id, { qrPayload, qrImage }, { new: true });
    if (!lab) return res.status(404).json({ success: false, error: 'Lab record not found' });
    res.json({ success: true, lab });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/lab/:id
exports.getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate('farmer', 'name phoneNumber')
      .populate('labUser', 'name organizationName');
    if (!lab) return res.status(404).json({ success: false, error: 'Lab record not found' });
    res.json({ success: true, lab });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/lab/my — lab sees their own records
exports.getMyLabRecords = async (req, res) => {
  try {
    const records = await Lab.find({ labUser: req.user._id })
      .populate('farmer', 'name phoneNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/lab/area — manufacturer sees lab-verified batches in their pincode
exports.getLabsByArea = async (req, res) => {
  try {
    const labs = await Lab.find({ qrPayload: { $exists: true, $ne: null } })
      .populate('farmer', 'name phoneNumber')
      .sort({ createdAt: -1 });

    // Filter only those not yet manufactured
    const herbIds = labs.map(l => l.herb);
    const herbs = await Herb.find({ _id: { $in: herbIds }, status: 'lab_verified' });
    const pendingHerbIds = new Set(herbs.map(h => h._id.toString()));
    const pending = labs.filter(l => pendingHerbIds.has(l.herb.toString()));

    res.json({ success: true, labs: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
