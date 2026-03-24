const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email aur password zaroori hai' });

    const { rows } = await query(
      'SELECT id, name, email, password, role, mobile, district, designation, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Email ya password galat hai' });

    const user = rows[0];
    if (!user.is_active)
      return res.status(403).json({ success: false, message: 'Account band hai. Admin se sampark karen.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Email ya password galat hai' });

    const token = generateToken(user.id, user.role);

    // Get officer profile if officer
    let officerProfile = null;
    if (user.role === 'officer') {
      const { rows: oRows } = await query(
        'SELECT id, availability, total_resolved, avg_days, employee_id FROM officers WHERE user_id = $1',
        [user.id]
      );
      officerProfile = oRows[0] || null;
    }

    delete user.password;
    res.json({
      success: true,
      message: `Swagat hai, ${user.name}!`,
      token,
      user: { ...user, officerProfile }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Dobara try karen.' });
  }
};

// POST /api/auth/register (public user)
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    if (!name || !email || !password || !mobile)
      return res.status(400).json({ success: false, message: 'Sab fields zaroori hain' });

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length)
      return res.status(409).json({ success: false, message: 'Yeh email pehle se registered hai' });

    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await query(
      'INSERT INTO users (id, name, email, password, mobile, role) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, name, email.toLowerCase(), hash, mobile, 'public']
    );

    const token = generateToken(id, 'public');
    res.status(201).json({
      success: true,
      message: 'Account ban gaya! Ab login kar sakte hain.',
      token,
      user: { id, name, email, mobile, role: 'public' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { rows } = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Purana password galat hai' });

    const hash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true, message: 'Password successfully badal gaya' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
