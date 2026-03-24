const { query, getClient } = require('../config/db');
const { v4: uuidv4 }       = require('uuid');
const smsService           = require('../config/sms');

async function getNextComplaintNo() {
  const { rows } = await query("SELECT 'LND-' || nextval('complaint_seq') AS no");
  return rows[0].no;
}

// GET /api/complaints
exports.getAll = async (req, res) => {
  try {
    const { status, district, block, type, priority, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const params = [], conditions = [];

    if (req.user.role === 'officer') {
      const { rows: oRows } = await query('SELECT id FROM officers WHERE user_id = $1', [req.user.id]);
      if (oRows.length) { params.push(oRows[0].id); conditions.push(`c.assigned_officer = $${params.length}`); }
    }
    if (req.user.role === 'public') { params.push(req.user.id); conditions.push(`c.complainant_id = $${params.length}`); }
    if (status)   { params.push(status);       conditions.push(`c.status = $${params.length}`); }
    if (district) { params.push(district);     conditions.push(`c.district = $${params.length}`); }
    if (block)    { params.push(`%${block}%`); conditions.push(`c.block ILIKE $${params.length}`); }
    if (type)     { params.push(`%${type}%`);  conditions.push(`c.complaint_type ILIKE $${params.length}`); }
    if (priority) { params.push(priority);     conditions.push(`c.priority = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      const s = params.length;
      conditions.push(`(c.complaint_no ILIKE $${s} OR c.complainant_name ILIKE $${s} OR c.khasra ILIKE $${s} OR c.mobile ILIKE $${s})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query(`SELECT COUNT(*) FROM complaints c ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    params.push(limit, offset);

    const dataRes = await query(`
      SELECT c.id, c.complaint_no, c.complainant_name, c.mobile, c.complaint_type,
             c.khasra, c.district, c.block, c.thana, c.priority, c.status,
             c.created_at, c.assigned_at, c.resolved_at,
             u.name AS officer_name, o.designation AS officer_designation,
             (SELECT COUNT(*) FROM attachments a WHERE a.complaint_id = c.id) AS attachment_count
      FROM complaints c
      LEFT JOIN officers o ON c.assigned_officer = o.id
      LEFT JOIN users u ON o.user_id = u.id
      ${where}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`, params);

    res.json({ success: true, data: dataRes.rows, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('GetAll error:', err);
    res.status(500).json({ success: false, message: 'Data load nahi hua' });
  }
};

// GET /api/complaints/track/:no
exports.track = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT c.complaint_no, c.complainant_name, c.complaint_type, c.khasra,
             c.district, c.block, c.thana, c.status, c.priority, c.created_at, c.resolved_at,
             u.name AS officer_name, ou.mobile AS officer_mobile, o.designation
      FROM complaints c
      LEFT JOIN officers o ON c.assigned_officer = o.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users ou ON o.user_id = ou.id
      WHERE c.complaint_no = $1`, [req.params.no.toUpperCase()]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Shikayat ID galat hai ya nahi mili' });
    const { rows: acts } = await query(
      `SELECT action, note, done_by_name, created_at FROM complaint_activities
       WHERE complaint_id = (SELECT id FROM complaints WHERE complaint_no = $1)
       ORDER BY created_at ASC`, [req.params.no.toUpperCase()]);
    res.json({ success: true, data: { ...rows[0], timeline: acts } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// GET /api/complaints/:id
exports.getOne = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT c.*, u.name AS officer_name, o.designation, o.id AS officer_id, ou.mobile AS officer_mobile
      FROM complaints c
      LEFT JOIN officers o ON c.assigned_officer = o.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users ou ON o.user_id = ou.id
      WHERE c.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Shikayat nahi mili' });
    const [acts, files, hearings] = await Promise.all([
      query('SELECT * FROM complaint_activities WHERE complaint_id = $1 ORDER BY created_at ASC', [req.params.id]),
      query('SELECT id, filename, original_name, file_size, mime_type, created_at FROM attachments WHERE complaint_id = $1 ORDER BY created_at DESC', [req.params.id]),
      query('SELECT * FROM hearings WHERE complaint_id = $1 ORDER BY scheduled_at ASC', [req.params.id]),
    ]);
    res.json({ success: true, data: { ...rows[0], activities: acts.rows, attachments: files.rows, hearings: hearings.rows } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// POST /api/complaints (with file upload)
exports.create = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { complainant_name, mobile, father_name, aadhar, email, address,
            khasra, khata, district, block, circle, thana, mauza, halka,
            area_acres, land_type, complaint_type, priority, description,
            opponent_name, prev_action } = req.body;

    if (!complainant_name || !mobile || !khasra || !district || !block || !complaint_type || !description)
      return res.status(400).json({ success: false, message: 'Zaroori fields bharen' });

    const complaint_no = await getNextComplaintNo();
    const id = uuidv4();

    await client.query(`
      INSERT INTO complaints (id, complaint_no, complainant_id, complainant_name, mobile,
        father_name, aadhar, email, address, khasra, khata, district, block, circle, thana,
        mauza, halka, area_acres, land_type, complaint_type, priority, description,
        opponent_name, prev_action)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [id, complaint_no, req.user?.role === 'public' ? req.user.id : null,
       complainant_name, mobile, father_name, aadhar, email, address,
       khasra, khata, district, block, circle, thana, mauza, halka,
       area_acres || null, land_type, complaint_type, priority || 'Madhyam',
       description, opponent_name, prev_action]);

    // Save uploaded files
    const uploadedFiles = req.files || [];
    for (const file of uploadedFiles) {
      await client.query(`
        INSERT INTO attachments (id, complaint_id, filename, original_name, file_size, mime_type, uploaded_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [uuidv4(), id, file.filename, file.originalname, file.size, file.mimetype, req.user?.id || null]);
    }

    const fileNote = uploadedFiles.length ? ` | ${uploadedFiles.length} dastaavej upload kiye.` : '';
    await client.query(`
      INSERT INTO complaint_activities (complaint_id, action, note, done_by, done_by_name)
      VALUES ($1,'Shikayat Darj',$2,$3,$4)`,
      [id, `${complainant_name} ne ${block} block se shikayat darj ki.${fileNote}`,
       req.user?.id || null, complainant_name]);

    await client.query('COMMIT');

    // SMS (non-blocking)
    smsService.complaintRegistered(mobile, complainant_name, complaint_no, block)
      .then(r => console.log(`📱 SMS [${complaint_no}]:`, r.mode || r.error))
      .catch(e => console.log('SMS error:', e.message));

    res.status(201).json({
      success: true,
      message: `Shikayat ${complaint_no} darj ho gayi! SMS ${mobile} par bheja ja raha hai.`,
      data: { id, complaint_no, files_uploaded: uploadedFiles.length }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create error:', err);
    res.status(500).json({ success: false, message: 'Shikayat darj nahi hui.' });
  } finally { client.release(); }
};

// POST /api/complaints/:id/attachments
exports.addAttachments = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'Koi file nahi mili' });
    for (const file of files) {
      await query(`INSERT INTO attachments (id, complaint_id, filename, original_name, file_size, mime_type, uploaded_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [uuidv4(), req.params.id, file.filename, file.originalname, file.size, file.mimetype, req.user.id]);
    }
    await query(`INSERT INTO complaint_activities (complaint_id, action, note, done_by, done_by_name) VALUES ($1,'Dastaavej Jode',$2,$3,$4)`,
      [req.params.id, `${files.length} file(s) jodi gayi: ${files.map(f=>f.originalname).join(', ')}`, req.user.id, req.user.name]);
    res.json({ success: true, message: `${files.length} file(s) upload ho gayi` });
  } catch (err) { res.status(500).json({ success: false, message: 'Upload nahi hua' }); }
};

// PUT /api/complaints/:id/assign
exports.assign = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { officer_id } = req.body;
    const { rows: oRows } = await client.query(
      'SELECT o.id, u.name, u.mobile FROM officers o JOIN users u ON o.user_id = u.id WHERE o.id = $1', [officer_id]);
    if (!oRows.length) return res.status(404).json({ success: false, message: 'Officer nahi mila' });
    await client.query(`UPDATE complaints SET assigned_officer=$1, assigned_at=NOW(), status='Niyukt', updated_at=NOW() WHERE id=$2`, [officer_id, req.params.id]);
    await client.query(`INSERT INTO complaint_activities (complaint_id, action, note, done_by, done_by_name) VALUES ($1,'Adhikari Niyukt',$2,$3,$4)`,
      [req.params.id, `${oRows[0].name} ko niyukt kiya gaya`, req.user.id, req.user.name]);
    const { rows: cRows } = await client.query('SELECT mobile, complainant_name, complaint_no FROM complaints WHERE id=$1', [req.params.id]);
    await client.query('COMMIT');
    if (cRows[0]?.mobile) smsService.officerAssigned(cRows[0].mobile, cRows[0].complainant_name, cRows[0].complaint_no, oRows[0].name, oRows[0].mobile).catch(e=>console.log('SMS:',e.message));
    res.json({ success: true, message: `${oRows[0].name} ko niyukt kiya gaya` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Assign nahi hua' });
  } finally { client.release(); }
};

// PUT /api/complaints/:id/status
exports.updateStatus = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { status, note } = req.body;
    const valid = ['Nayi','Niyukt','Vichaaradheen','Nipatara','Viprit'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const upd = status === 'Nipatara' ? 'status=$1, resolved_at=NOW(), resolution_note=$2, updated_at=NOW()' : 'status=$1, updated_at=NOW()';
    await client.query(`UPDATE complaints SET ${upd} WHERE id=$${status==='Nipatara'?3:2}`,
      status === 'Nipatara' ? [status, note, req.params.id] : [status, req.params.id]);
    await client.query(`INSERT INTO complaint_activities (complaint_id, action, note, done_by, done_by_name) VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, `Status: ${status}`, note || '', req.user.id, req.user.name]);
    const { rows: cRows } = await client.query('SELECT mobile, complainant_name, complaint_no FROM complaints WHERE id=$1', [req.params.id]);
    await client.query('COMMIT');
    if (cRows[0]?.mobile) {
      const fn = status === 'Nipatara' ? smsService.resolved(cRows[0].mobile, cRows[0].complainant_name, cRows[0].complaint_no)
                                       : smsService.statusUpdate(cRows[0].mobile, cRows[0].complainant_name, cRows[0].complaint_no, status);
      fn.catch(e => console.log('SMS:', e.message));
    }
    res.json({ success: true, message: `Status "${status}" update ho gaya` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Update nahi hua' });
  } finally { client.release(); }
};

// POST /api/complaints/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ success: false, message: 'Tippani likhein' });
    await query(`INSERT INTO complaint_activities (complaint_id, action, note, done_by, done_by_name) VALUES ($1,'Tippani',$2,$3,$4)`,
      [req.params.id, note, req.user.id, req.user.name]);
    res.json({ success: true, message: 'Tippani jodi gayi' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
};

// DELETE /api/complaints/:id
exports.delete = async (req, res) => {
  try {
    await query('DELETE FROM complaints WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Delete ho gayi' });
  } catch (err) { res.status(500).json({ success: false, message: 'Delete nahi hua' }); }
};

// DELETE /api/complaints/:id/attachments/:fileId
exports.deleteAttachment = async (req, res) => {
  try {
    const { rows } = await query('SELECT filename FROM attachments WHERE id=$1 AND complaint_id=$2', [req.params.fileId, req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'File nahi mili' });
    await query('DELETE FROM attachments WHERE id=$1', [req.params.fileId]);
    const filePath = require('path').join(__dirname, '../../uploads', rows[0].filename);
    require('fs').unlink(filePath, err => { if(err) console.log('File delete:', err.message); });
    res.json({ success: true, message: 'File delete ho gayi' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
};
