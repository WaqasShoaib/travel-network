const express = require('express');
const router = express.Router();
const { addComment, getCommentsForLog } = require('../controllers/commentController');
const auth = require('../middleware/auth');

// POST /api/comments — Add a comment (protected)
router.post('/', auth, addComment);

// GET /api/comments/:travelLogId — Get all comments for a travel log
router.get('/:travelLogId', getCommentsForLog);

module.exports = router;
