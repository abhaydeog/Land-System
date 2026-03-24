require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Deoghar district ka data insert ho raha hai...');
    await client.query('BEGIN');

    // ── Pehle purana data saaf karo ──
    await client.query('DELETE FROM complaint_activities');
    await client.query('DELETE FROM hearings');
    await client.query('DELETE FROM attachments');
    await client.query('DELETE FROM complaints');
    await client.query('DELETE FROM officers');
    await client.query('DELETE FROM users');
    await client.query('SELECT setval(\'complaint_seq\', 1000, false)');
    console.log('✅ Purana data saaf ho gaya');

    // ── Admin ──
    const adminId = uuidv4();
    const adminHash = await bcrypt.hash('Admin@123', 12);
    await client.query(`
      INSERT INTO users (id, name, email, password, mobile, role, district, designation)
      VALUES ($1,$2,$3,$4,$5,'admin','Deoghar','District Collector')`,
      [adminId, 'Ram Avtar Singh', 'admin@bhumi.gov.in', adminHash, '9431234567']);

    // ── Officers — Deoghar ke sabhi blocks ke liye ──
    const officerData = [
      { name: 'Rajesh Kumar Sharma',  email: 'rajesh@bhumi.gov.in',   mob: '9431111111', block: 'Deoghar',      desig: 'Rajaswa Nirikshak', empId: 'DEO001', resolved: 42, avg: 11 },
      { name: 'Priya Kumari',         email: 'priya@bhumi.gov.in',    mob: '9432222222', block: 'Madhupur',     desig: 'Patwari',           empId: 'DEO002', resolved: 38, avg: 13 },
      { name: 'Suresh Oraon',         email: 'suresh@bhumi.gov.in',   mob: '9433333333', block: 'Mohanpur',     desig: 'Ameen',             empId: 'DEO003', resolved: 29, avg: 15 },
      { name: 'Anita Kumari',         email: 'anita@bhumi.gov.in',    mob: '9434444444', block: 'Devipur',      desig: 'Rajaswa Nirikshak', empId: 'DEO004', resolved: 51, avg:  9 },
      { name: 'Manoj Kumar Yadav',    email: 'manoj@bhumi.gov.in',    mob: '9435555555', block: 'Sarwan',       desig: 'Naib Tahsildar',    empId: 'DEO005', resolved: 33, avg: 12 },
      { name: 'Sunita Devi',          email: 'sunita@bhumi.gov.in',   mob: '9436666666', block: 'Sonaraithari', desig: 'Patwari',           empId: 'DEO006', resolved: 27, avg: 14 },
      { name: 'Amit Kumar Singh',     email: 'amit@bhumi.gov.in',     mob: '9437777777', block: 'Sarath',       desig: 'Ameen',             empId: 'DEO007', resolved: 19, avg: 16 },
      { name: 'Kavita Mahto',         email: 'kavita@bhumi.gov.in',   mob: '9438888888', block: 'Palajori',     desig: 'Rajaswa Nirikshak', empId: 'DEO008', resolved: 22, avg: 13 },
      { name: 'Birendra Nath Tiwari', email: 'birendra@bhumi.gov.in', mob: '9439999999', block: 'Karown',       desig: 'Patwari',           empId: 'DEO009', resolved: 16, avg: 18 },
      { name: 'Geeta Singh',          email: 'geeta@bhumi.gov.in',    mob: '9430000000', block: 'Margomunda',   desig: 'Ameen',             empId: 'DEO010', resolved: 14, avg: 17 },
    ];

    const officerHash = await bcrypt.hash('Officer@123', 12);
    const officerIds = {};

    for (const o of officerData) {
      const uid = uuidv4();
      await client.query(`
        INSERT INTO users (id, name, email, password, mobile, role, district, designation)
        VALUES ($1,$2,$3,$4,$5,'officer','Deoghar',$6)`,
        [uid, o.name, o.email, officerHash, o.mob, o.desig]);

      const oid = uuidv4();
      await client.query(`
        INSERT INTO officers (id, user_id, district, block, designation, employee_id, total_resolved, avg_days, availability)
        VALUES ($1,$2,'Deoghar',$3,$4,$5,$6,$7,'available')`,
        [oid, uid, o.block, o.desig, o.empId, o.resolved, o.avg]);

      officerIds[o.block] = oid;
    }

    // ── Public User ──
    const pubHash = await bcrypt.hash('User@123', 12);
    const pubId = uuidv4();
    await client.query(`
      INSERT INTO users (id, name, email, password, mobile, role, district)
      VALUES ($1,'Ramesh Kumar Deoghar','user@gmail.com',$2,'9876543210','public','Deoghar')`,
      [pubId, pubHash]);

    // ── Sample Complaints — Deoghar blocks/thanas ──
    const complaints = [
      // Deoghar block
      { name: 'Ramesh Kumar Mandal',  mob: '9876501001', addr: 'Rikhia, Deoghar',          khasra: '245/3',  khata: '89',  block: 'Deoghar',      circle: 'Deoghar Circle',      thana: 'Deoghar Town',  mauza: 'Rikhia',       type: 'Seema Vivad (Boundary Dispute)',         priority: 'Uchcha',          status: 'Vichaaradheen', desc: 'Padosi Shyam Lal ne meri 0.5 acre zameen ki seema tod kar nirmaan shuru kar diya hai. Pichle 6 mahine se vivad chal raha hai.' },
      { name: 'Sunita Devi Mahto',    mob: '9876501002', addr: 'Jasidih, Deoghar',          khasra: '112/1',  khata: '34',  block: 'Deoghar',      circle: 'Deoghar Circle',      thana: 'Jasidih',       mauza: 'Jasidih',      type: 'Naap-Jokh Galat (Wrong Survey)',         priority: 'Madhyam',         status: 'Niyukt',        desc: 'Ameen ne galat naap-jokh ki aur mera rakba 2.5 acre se ghatakar 1.8 acre kar diya. Sahi naap-jokh karwaani hai.' },
      { name: 'Mohan Prasad Yadav',   mob: '9876501003', addr: 'Trikut Nagar, Deoghar',     khasra: '78/A',   khata: '56',  block: 'Deoghar',      circle: 'Deoghar Circle',      thana: 'Baba Mandir',   mauza: 'Trikut',       type: 'Daakhal / Kabza (Encroachment)',         priority: 'Atyadhik Uchcha', status: 'Nipatara',      desc: 'Kisi ne bina anumati ke meri zameen par pucca nirmaan shuru kar diya tha. Nipatara ho gaya.' },
      // Madhupur block
      { name: 'Binod Kumar Singh',    mob: '9876501004', addr: 'Madhupur, Deoghar',         khasra: '321/2',  khata: '78',  block: 'Madhupur',     circle: 'Madhupur Circle',     thana: 'Madhupur',      mauza: 'Madhupur',     type: 'Naksha Sudhar (Map Correction)',         priority: 'Madhyam',         status: 'Vichaaradheen', desc: 'Rajaswa naksha mein mera naam galat darj hai. Sahih naam update karwana hai.' },
      { name: 'Kamla Devi',           mob: '9876501005', addr: 'Chittaranjan, Madhupur',    khasra: '89/5',   khata: '23',  block: 'Madhupur',     circle: 'Madhupur Circle',     thana: 'Madhupur',      mauza: 'Gidhour',      type: 'Vanshanusar Haqqum (Inheritance Rights)', priority: 'Uchcha',          status: 'Nayi',          desc: 'Pitaji ke nidhan ke baad zameen ka transfer mere naam par nahi hua. Vanshanusar haq chahiye.' },
      { name: 'Arun Kumar Tiwari',    mob: '9876501006', addr: 'Vidyasagar, Madhupur',      khasra: '456/1',  khata: '90',  block: 'Madhupur',     circle: 'Madhupur Circle',     thana: 'Madhupur',      mauza: 'Vidyasagar',   type: 'Jamabandi Sudhar (Revenue Record Correction)', priority: 'Madhyam',    status: 'Nipatara',      desc: 'Jamabandi mein galat khasra number darj tha. Sudhar ho gaya.' },
      // Mohanpur block
      { name: 'Savita Kumari',        mob: '9876501007', addr: 'Mohanpur, Deoghar',         khasra: '33/4',   khata: '45',  block: 'Mohanpur',     circle: 'Mohanpur Circle',     thana: 'Mohanpur',      mauza: 'Dahijor',      type: 'Seema Vivad (Boundary Dispute)',         priority: 'Uchcha',          status: 'Vichaaradheen', desc: 'Khet ki seema par deewar banane par vivad hua. Dono paksh aayen hain.' },
      { name: 'Rajan Kumar Mahto',    mob: '9876501008', addr: 'Amtala, Mohanpur',          khasra: '201/B',  khata: '67',  block: 'Mohanpur',     circle: 'Mohanpur Circle',     thana: 'Mohanpur',      mauza: 'Amtala',       type: 'Parijdan / Transfer (Mutation)',         priority: 'Neem',            status: 'Nayi',          desc: 'Zameen khareedi hai lekin mutation nahi hua abhi tak.' },
      // Devipur block
      { name: 'Geeta Kumari Soren',   mob: '9876501009', addr: 'Devipur, Deoghar',          khasra: '567/3',  khata: '12',  block: 'Devipur',      circle: 'Devipur Circle',      thana: 'Devipur',       mauza: 'Nona',         type: 'Sarkari Bhumi Par Daava (Govt Land Claim)', priority: 'Atyadhik Uchcha', status: 'Viprit',       desc: 'Sarkari zameen par galat daava kiya ja raha hai. Adalat mein appeal ki gayi.' },
      { name: 'Dilip Kumar Roy',      mob: '9876501010', addr: 'Amgachi, Devipur',          khasra: '88/2',   khata: '34',  block: 'Devipur',      circle: 'Devipur Circle',      thana: 'Devipur',       mauza: 'Amgachi',      type: 'Naap-Jokh Galat (Wrong Survey)',         priority: 'Madhyam',         status: 'Niyukt',        desc: 'Plot ki sahi naap nahi hui. Ameen se dubara naap karwana chahta hoon.' },
      // Sarwan block
      { name: 'Hemant Kumar Sharma',  mob: '9876501011', addr: 'Sarwan, Deoghar',           khasra: '99/1',   khata: '56',  block: 'Sarwan',       circle: 'Sarwan Circle',       thana: 'Sarwan',        mauza: 'Banjhi',       type: 'Daakhal / Kabza (Encroachment)',         priority: 'Uchcha',          status: 'Vichaaradheen', desc: 'Mera khet 2 saal se kisi aur ke kabze mein hai. Wapas dilwaya jaaye.' },
      { name: 'Pushpa Devi',          mob: '9876501012', addr: 'Khaira, Sarwan',            khasra: '144/5',  khata: '78',  block: 'Sarwan',       circle: 'Sarwan Circle',       thana: 'Sarwan',        mauza: 'Khaira',       type: 'Rasid / Lagaan Vivad (Revenue Receipt Dispute)', priority: 'Neem',      status: 'Nayi',          desc: 'Lagaan jama karne ke baad rasid nahi mili.' },
      // Sonaraithari block
      { name: 'Vikram Kumar Paswan',  mob: '9876501013', addr: 'Sonaraithari, Deoghar',     khasra: '303/2',  khata: '89',  block: 'Sonaraithari', circle: 'Sonaraithari Circle', thana: 'Sonaraithari',  mauza: 'Barachatti',   type: 'Seema Vivad (Boundary Dispute)',         priority: 'Madhyam',         status: 'Vichaaradheen', desc: 'Padosi ke saath khet ki seema par chhote vivad ko suljhana hai.' },
      { name: 'Rekha Kumari Yadav',   mob: '9876501014', addr: 'Bahiyar, Sonaraithari',     khasra: '77/4',   khata: '23',  block: 'Sonaraithari', circle: 'Sonaraithari Circle', thana: 'Sonaraithari',  mauza: 'Bahiyar',      type: 'Naksha Sudhar (Map Correction)',         priority: 'Neem',            status: 'Nipatara',      desc: 'Naksha mein survey number galat tha. Sudhar ho gaya.' },
      // Sarath block
      { name: 'Naresh Kumar Tiwari',  mob: '9876501015', addr: 'Sarath, Deoghar',           khasra: '210/1',  khata: '45',  block: 'Sarath',       circle: 'Sarath Circle',       thana: 'Sarath',        mauza: 'Khijuri',      type: 'Bhumi Adhigrahan Vivad (Acquisition Dispute)', priority: 'Atyadhik Uchcha', status: 'Vichaaradheen', desc: 'Bina uchit muaavze ke zameen adhigrahit kar li gayi. Uchit muaavza manga ja raha hai.' },
      { name: 'Meena Devi Mahto',     mob: '9876501016', addr: 'Palamu, Sarath',            khasra: '55/3',   khata: '67',  block: 'Sarath',       circle: 'Sarath Circle',       thana: 'Sarath',        mauza: 'Palamu',       type: 'Vanshanusar Haqqum (Inheritance Rights)', priority: 'Madhyam',         status: 'Niyukt',        desc: 'Daadi ki zameen par 3 bhai haq maang rahe hain. Batwara nahi hua.' },
      // Palajori block
      { name: 'Sunil Kumar Sinha',    mob: '9876501017', addr: 'Palajori, Deoghar',         khasra: '432/2',  khata: '90',  block: 'Palajori',     circle: 'Palajori Circle',     thana: 'Palajori',      mauza: 'Amgaon',       type: 'Parijdan / Transfer (Mutation)',         priority: 'Madhyam',         status: 'Nayi',          desc: 'Plot khareeda 6 mahine pehle lekin abhi tak mutation nahi hua.' },
      { name: 'Laxmi Devi',           mob: '9876501018', addr: 'Chandankyari, Palajori',    khasra: '188/1',  khata: '12',  block: 'Palajori',     circle: 'Palajori Circle',     thana: 'Palajori',      mauza: 'Chandankyari', type: 'Jamabandi Sudhar (Revenue Record Correction)', priority: 'Neem',       status: 'Nipatara',      desc: 'Jamabandi sudhar ho gayi. Sahi naam darj ho gaya.' },
      // Karown block
      { name: 'Ajay Kumar Gupta',     mob: '9876501019', addr: 'Karown, Deoghar',           khasra: '321/4',  khata: '34',  block: 'Karown',       circle: 'Karown Circle',       thana: 'Karown',        mauza: 'Bagodar',      type: 'Seema Vivad (Boundary Dispute)',         priority: 'Uchcha',          status: 'Vichaaradheen', desc: 'Khet ki seema par kanta laga diya gaya jo galat jagah hai. Sahi seema nidhaarit karwaani hai.' },
      { name: 'Poonam Kumari',        mob: '9876501020', addr: 'Madanpur, Karown',          khasra: '67/2',   khata: '56',  block: 'Karown',       circle: 'Karown Circle',       thana: 'Karown',        mauza: 'Madanpur',     type: 'Naap-Jokh Galat (Wrong Survey)',         priority: 'Madhyam',         status: 'Nayi',          desc: 'Purani naap-jokh mein galti hai, naya survey chahiye.' },
      // Margomunda block
      { name: 'Rohit Kumar Mandal',   mob: '9876501021', addr: 'Margomunda, Deoghar',       khasra: '500/1',  khata: '78',  block: 'Margomunda',   circle: 'Margomunda Circle',   thana: 'Margomunda',    mauza: 'Pathrol',      type: 'Daakhal / Kabza (Encroachment)',         priority: 'Uchcha',          status: 'Vichaaradheen', desc: 'Gaon ka mukhiya meri zameen par kabza kar raha hai. Madad chahiye.' },
      { name: 'Sita Devi Oraon',      mob: '9876501022', addr: 'Dhawatand, Margomunda',     khasra: '234/3',  khata: '90',  block: 'Margomunda',   circle: 'Margomunda Circle',   thana: 'Margomunda',    mauza: 'Dhawatand',    type: 'Vanadhikar (Forest Rights)',             priority: 'Atyadhik Uchcha', status: 'Nayi',          desc: 'Van adhikar patta milna chahiye lekin abhi tak nahi mila.' },
    ];

    for (const c of complaints) {
      const cid = uuidv4();
      const ofc = officerIds[c.block] || null;

      await client.query(`
        INSERT INTO complaints (
          id, complaint_no, complainant_name, mobile, address,
          khasra, khata, district, block, mauza, thana,
          complaint_type, priority, description, status,
          assigned_officer, assigned_at
        ) VALUES ($1, 'LND-'||nextval('complaint_seq'), $2,$3,$4,$5,$6,
          'Deoghar',$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [cid, c.name, c.mob, c.addr, c.khasra, c.khata,
         c.block, c.mauza, c.thana, c.type, c.priority,
         c.desc, c.status, ofc, ofc ? new Date() : null]);

      // Timeline activities
      await client.query(`
        INSERT INTO complaint_activities (complaint_id, action, note, done_by_name)
        VALUES ($1,'Shikayat Darj',$2,'System')`,
        [cid, `${c.name} ne ${c.block} block se shikayat darj ki`]);

      if (ofc) {
        const offName = officerData.find(o => o.block === c.block)?.name || 'Officer';
        await client.query(`
          INSERT INTO complaint_activities (complaint_id, action, note, done_by_name)
          VALUES ($1,'Adhikari Niyukt',$2,'Admin')`,
          [cid, `${offName} ko ${c.block} block ki shikayat ke liye niyukt kiya`]);
      }

      if (c.status === 'Nipatara') {
        await client.query(`
          INSERT INTO complaint_activities (complaint_id, action, note, done_by_name)
          VALUES ($1,'Status: Nipatara','Shikayat ka safaltapurvak nipatara ho gaya','Officer')`,
          [cid]);
        await client.query(
          `UPDATE complaints SET resolved_at = NOW() - interval '5 days' WHERE id = $1`, [cid]);
      }

      if (c.status === 'Vichaaradheen') {
        await client.query(`
          INSERT INTO complaint_activities (complaint_id, action, note, done_by_name)
          VALUES ($1,'Status: Vichaaradheen','Sthal nireekshan nirdharit kiya gaya','Officer')`,
          [cid]);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Deoghar district ka data successfully insert ho gaya!');
    console.log(`📊 Kul shikayaten: ${complaints.length}`);
    console.log(`👤 Officers: ${officerData.length} (10 blocks ke liye)`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:   admin@bhumi.gov.in   / Admin@123');
    console.log('   Officer: rajesh@bhumi.gov.in  / Officer@123');
    console.log('   Public:  user@gmail.com        / User@123\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
