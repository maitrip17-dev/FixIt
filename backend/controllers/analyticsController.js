const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const connectDB = require('../config/db');

/**
 * Check if MongoDB is connected
 */
const ensureDBConnected = async () => {
  if (mongoose.connection.readyState === 1) return true;
  await connectDB();
  return mongoose.connection.readyState === 1;
};

/**
 * @desc    Get system-wide maintenance intelligence and analytics overview
 * @route   GET /api/analytics/overview
 * @access  Private (Admin only)
 */
const getAnalyticsOverview = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    // Execute aggregation pipelines concurrently using Promise.all for maximum efficiency
    const [
      frequentIssues,
      categoryDistribution,
      avgResolutionTime,
      statusCountsRaw,
      globalStatsRaw,
    ] = await Promise.all([
      // Pipeline 1: Frequent Issue Hotspots
      // Group by location and category, count occurrences, sort descending, and return top 5
      Complaint.aggregate([
        {
          $group: {
            _id: { location: '$location', category: '$category' },
            count: { $sum: 1 },
            latestReported: { $max: '$createdAt' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            location: '$_id.location',
            category: '$_id.category',
            count: 1,
            latestReported: 1,
          },
        },
      ]),

      // Pipeline 2: Category Breakdown
      // Group by category and count ticket volume sorted descending
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
          },
        },
      ]),

      // Pipeline 3: Average Resolution Time per Category
      // Match resolved/closed complaints, calculate duration in hours, group by category, and round average
      Complaint.aggregate([
        {
          $match: {
            status: { $in: ['Resolved', 'Closed'] },
            createdAt: { $exists: true },
            updatedAt: { $exists: true },
          },
        },
        {
          $project: {
            category: 1,
            durationHours: {
              $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 3600000],
            },
          },
        },
        {
          $group: {
            _id: '$category',
            avgHours: { $avg: '$durationHours' },
            resolvedCount: { $sum: 1 },
          },
        },
        { $sort: { avgHours: 1 } },
        {
          $project: {
            _id: 0,
            category: '$_id',
            avgHours: { $round: ['$avgHours', 1] },
            resolvedCount: 1,
          },
        },
      ]),

      // Pipeline 4: Status KPI Summary
      // Group by status for system-wide ticket counts
      Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: 1,
          },
        },
      ]),

      // Global Summary Statistics
      Complaint.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            resolved: [
              { $match: { status: { $in: ['Resolved', 'Closed'] } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  avgHours: {
                    $avg: {
                      $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 3600000],
                    },
                  },
                },
              },
            ],
            active: [
              { $match: { status: { $in: ['Pending', 'In Progress', 'Assigned'] } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
    ]);

    // Format status counts into an accessible map
    const statusMap = {
      Pending: 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
    };
    statusCountsRaw.forEach((item) => {
      if (item.status) statusMap[item.status] = item.count;
    });

    const statusCounts = Object.keys(statusMap).map((key) => ({
      status: key,
      count: statusMap[key],
    }));

    // Extract global summary
    const globalFacet = globalStatsRaw[0] || {};
    const totalComplaints = globalFacet.total?.[0]?.count || 0;
    const activeWorkOrders = globalFacet.active?.[0]?.count || 0;
    const resolvedComplaints = globalFacet.resolved?.[0]?.count || 0;
    const rawGlobalAvg = globalFacet.resolved?.[0]?.avgHours;
    const globalAvgResolutionHours =
      rawGlobalAvg !== undefined && rawGlobalAvg !== null
        ? Math.round(rawGlobalAvg * 10) / 10
        : 0;

    const resolutionRate =
      totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    return res.status(200).json({
      summary: {
        totalComplaints,
        activeWorkOrders,
        resolvedComplaints,
        resolutionRate,
        globalAvgResolutionHours,
      },
      frequentIssues,
      categoryDistribution,
      avgResolutionTime,
      statusCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics Overview Error:', error.message);
    return res.status(500).json({
      message: 'Server error calculating maintenance analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getAnalyticsOverview,
};
