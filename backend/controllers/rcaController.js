const RCA = require('../models/RCA');

// @desc    Create a new RCA
// @route   POST /api/rca
// @access  Public
exports.createRCA = async (req, res) => {
  try {
    const { title, category, symptoms, rootCause, solution, prevention, severity, tags, createdBy } = req.body;

    const rca = await RCA.create({
      title,
      category,
      symptoms,
      rootCause,
      solution,
      prevention,
      severity,
      tags: tags || [],
      createdBy
    });

    res.status(201).json({
      success: true,
      message: 'RCA created successfully',
      data: rca
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create RCA',
      error: error.message
    });
  }
};

// @desc    Get all RCAs with optional filtering
// @route   GET /api/rca
// @access  Public
exports.getAllRCAs = async (req, res) => {
  try {
    const { category, severity, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rcas = await RCA.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RCA.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: rcas,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RCAs',
      error: error.message
    });
  }
};

// @desc    Get single RCA by ID
// @route   GET /api/rca/:id
// @access  Public
exports.getRCAById = async (req, res) => {
  try {
    const rca = await RCA.findById(req.params.id);

    if (!rca) {
      return res.status(404).json({
        success: false,
        message: 'RCA not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rca
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RCA',
      error: error.message
    });
  }
};

// @desc    Update RCA
// @route   PUT /api/rca/:id
// @access  Public
exports.updateRCA = async (req, res) => {
  try {
    const rca = await RCA.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rca) {
      return res.status(404).json({
        success: false,
        message: 'RCA not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'RCA updated successfully',
      data: rca
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update RCA',
      error: error.message
    });
  }
};

// @desc    Delete RCA
// @route   DELETE /api/rca/:id
// @access  Public
exports.deleteRCA = async (req, res) => {
  try {
    const rca = await RCA.findByIdAndDelete(req.params.id);

    if (!rca) {
      return res.status(404).json({
        success: false,
        message: 'RCA not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'RCA deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete RCA',
      error: error.message
    });
  }
};

// @desc    Search RCAs by keyword
// @route   GET /api/rca/search
// @access  Public
exports.searchRCAs = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search query
    const searchQuery = {
      $text: { $search: q }
    };

    if (category) {
      searchQuery.category = category;
    }

    const rcas = await RCA.find(searchQuery, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

    res.status(200).json({
      success: true,
      data: rcas,
      count: rcas.length
    });
  } catch (error) {
    // If text index doesn't exist, fall back to regex search
    try {
      const { q, category } = req.query;
      const regexQuery = { $regex: q, $options: 'i' };
      
      const filter = {
        $or: [
          { title: regexQuery },
          { symptoms: regexQuery },
          { rootCause: regexQuery },
          { solution: regexQuery }
        ]
      };

      if (category) filter.category = category;

      const rcas = await RCA.find(filter).limit(20);

      res.status(200).json({
        success: true,
        data: rcas,
        count: rcas.length
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: fallbackError.message
      });
    }
  }
};

// @desc    Get RCA statistics
// @route   GET /api/rca/stats
// @access  Public
exports.getRCAStats = async (req, res) => {
  try {
    const stats = await RCA.aggregate([
      {
        $facet: {
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          total: [
            { $count: 'count' }
          ],
          recentRCAs: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { title: 1, category: 1, createdAt: 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory: stats[0].byCategory,
        bySeverity: stats[0].bySeverity,
        byStatus: stats[0].byStatus,
        total: stats[0].total[0]?.count || 0,
        recentRCAs: stats[0].recentRCAs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
