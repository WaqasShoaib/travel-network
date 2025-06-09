const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
  try {
    const { travelLogId, text } = req.body;
    const user = req.user;

    const comment = new Comment({ text, user, travelLog: travelLogId });
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getCommentsForLog = async (req, res) => {
  try {
    const { travelLogId } = req.params;
    const comments = await Comment.find({ travelLog: travelLogId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
