require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('../config/db');

const migrations = `

-- Users table (Admin, Officer, Public)
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(200) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  mobile       VARCHAR(15) NOT NULL,
  role         VARCHAR(20) NOT NULL CHECK (role IN ('admin','officer','public')),
  district     VARCHAR(100),
  designation  VARCHAR(150),
  employee_id  VARCHAR(50),
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Officers extended profile
CREATE TABLE IF NOT EXISTS officers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  district     VARCHAR(100) NOT NULL,
  block        VARCHAR(100),
  designation  VARCHAR(150) NOT NULL,
  employee_id  VARCHAR(50) UNIQUE NOT NULL,
  availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available','busy','on_leave')),
  total_resolved INT DEFAULT 0,
  avg_days     NUMERIC(5,2) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_no    VARCHAR(20) UNIQUE NOT NULL,
  complainant_id  UUID REFERENCES users(id),
  complainant_name VARCHAR(150) NOT NULL,
  mobile          VARCHAR(15) NOT NULL,
  father_name     VARCHAR(150),
  aadhar          VARCHAR(20),
  email           VARCHAR(200),
  address         TEXT NOT NULL,
  -- Land details
  khasra          VARCHAR(50) NOT NULL,
  khata           VARCHAR(50),
  district        VARCHAR(100) NOT NULL,
  block           VARCHAR(100) NOT NULL,
  mauza           VARCHAR(100),
  halka           VARCHAR(50),
  area_acres      NUMERIC(10,4),
  land_type       VARCHAR(50),
  -- Complaint details
  complaint_type  VARCHAR(100) NOT NULL,
  priority        VARCHAR(30) DEFAULT 'Madhyam' CHECK (priority IN ('Neem','Madhyam','Uchcha','Atyadhik Uchcha')),
  description     TEXT NOT NULL,
  opponent_name   VARCHAR(200),
  prev_action     TEXT,
  -- Assignment
  assigned_officer UUID REFERENCES officers(id),
  assigned_at     TIMESTAMP,
  -- Status
  status          VARCHAR(30) DEFAULT 'Nayi' CHECK (status IN ('Nayi','Niyukt','Vichaaradheen','Nipatara','Viprit')),
  resolution_note TEXT,
  resolved_at     TIMESTAMP,
  -- Meta
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Auto-increment complaint number sequence
CREATE SEQUENCE IF NOT EXISTS complaint_seq START 1001;

-- Complaint timeline / activity log
CREATE TABLE IF NOT EXISTS complaint_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id  UUID REFERENCES complaints(id) ON DELETE CASCADE,
  action        VARCHAR(100) NOT NULL,
  note          TEXT,
  done_by       UUID REFERENCES users(id),
  done_by_name  VARCHAR(150),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- File attachments
CREATE TABLE IF NOT EXISTS attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id  UUID REFERENCES complaints(id) ON DELETE CASCADE,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size     INT,
  mime_type     VARCHAR(100),
  uploaded_by   UUID REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Hearings / Sunavayi
CREATE TABLE IF NOT EXISTS hearings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id  UUID REFERENCES complaints(id) ON DELETE CASCADE,
  officer_id    UUID REFERENCES officers(id),
  scheduled_at  TIMESTAMP NOT NULL,
  location      VARCHAR(255),
  hearing_type  VARCHAR(50),
  status        VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
  outcome       TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Notifications log
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  complaint_id  UUID REFERENCES complaints(id),
  type          VARCHAR(30) CHECK (type IN ('sms','email','push')),
  message       TEXT NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  sent_at       TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_status     ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_district   ON complaints(district);
CREATE INDEX IF NOT EXISTS idx_complaints_officer    ON complaints(assigned_officer);
CREATE INDEX IF NOT EXISTS idx_complaints_created    ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_no         ON complaints(complaint_no);
CREATE INDEX IF NOT EXISTS idx_activities_complaint  ON complaint_activities(complaint_id);

`;

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🔄 Database tables create ho rahi hain...');
    await client.query(migrations);
    console.log('✅ Sab tables successfully create ho gayi!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigrations();
