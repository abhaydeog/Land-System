const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// GET /api/officers
exports.getAll = async (req, res) => {
  try {
    const { district, availability } = req.query;
    const params = [];
    const conditions = [];

    if (district)     { params.push(district);     conditions.push(`o.district = $${params.length}`); }
    if (availability) { params.push(availability); conditions.push(`o.availability = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(`
      SELECT o.id, o.district, o.designation, o.employee_id, o.availability,
             o.total_resolved, o.avg_days,
             u.name, u.email, u.mobile, u.is_active,
             COUNT(c.id) FILTER (WHERE c.status NOT IN ('Nipatara','Viprit')) AS active_complaints
      FROM officers o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN complaints c ON c.assigned_officer = o.id
      ${where}
      GROUP BY o.id, u.name, u.email, u.mobile, u.is_active
      ORDER BY u.name`, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Officers load nahi hue' });
  }
};

// POST /api/officers  (admin only)
exports.create = async (req, res) => {
  try {
    const { name, email, mobile, district, designation, employee_id, block } = req.body;
    if (!name || !email || !mobile || !district || !designation || !employee_id)
      return res.status(400).json({ success: false, message: 'Sab zaroori fields bharen' });

    const existing = await query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (existing.rows.length)
      return res.status(409).json({ success: false, message: 'Yeh email pehle se hai' });

    const hash = await bcrypt.hash('Officer@123', 12);
    const uid = uuidv4();
    const oid = uuidv4();

    await query(
      `INSERT INTO users (id,name,email,password,mobile,role,district,designation) VALUES ($1,$2,$3,$4,$5,'officer',$6,$7)`,
      [uid, name, email.toLowerCase(), hash, mobile, district, designation]
    );
    await query(
      `INSERT INTO officers (id,user_id,district,designation,employee_id,block) VALUES ($1,$2,$3,$4,$5,$6)`,
      [oid, uid, district, designation, employee_id, block]
    );

    res.status(201).json({
      success: true,
      message: `${name} ko successfully joda gaya. Default password: Officer@123`,
      data: { id: oid }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Officer nahi bana' });
  }
};

// PUT /api/officers/:id/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    await query('UPDATE officers SET availability=$1 WHERE id=$2', [availability, req.params.id]);
    res.json({ success: true, message: 'Availability update ho gayi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update nahi hua' });
  }
};

// GET /api/officers/:id/complaints
exports.getComplaints = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT complaint_no, complainant_name, complaint_type, district, status, created_at
       FROM complaints WHERE assigned_officer = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Data nahi mila' });
  }
};
