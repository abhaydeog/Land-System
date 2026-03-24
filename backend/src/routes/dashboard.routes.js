// routes/dashboard.routes.js
const router = require('express').Router();
const { getStats } = require('../controllers/dashboard.controller');
const { protect, staffOnly } = require('../middleware/auth.middleware');
router.get('/stats', protect, staffOnly, getStats);
module.exports = router;
