// routes/auth.routes.js
const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login',           c.login);
router.post('/register',        c.register);
router.get('/me',    protect,   c.getMe);
router.put('/change-password', protect, c.changePassword);

module.exports = router;
