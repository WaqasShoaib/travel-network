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

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user)
      return res.status(403).json({ msg: 'Not authorized to edit this comment' });

    comment.text = text;
    await comment.save();
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user)
      return res.status(403).json({ msg: 'Not authorized to delete this comment' });

    await comment.deleteOne();
    res.status(200).json({ msg: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
