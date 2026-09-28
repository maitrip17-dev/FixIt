const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const connectDB = require('../config/db');

/**
 * Check if MongoDB is connected, and try to connect if disconnected
 */
const ensureDBConnected = async () => {
  if (mongoose.connection.readyState === 1) return true;
  await connectDB();
  return mongoose.connection.readyState === 1;
};

/**
 * Helper to generate random human-readable ticketId
 */
const generateTicketId = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FIX-${randomSuffix}`;
};

/**
 * @desc    Create a new complaint ticket
 * @route   POST /api/complaints
 * @access  Private (User, Admin)
 */
const createComplaint = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { title, description, category, location, priority } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Please provide title, description, category, and location',
      });
    }

    const validCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Category must be one of: ${validCategories.join(', ')}`,
      });
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    const assignedPriority = priority && validPriorities.includes(priority) ? priority : 'Medium';

    const userId = req.user._id;

    // Create complaint with initial statusHistory
    const complaint = await Complaint.create({
      ticketId: generateTicketId(),
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      priority: assignedPriority,
      status: 'Pending',
      createdBy: userId,
      assignedTo: null,
      statusHistory: [
        {
          status: 'Pending',
          changedBy: userId,
          changedAt: new Date(),
        },
      ],
    });

    // Populate createdBy details
    await complaint.populate('createdBy', 'name email');

    return res.status(201).json({
      message: 'Complaint created successfully',
      complaint,
    });
  } catch (error) {
    console.error('Create Complaint Error:', error.message);
    return res.status(500).json({
      message: 'Server error creating complaint',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all complaints filtered by user role & query parameters
 * @route   GET /api/complaints
 * @access  Private (User, Worker, Admin)
 */
const getComplaints = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { role, _id: userId } = req.user;
    const { status, category } = req.query;

    // Build role-scoped query filter
    let query = {};

    if (role === 'user') {
      // Users only see their own submitted tickets
      query.createdBy = userId;
    } else if (role === 'worker') {
      // Workers only see tickets assigned to them
      query.assignedTo = userId;
    }
    // Admins see all tickets (query remains empty by default)

    // Optional query filters
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get Complaints Error:', error.message);
    return res.status(500).json({
      message: 'Server error retrieving complaints',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single complaint by ID with authorization check
 * @route   GET /api/complaints/:id
 * @access  Private (User, Worker, Admin)
 */
const getComplaintById = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID format' });
    }

    const complaint = await Complaint.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { role, _id: userId } = req.user;

    // Authorization checks
    if (role === 'user' && complaint.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to view this complaint',
      });
    }

    if (role === 'worker') {
      const isPendingOrUnassigned = complaint.status === 'Pending' || !complaint.assignedTo;
      const isAssignedToMe =
        complaint.assignedTo &&
        (complaint.assignedTo._id
          ? complaint.assignedTo._id.toString() === userId.toString()
          : complaint.assignedTo.toString() === userId.toString());

      if (!isPendingOrUnassigned && !isAssignedToMe) {
        return res.status(403).json({
          message: 'Access denied: You are not assigned to this complaint',
        });
      }
    }

    return res.status(200).json({ complaint });
  } catch (error) {
    console.error('Get Complaint By ID Error:', error.message);
    return res.status(500).json({
      message: 'Server error retrieving complaint',
      error: error.message,
    });
  }
};

/**
 * @desc    Assign a complaint to a worker (DEPRECATED in Phase 4 - Decentralized Claim Model)
 * @route   PATCH /api/complaints/:id/assign
 * @access  Private (Admin only)
 */
const assignComplaint = async (req, res) => {
  return res.status(410).json({
    message: 'Manual admin assignment has been deprecated in Phase 4. FixIt uses a decentralized worker claiming model where technicians self-claim tasks directly from the Open Work Orders Pool.',
  });
};

/**
 * @desc    Update complaint status
 * @route   PATCH /api/complaints/:id/status
 * @access  Private (Worker, Admin)
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['In Progress', 'Resolved', 'Closed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID format' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { role, _id: userId } = req.user;

    // Worker can only update tickets assigned to them
    if (
      role === 'worker' &&
      (!complaint.assignedTo || complaint.assignedTo.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        message: 'Access denied: You are not assigned to this complaint',
      });
    }

    // Update status and append to audit history
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: userId,
      changedAt: new Date(),
    });

    await complaint.save();

    await complaint.populate('createdBy', 'name email');
    await complaint.populate('assignedTo', 'name email');
    await complaint.populate('statusHistory.changedBy', 'name email');

    // Notify ticket owner if complaint is marked Resolved
    if (status === 'Resolved' && complaint.createdBy?._id) {
      try {
        await Notification.create({
          recipient: complaint.createdBy._id,
          sender: userId,
          complaintId: complaint._id,
          message: `Your complaint (${complaint.ticketId}) has been resolved by ${req.user.name}.`,
        });
      } catch (notifErr) {
        console.error('Failed to create resolve notification:', notifErr.message);
      }
    }

    return res.status(200).json({
      message: `Status updated to '${status}' successfully`,
      complaint,
    });
  } catch (error) {
    console.error('Update Complaint Status Error:', error.message);
    return res.status(500).json({
      message: 'Server error updating complaint status',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all open/unassigned complaints in the requests pool
 * @route   GET /api/complaints/pool
 * @access  Private (Worker, Admin)
 */
const getComplaintsPool = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { category, priority } = req.query;
    let query = {
      status: 'Pending',
      assignedTo: null,
    };

    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get Complaints Pool Error:', error.message);
    return res.status(500).json({
      message: 'Server error retrieving complaints pool',
      error: error.message,
    });
  }
};

/**
 * @desc    Worker claims an open ticket from the pool
 * @route   PATCH /api/complaints/:id/claim
 * @access  Private (Worker only)
 */
const claimComplaint = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID format' });
    }

    const workerId = req.user._id;

    // Atomic update to prevent race conditions:
    // Only succeeds if the complaint is currently 'Pending' and 'assignedTo' is null.
    const complaint = await Complaint.findOneAndUpdate(
      { _id: id, status: 'Pending', assignedTo: null },
      {
        assignedTo: workerId,
        status: 'In Progress',
        $push: {
          statusHistory: {
            status: 'In Progress',
            changedBy: workerId,
            changedAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email skillCategory')
      .populate('statusHistory.changedBy', 'name email');

    if (!complaint) {
      const existing = await Complaint.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      return res.status(400).json({
        message: 'This complaint has already been claimed by another technician or is no longer available in the pool.',
      });
    }

    // Automatically create in-app Notification for complaint.createdBy
    if (complaint.createdBy?._id) {
      try {
        await Notification.create({
          recipient: complaint.createdBy._id,
          sender: workerId,
          complaintId: complaint._id,
          message: `Worker ${req.user.name} has claimed your ${complaint.category} ticket ${complaint.ticketId} and started work.`,
        });
      } catch (notifErr) {
        console.error('Failed to create claim notification:', notifErr.message);
      }
    }

    return res.status(200).json({
      message: 'Ticket successfully claimed and set to In Progress',
      complaint,
    });
  } catch (error) {
    console.error('Claim Complaint Error:', error.message);
    return res.status(500).json({
      message: 'Server error claiming complaint',
      error: error.message,
    });
  }
};

/**
 * @desc    Admin emergency action: return ticket to pool
 * @route   PATCH /api/complaints/:id/reset
 * @access  Private (Admin only)
 */
const adminResetComplaint = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID format' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.assignedTo = null;
    complaint.status = 'Pending';
    complaint.statusHistory.push({
      status: 'Pending',
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await complaint.save();

    await complaint.populate('createdBy', 'name email');
    await complaint.populate('statusHistory.changedBy', 'name email');

    if (complaint.createdBy?._id) {
      try {
        await Notification.create({
          recipient: complaint.createdBy._id,
          sender: req.user._id,
          complaintId: complaint._id,
          message: `Your complaint (${complaint.ticketId}) was reopened and returned to the open requests pool.`,
        });
      } catch (notifErr) {
        console.error('Failed to create reset notification:', notifErr.message);
      }
    }

    return res.status(200).json({
      message: 'Complaint returned to pool successfully',
      complaint,
    });
  } catch (error) {
    console.error('Admin Reset Complaint Error:', error.message);
    return res.status(500).json({
      message: 'Server error resetting complaint',
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  getComplaintsPool,
  claimComplaint,
  adminResetComplaint,
};
