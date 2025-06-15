const express = require('express');
const router = express.Router();
const {
  createTravelLog,
  getAllTravelLogs,
  getTravelLogById,
  updateTravelLog,
  deleteTravelLog,
  getPersonalLogs,
} = require('../controllers/travelLogController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/travellogs — Create new log (with image upload, protected)
router.post('/', auth, upload.array('images', 5), createTravelLog);

// GET /api/travellogs — Fetch all logs (public)
router.get('/', getAllTravelLogs);

// GET /api/travellogs/personal — Get personal logs (protected) - MOVE THIS BEFORE /:id
router.get('/personal', auth, getPersonalLogs);

// GET /api/travellogs/:id — Fetch a single log (protected)
router.get('/:id', auth, getTravelLogById);

// PUT /api/travellogs/:id — Edit log (protected)
router.put('/:id', auth, updateTravelLog);

// DELETE /api/travellogs/:id — Delete log (protected)
router.delete('/:id', auth, deleteTravelLog);

module.exports = router;