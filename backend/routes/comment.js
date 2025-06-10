const express = require('express');
const router = express.Router();
const { addComment, getCommentsForLog, updateComment, deleteComment } = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Add a comment
router.post('/', auth, addComment);

// Get comments for a travel log
router.get('/:travelLogId', getCommentsForLog);

// Update a comment
router.put('/:id', auth, updateComment);

// Delete a comment
router.delete('/:id', auth, deleteComment);

module.exports = router;