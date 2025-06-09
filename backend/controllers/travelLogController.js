const TravelLog = require('../models/TravelLog');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Create new travel log (protected)
exports.createTravelLog = async (req, res) => {
  try {
    const { title, description, location, tags } = req.body;
    let imageUrl = '';
    let imagePublicId = '';

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'travel-logs' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
      });
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id; // <-- save this
    }

    // When creating the travel log:
    const travelLog = new TravelLog({
      title,
      description,
      location,
      tags: typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim())
        : Array.isArray(tags) ? tags : [],
      imageUrl,
      imagePublicId, 
      user: req.user,
    });

    await travelLog.save();
    res.status(201).json(travelLog);
  } catch (err) {
    console.error('Error in createTravelLog:', err); // <-- Add this line for debugging
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
    const logId = req.params.id;
    const { title, description, location, tags } = req.body;

    // Find the log and ensure the user owns it
    const travelLog = await TravelLog.findById(logId);
    if (!travelLog) return res.status(404).json({ msg: 'Travel log not found' });
    if (travelLog.user.toString() !== req.user)
      return res.status(403).json({ msg: 'Not authorized to update this log' });

    // Update fields
    if (title) travelLog.title = title;
    if (description) travelLog.description = description;
    if (location) travelLog.location = location;
    if (tags) travelLog.tags = typeof tags === 'string'
      ? tags.split(',').map(tag => tag.trim())
      : tags;

    await travelLog.save();
    res.status(200).json(travelLog);
  } catch (err) {
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
