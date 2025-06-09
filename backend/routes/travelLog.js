const express = require('express');
const router = express.Router();
const { createTravelLog, getAllTravelLogs } = require('../controllers/travelLogController');
const auth = require('../middleware/auth');

// POST /api/travellogs — Create new log (protected)
router.post('/', auth, createTravelLog);

// GET /api/travellogs — Fetch all logs (public)
router.get('/', getAllTravelLogs);

module.exports = router;
