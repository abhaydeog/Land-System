// routes/report.routes.js
const router = require('express').Router();
const { getMonthly, getOfficerPerformance } = require('../controllers/dashboard.controller');
const { protect, staffOnly } = require('../middleware/auth.middleware');

router.use(protect, staffOnly);
router.get('/monthly',             getMonthly);
router.get('/officer-performance', getOfficerPerformance);

module.exports = router;
