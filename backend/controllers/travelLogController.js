const TravelLog = require('../models/TravelLog');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Create new travel log (protected)
exports.createTravelLog = async (req, res) => {
  try {
    console.log('📂 req.files:', req.files);
    console.log('📥 req.body:', req.body);
    const { title, description, location, tags } = req.body;

    const images = [];

    // Upload multiple images from req.files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'travel-logs' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        images.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }
    }
    console.log('✅ Number of images received:', req.files?.length);
    req.files.forEach((f, i) => {
      console.log(`📸 File[${i}]:`, f.originalname);
    });

    // Create travel log with uploaded images
    const travelLog = new TravelLog({
      title,
      description,
      location,
      tags: typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim())
        : Array.isArray(tags) ? tags : [],
      images,
      user: req.user,
    });

    await travelLog.save();
    console.log('✅ Saved travel log:', JSON.stringify(travelLog, null, 2));
    res.status(201).json(travelLog);
  } catch (err) {
    console.error('❌ Error in createTravelLog:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Fetch all travel logs (public)
exports.getAllTravelLogs = async (req, res) => {
  try {
    const { tag, location, user } = req.query;
    let filter = {};

    // Tag filter: support multiple, case-insensitive
    if (tag) {
      const tagsArray = tag.split(',').map(t => new RegExp(`^${t.trim()}$`, 'i'));
      filter.tags = { $in: tagsArray };
    }

    // Location filter: partial, case-insensitive
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (user) filter.user = user;

    const logs = await TravelLog.find(filter).populate('user', 'username');
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};



exports.updateTravelLog = async (req, res) => {
  try {
    const { title, description, location, tags } = req.body;
    const logId = req.params.id;

    // Debug logs
    console.log('=== UPDATE TRAVEL LOG DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Log ID:', logId);
    console.log('User ID:', req.user);
    console.log('Tags received:', tags, 'Type:', typeof tags);

    // Find the log by ID and check if the user owns it
    const travelLog = await TravelLog.findById(logId);
    if (!travelLog) {
      console.log('❌ Travel log not found');
      return res.status(404).json({ msg: 'Travel log not found' });
    }

    console.log('Found travel log owner:', travelLog.user.toString());
    console.log('Current user:', req.user);

    if (travelLog.user.toString() !== req.user) {
      console.log('❌ Not authorized - user mismatch');
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Update the fields
    travelLog.title = title || travelLog.title;
    travelLog.description = description || travelLog.description;
    travelLog.location = location || travelLog.location;

    // Handle tags properly
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        travelLog.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        travelLog.tags = tags;
      } else {
        travelLog.tags = [];
      }
    }

    console.log('Updated travel log data:', {
      title: travelLog.title,
      description: travelLog.description,
      location: travelLog.location,
      tags: travelLog.tags
    });

    await travelLog.save();  // Save the updated log
    console.log('✅ Travel log updated successfully');
    res.status(200).json(travelLog);
  } catch (err) {
    console.error('❌ Error in updateTravelLog:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteTravelLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const travelLog = await TravelLog.findById(logId);
    if (!travelLog) return res.status(404).json({ msg: 'Travel log not found' });
    if (travelLog.user.toString() !== req.user)
      return res.status(403).json({ msg: 'Not authorized to delete this log' });

    // Delete image from Cloudinary if it exists
    if (travelLog.imagePublicId) {
      await cloudinary.uploader.destroy(travelLog.imagePublicId);
    }

    await travelLog.deleteOne();
    res.status(200).json({ msg: 'Travel log and image deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


// travelLogController.js
exports.getPersonalLogs = async (req, res) => {
  try {
    const userId = req.user;  // Extract user ID from JWT token
    console.log('User ID:', userId);  // Debugging log to see the user ID
    const personalLogs = await TravelLog.find({ user: userId });
    console.log('Fetched Logs:', personalLogs);  // Log fetched logs
    res.json(personalLogs);  // Return the personal logs
  } catch (err) {
    console.error('Error fetching personal logs:', err.message);  // Log detailed error message
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};



// Fetch a specific log by ID
exports.getTravelLogById = async (req, res) => {
  try {
    const log = await TravelLog.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
