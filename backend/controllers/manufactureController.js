const Manufacture = require('../models/Manufacture');
const Herb = require('../models/Herb');
const Lab = require('../models/Lab');
const Transport = require('../models/Transport');

// POST /api/manufacture — manufacturer scans lab QR, fills form
exports.createManufacture = async (req, res) => {
  try {
    const {
      labId,
      companyName,
      productName,
      manufactureDate,
      batchNumber,
      expiryDate,
      processes,
      qrPayload,
      qrImage
    } = req.body;

    if (!labId || !companyName || !productName) {
      return res.status(400).json({ success: false, error: 'labId, companyName, productName are required' });
    }

    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ success: false, error: 'Lab record not found' });

    const herb = await Herb.findById(lab.herb);
    if (!herb) return res.status(404).json({ success: false, error: 'Herb not found' });

    if (herb.status !== 'lab_verified') {
      return res.status(400).json({ success: false, error: 'This batch is not lab verified yet' });
    }

    const manufacture = await Manufacture.create({
      herb: herb._id,
      transport: lab.transport,
      lab: lab._id,
      herbName: herb.herbName,
      quantity: lab.quantity,
      farmer: herb.farmer,
      farmerName: herb.farmerName,
      manufacturer: req.user._id,
      companyName: companyName || req.user.organizationName,
      productName,
      manufactureDate: manufactureDate || new Date(),
      batchNumber,
      expiryDate,
      processes: processes || [],
      qrPayload,
      qrImage,
      dispatched: false
    });

    // Update herb status
    await Herb.findByIdAndUpdate(herb._id, {
      status: 'manufactured',
      manufactureId: manufacture._id
    });

    res.status(201).json({ success: true, manufacture });
  } catch (err) {
    console.error('createManufacture error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/manufacture/:id/qr
exports.updateManufactureQR = async (req, res) => {
  try {
    const { qrPayload, qrImage } = req.body;
    const manufacture = await Manufacture.findByIdAndUpdate(
      req.params.id,
      { qrPayload, qrImage },
      { new: true }
    );
    if (!manufacture) return res.status(404).json({ success: false, error: 'Manufacture record not found' });
    res.json({ success: true, manufacture });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/manufacture/:id
exports.getManufactureById = async (req, res) => {
  try {
    const manufacture = await Manufacture.findById(req.params.id)
      .populate('farmer', 'name phoneNumber region city')
      .populate('manufacturer', 'name organizationName city')
      .populate('lab', 'labName qualityAssurance rating certificates moistureContent purityLevel pesticideLevel activeCompoundLevel')
      .populate('transport', 'driverName vehicleNumber transportCity');
    if (!manufacture) return res.status(404).json({ success: false, error: 'Manufacture record not found' });
    res.json({ success: true, manufacture });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/manufacture/my
exports.getMyManufactures = async (req, res) => {
  try {
    const records = await Manufacture.find({ manufacturer: req.user._id })
      .populate('farmer', 'name phoneNumber')
      .populate('lab', 'labName qualityAssurance rating')
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/consumer/:id — consumer scans final QR, sees full chain
exports.getConsumerView = async (req, res) => {
  try {
    const manufacture = await Manufacture.findById(req.params.id)
      .populate('farmer', 'name phoneNumber region city state pincode')
      .populate('manufacturer', 'name organizationName city state')
      .populate({
        path: 'lab',
        select: 'labName qualityAssurance rating certificates moistureContent purityLevel pesticideLevel activeCompoundLevel createdAt',
        populate: { path: 'labUser', select: 'name organizationName' }
      })
      .populate('transport', 'driverName vehicleNumber transportCity transportPincode createdAt');

    if (!manufacture) return res.status(404).json({ success: false, error: 'Product not found' });

    // Also get herb
    const herb = await Herb.findById(manufacture.herb).populate('farmer', 'name phoneNumber region city state');

    res.json({
      success: true,
      product: {
        manufacture,
        herb,
        fullChain: {
          farmerStage: {
            farmerName: herb?.farmerName,
            location: `${herb?.city}, ${herb?.state}`,
            cropName: herb?.herbName,
            quantity: herb?.quantity,
            harvestDate: herb?.date,
            coordinates: herb?.geoLocation
          },
          transportStage: {
            driverName: manufacture.transport?.driverName,
            vehicleNumber: manufacture.transport?.vehicleNumber,
            transportCity: manufacture.transport?.transportCity,
            date: manufacture.transport?.createdAt
          },
          labStage: {
            labName: manufacture.lab?.labName,
            qualityAssurance: manufacture.lab?.qualityAssurance,
            rating: manufacture.lab?.rating,
            certificates: manufacture.lab?.certificates,
            moistureContent: manufacture.lab?.moistureContent,
            purityLevel: manufacture.lab?.purityLevel,
            pesticideLevel: manufacture.lab?.pesticideLevel,
            activeCompoundLevel: manufacture.lab?.activeCompoundLevel,
            date: manufacture.lab?.createdAt
          },
          manufactureStage: {
            companyName: manufacture.companyName,
            productName: manufacture.productName,
            batchNumber: manufacture.batchNumber,
            manufactureDate: manufacture.manufactureDate,
            expiryDate: manufacture.expiryDate,
            processes: manufacture.processes
          }
        }
      }
    });
  } catch (err) {
    console.error('getConsumerView error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
