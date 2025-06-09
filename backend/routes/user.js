const express = require('express');
const router = express.Router();
const { saveTravelLog, getSavedLogs } = require('../controllers/userController');
const auth = require('../middleware/auth');

// POST /api/user/save-log — Save/bookmark a log
router.post('/save-log', auth, saveTravelLog);

// GET /api/user/saved-logs — Get all saved logs
router.get('/saved-logs', auth, getSavedLogs);

module.exports = router;
