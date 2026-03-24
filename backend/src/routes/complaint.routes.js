const router = require('express').Router();
const c      = require('../controllers/complaint.controller');
const { protect, staffOnly, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public tracking (no auth)
router.get('/track/:no', c.track);

router.use(protect);

router.get('/',    c.getAll);
router.get('/:id', c.getOne);

// Create with optional file upload (max 5 files)
router.post('/', upload.array('attachments', 5), c.create);

// Add attachments to existing complaint
router.post('/:id/attachments', staffOnly, upload.array('attachments', 5), c.addAttachments);
router.delete('/:id/attachments/:fileId', staffOnly, c.deleteAttachment);

router.put('/:id/assign',  staffOnly, c.assign);
router.put('/:id/status',  staffOnly, c.updateStatus);
router.post('/:id/comment', c.addComment);
router.delete('/:id',      adminOnly, c.delete);

module.exports = router;
