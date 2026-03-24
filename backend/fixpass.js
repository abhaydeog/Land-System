require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixPasswords() {
  try {
    // Step 1: Check current hash
    const res = await pool.query("SELECT email, password FROM users WHERE email = 'admin@bhumi.gov.in'");
    
    if (!res.rows.length) {
      console.log('❌ Admin user nahi mila! npm run seed chalayein pehle.');
      process.exit(1);
    }

    const currentHash = res.rows[0].password;
    console.log('Current hash:', currentHash.slice(0, 30) + '...');

    // Step 2: Test if Admin@123 matches
    const match = await bcrypt.compare('Admin@123', currentHash);
    console.log('Admin@123 match:', match);

    if (match) {
      console.log('✅ Password sahi hai! Login karna chahiye.');
      console.log('   Email: admin@bhumi.gov.in');
      console.log('   Password: Admin@123');
    } else {
      // Step 3: Fix - set new password
      console.log('🔄 Password match nahi hua — reset kar rahe hain...');
      const newHash = await bcrypt.hash('Admin@123', 12);
      
      await pool.query("UPDATE users SET password = $1 WHERE email = 'admin@bhumi.gov.in'", [newHash]);
      await pool.query("UPDATE users SET password = $1 WHERE email = 'rajesh@bhumi.gov.in'", [newHash]);
      await pool.query("UPDATE users SET password = $1 WHERE email = 'user@gmail.com'", [newHash]);
      
      console.log('✅ Teeno accounts ka password reset ho gaya!');
      console.log('   admin@bhumi.gov.in  → Admin@123');
      console.log('   rajesh@bhumi.gov.in → Admin@123');
      console.log('   user@gmail.com      → Admin@123');
    }

    // Step 4: Also check if backend is connecting correctly
    const count = await pool.query("SELECT COUNT(*) FROM users");
    console.log('\nDatabase mein total users:', count.rows[0].count);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

fixPasswords();
