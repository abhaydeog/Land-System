const { query } = require('../config/db');

// GET /api/dashboard/stats
// Admin → sab data | Officer → sirf apne block/circle ki shikayaten
exports.getStats = async (req, res) => {
  try {
    const isOfficer = req.user.role === 'officer';

    // ── Officer ka block aur officer_id dhundho ──
    let officerFilter = '';
    let officerBlock  = null;
    let officerCircle = null;
    let officerId     = null;

    if (isOfficer) {
      const { rows: oRows } = await query(
        `SELECT o.id, o.block, o.district, u.name
         FROM officers o
         JOIN users u ON o.user_id = u.id
         WHERE o.user_id = $1`,
        [req.user.id]
      );

      if (!oRows.length) {
        return res.status(403).json({
          success: false,
          message: 'Aapka officer profile nahi mila. Admin se sampark karen.'
        });
      }

      officerId     = oRows[0].id;
      officerBlock  = oRows[0].block;
      officerCircle = oRows[0].district; // circle as district

      // Filter: sirf is officer ko assigned shikayaten
      officerFilter = `WHERE c.assigned_officer = '${officerId}'`;
    }

    const where = officerFilter || '';

    // ── Summary stats ──
    const totalRes = await query(`
      SELECT
        COUNT(*)                                                              AS total,
        COUNT(*) FILTER (WHERE status = 'Nayi')                              AS nayi,
        COUNT(*) FILTER (WHERE status = 'Niyukt')                           AS niyukt,
        COUNT(*) FILTER (WHERE status = 'Vichaaradheen')                    AS vichaaradheen,
        COUNT(*) FILTER (WHERE status = 'Nipatara')                         AS nipatara,
        COUNT(*) FILTER (WHERE status = 'Viprit')                           AS viprit,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')    AS this_month,
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400)
              FILTER (WHERE status='Nipatara'), 1)                           AS avg_days
      FROM complaints c
      ${where}`
    );

    // ── Status breakdown ──
    const byStatusRes = await query(`
      SELECT status, COUNT(*) AS count
      FROM complaints c
      ${where}
      GROUP BY status`
    );

    // ── Block/District breakdown ──
    const byDistrictRes = await query(`
      SELECT c.block AS district, COUNT(*) AS count
      FROM complaints c
      ${where}
      GROUP BY c.block
      ORDER BY count DESC
      LIMIT 10`
    );

    // ── Complaint type breakdown ──
    const byTypeRes = await query(`
      SELECT complaint_type, COUNT(*) AS count
      FROM complaints c
      ${where}
      GROUP BY complaint_type
      ORDER BY count DESC
      LIMIT 8`
    );

    // ── Recent complaints ──
    const recentRes = await query(`
      SELECT c.id, c.complaint_no, c.complainant_name, c.complaint_type,
             c.district, c.block, c.thana, c.status, c.priority, c.created_at,
             u.name AS officer_name
      FROM complaints c
      LEFT JOIN officers o ON c.assigned_officer = o.id
      LEFT JOIN users u ON o.user_id = u.id
      ${where}
      ORDER BY c.created_at DESC
      LIMIT 8`
    );

    // ── Officer stats ──
    // Admin → sab officers | Officer → sirf khud ka
    let officerStatsRes;
    if (isOfficer) {
      officerStatsRes = await query(`
        SELECT u.name, o.block AS district, o.designation, o.availability,
               o.total_resolved, o.avg_days,
               COUNT(c.id) FILTER (WHERE c.status NOT IN ('Nipatara','Viprit')) AS active_count,
               COUNT(c.id) FILTER (WHERE c.status = 'Nipatara')                AS resolved_count
        FROM officers o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN complaints c ON c.assigned_officer = o.id
        WHERE o.id = $1
        GROUP BY o.id, u.name`,
        [officerId]
      );
    } else {
      officerStatsRes = await query(`
        SELECT u.name, o.block AS district, o.designation, o.availability,
               o.total_resolved, o.avg_days,
               COUNT(c.id) FILTER (WHERE c.status NOT IN ('Nipatara','Viprit')) AS active_count,
               COUNT(c.id) FILTER (WHERE c.status = 'Nipatara')                AS resolved_count
        FROM officers o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN complaints c ON c.assigned_officer = o.id
        GROUP BY o.id, u.name
        ORDER BY active_count DESC`
      );
    }

    res.json({
      success: true,
      data: {
        summary:          totalRes.rows[0],
        byStatus:         byStatusRes.rows,
        byDistrict:       byDistrictRes.rows,
        byType:           byTypeRes.rows,
        recentComplaints: recentRes.rows,
        officerStats:     officerStatsRes.rows,
        // Officer info for frontend display
        officerInfo: isOfficer ? {
          block:  officerBlock,
          circle: officerCircle,
          id:     officerId
        } : null,
        isOfficer
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Dashboard data nahi aaya' });
  }
};

// GET /api/reports/monthly
// Admin → sab | Officer → sirf apna
exports.getMonthly = async (req, res) => {
  try {
    let where = '';
    if (req.user.role === 'officer') {
      const { rows } = await query('SELECT id FROM officers WHERE user_id = $1', [req.user.id]);
      if (rows.length) where = `AND c.assigned_officer = '${rows[0].id}'`;
    }

    const { rows } = await query(`
      SELECT
        TO_CHAR(c.created_at, 'YYYY-MM')  AS month,
        TO_CHAR(c.created_at, 'Mon YYYY') AS month_label,
        COUNT(*)                           AS total,
        COUNT(*) FILTER (WHERE c.status = 'Nipatara')  AS resolved,
        COUNT(*) FILTER (WHERE c.status = 'Viprit')    AS escalated,
        ROUND(AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/86400)
              FILTER (WHERE c.status='Nipatara'), 1)   AS avg_days
      FROM complaints c
      WHERE c.created_at >= NOW() - INTERVAL '12 months'
      ${where}
      GROUP BY 1, 2
      ORDER BY 1 DESC`);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Report nahi aaya' });
  }
};

// GET /api/reports/officer-performance
// Admin → sab | Officer → sirf khud ka
exports.getOfficerPerformance = async (req, res) => {
  try {
    let extraWhere = '';
    if (req.user.role === 'officer') {
      const { rows } = await query('SELECT id FROM officers WHERE user_id = $1', [req.user.id]);
      if (rows.length) extraWhere = `AND o.id = '${rows[0].id}'`;
    }

    const { rows } = await query(`
      SELECT u.name, o.block AS district, o.designation,
        COUNT(c.id)                                                           AS total_assigned,
        COUNT(c.id) FILTER (WHERE c.status = 'Nipatara')                    AS resolved,
        COUNT(c.id) FILTER (WHERE c.status NOT IN ('Nipatara','Viprit'))    AS active,
        ROUND(
          (COUNT(c.id) FILTER (WHERE c.status = 'Nipatara')::NUMERIC
           / NULLIF(COUNT(c.id), 0)) * 100, 1
        )                                                                     AS resolution_rate,
        ROUND(AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/86400)
              FILTER (WHERE c.status='Nipatara'), 1)                         AS avg_days
      FROM officers o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN complaints c ON c.assigned_officer = o.id
      WHERE 1=1 ${extraWhere}
      GROUP BY o.id, u.name
      ORDER BY resolution_rate DESC NULLS LAST`);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Report nahi aaya' });
  }
};
