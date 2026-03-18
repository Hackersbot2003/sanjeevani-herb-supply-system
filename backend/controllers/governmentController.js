const User = require('../models/User');
const Herb = require('../models/Herb');
const Transport = require('../models/Transport');
const Lab = require('../models/Lab');
const Manufacture = require('../models/Manufacture');

// GET /api/government/stats — full dashboard stats
exports.getGovernmentStats = async (req, res) => {
  try {
    // Total counts
    const [
      totalFarmers,
      totalTransporters,
      totalLabs,
      totalManufacturers,
      totalCrops,
      totalTransports,
      totalLabTests,
      totalManufactures
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'transporter' }),
      User.countDocuments({ role: 'lab' }),
      User.countDocuments({ role: 'manufacturer' }),
      Herb.countDocuments(),
      Transport.countDocuments(),
      Lab.countDocuments(),
      Manufacture.countDocuments()
    ]);

    // Farmers by state
    const farmersByState = await User.aggregate([
      { $match: { role: 'farmer' } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Crops by herb type
    const cropsByType = await Herb.aggregate([
      { $group: { _id: '$herbName', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Crops by state (from herb pincode/state)
    const cropsByState = await Herb.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly crop registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyHerbs = await Herb.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          totalQty: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Supply chain completion rate
    const completedChain = await Herb.countDocuments({ status: 'manufactured' });
    const chainCompletionRate = totalCrops > 0 ? ((completedChain / totalCrops) * 100).toFixed(1) : 0;

    // All users with location for map
    const allUsers = await User.find(
      { role: { $in: ['farmer', 'transporter', 'lab', 'manufacturer'] } },
      { name: 1, role: 1, city: 1, state: 1, pincode: 1, organizationName: 1, region: 1, createdAt: 1 }
    );

    // Pincode density for heatmap
    const pincodeGroups = await User.aggregate([
      { $match: { role: { $in: ['farmer', 'transporter', 'lab', 'manufacturer'] } } },
      { $group: { _id: { pincode: '$pincode', role: '$role', state: '$state' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Lab quality stats
    const labQualityStats = await Lab.aggregate([
      { $group: { _id: '$qualityAssurance', count: { $sum: 1 } } }
    ]);

    const avgRating = await Lab.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      success: true,
      stats: {
        counts: {
          farmers: totalFarmers,
          transporters: totalTransporters,
          labs: totalLabs,
          manufacturers: totalManufacturers,
          crops: totalCrops,
          transports: totalTransports,
          labTests: totalLabTests,
          manufactures: totalManufactures
        },
        chainCompletionRate,
        farmersByState,
        cropsByType,
        cropsByState,
        monthlyHerbs,
        labQualityStats,
        avgRating: avgRating[0]?.avgRating?.toFixed(1) || 'N/A',
        pincodeGroups,
        allUsers
      }
    });
  } catch (err) {
    console.error('government stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/government/users — paginated list of all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, state, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (state) filter.state = state;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
