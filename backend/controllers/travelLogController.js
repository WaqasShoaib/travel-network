const TravelLog = require('../models/TravelLog');

// Create new travel log (protected)
exports.createTravelLog = async (req, res) => {
  try {
    const { title, description, location, tags, imageUrl } = req.body;

    // Create travel log document
    const travelLog = new TravelLog({
      title,
      description,
      location,
      tags,
      imageUrl,
      user: req.user, // set by auth middleware
    });

    await travelLog.save();
    res.status(201).json(travelLog);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Fetch all travel logs (public)
exports.getAllTravelLogs = async (req, res) => {
  try {
    const { tag, location, user } = req.query;
    let filter = {};
    if (tag) filter.tags = tag;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (user) filter.user = user;
    const logs = await TravelLog.find(filter).populate('user', 'username');
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
