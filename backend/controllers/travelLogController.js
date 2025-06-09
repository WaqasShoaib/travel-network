const TravelLog = require('../models/TravelLog');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Create new travel log (protected)
exports.createTravelLog = async (req, res) => {
  try {
    const { title, description, location, tags } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'travel-logs' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
      });
    }

    const travelLog = new TravelLog({
      title,
      description,
      location,
      tags: typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim())
        : Array.isArray(tags) ? tags : [],
      imageUrl,
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
