// routes/officer.routes.js
const router = require('express').Router();
const c = require('../controllers/officer.controller');
const { protect, adminOnly, staffOnly } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',                          staffOnly, c.getAll);
router.post('/',                         adminOnly, c.create);
router.put('/:id/availability',          staffOnly, c.updateAvailability);
router.get('/:id/complaints',            staffOnly, c.getComplaints);

module.exports = router;
