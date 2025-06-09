const express = require('express');
const router = express.Router();
const { createTravelLog, getAllTravelLogs } = require('../controllers/travelLogController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// For image upload (protected)
router.post('/', auth, upload.single('image'), createTravelLog);

// POST /api/travellogs — Create new log (protected)
router.post('/', auth, createTravelLog);

// GET /api/travellogs — Fetch all logs (public)
router.get('/', getAllTravelLogs);

module.exports = router;
