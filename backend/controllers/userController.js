const User = require('../models/User');

exports.saveTravelLog = async (req, res) => {
  try {
    const userId = req.user; // set by auth middleware
    const { logId } = req.body;

    // Add the travel log to savedLogs if not already saved
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Prevent duplicate saves
    if (user.savedLogs.includes(logId)) {
      return res.status(400).json({ msg: 'Travel log already saved' });
    }

    user.savedLogs.push(logId);
    await user.save();

    res.status(200).json({ msg: 'Travel log saved', savedLogs: user.savedLogs });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Optionally, get all saved logs for the logged-in user
exports.getSavedLogs = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('savedLogs');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.status(200).json(user.savedLogs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.unsaveTravelLog = async (req, res) => {
  try {
    const userId = req.user; // from JWT
    const { logId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.savedLogs = user.savedLogs.filter(
      (savedId) => savedId.toString() !== logId
    );

    await user.save();
    res.status(200).json({ msg: 'Travel log unsaved', savedLogs: user.savedLogs });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
