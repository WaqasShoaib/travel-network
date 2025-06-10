const Comment = require('../models/Comment');
const TravelLog = require('../models/TravelLog');

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const { travelLogId, text } = req.body;
    const user = req.user;

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    if (!travelLogId) {
      return res.status(400).json({ msg: 'Travel log ID is required' });
    }

    // Check if travel log exists
    const travelLog = await TravelLog.findById(travelLogId);
    if (!travelLog) {
      return res.status(404).json({ msg: 'Travel log not found' });
    }

    const comment = new Comment({ 
      text: text.trim(), 
      user, 
      travelLog: travelLogId 
    });
    await comment.save();

    // Populate user info before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username');

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get comments for a travel log
exports.getCommentsForLog = async (req, res) => {
  try {
    const { travelLogId } = req.params;
    
    // Verify travel log exists
    const travelLog = await TravelLog.findById(travelLogId);
    if (!travelLog) {
      return res.status(404).json({ msg: 'Travel log not found' });
    }

    const comments = await Comment.find({ travelLog: travelLogId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Only the comment author can edit their comment
    if (comment.user.toString() !== req.user) {
      return res.status(403).json({ msg: 'Not authorized to edit this comment' });
    }

    comment.text = text.trim();
    await comment.save();
    
    // Return populated comment
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username');
    
    res.status(200).json(populatedComment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).populate('travelLog');
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Allow deletion if:
    // 1. User is the comment author, OR
    // 2. User is the owner of the travel log (can moderate comments on their posts)
    const isCommentAuthor = comment.user.toString() === req.user;
    const isPostOwner = comment.travelLog.user.toString() === req.user;

    if (!isCommentAuthor && !isPostOwner) {
      return res.status(403).json({ msg: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.status(200).json({ 
      msg: 'Comment deleted successfully',
      deletedBy: isPostOwner && !isCommentAuthor ? 'post_owner' : 'comment_author'
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};