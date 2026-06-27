/**
 * Database Seed Script — adds sample lawyers and clients
 * Usage: node database/seed.js
 */
require('dotenv').config({ path: './backend/.env' });
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...\n');

  const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT || 3306),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'legal_marketplace',
    multipleStatements: true,
    ...(sslConfig ? { ssl: sslConfig } : {}),
  });

  const hash = await bcrypt.hash('Password123!', 12);

  // Seed clients
  const clients = [
    { email: 'alice@example.com', first_name: 'Alice', last_name: 'Johnson', city: 'Los Angeles', state: 'CA' },
    { email: 'bob@example.com',   first_name: 'Bob',   last_name: 'Smith',   city: 'Houston',     state: 'TX' },
    { email: 'carol@example.com', first_name: 'Carol', last_name: 'Davis',   city: 'Chicago',     state: 'IL' },
  ];

  for (const c of clients) {
    const [r] = await db.execute(
      `INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name) VALUES (?,?,'client',?,?)`,
      [c.email, hash, c.first_name, c.last_name]
    );
    if (r.insertId) {
      await db.execute(
        'INSERT IGNORE INTO clients (user_id, city, state) VALUES (?,?,?)',
        [r.insertId, c.city, c.state]
      );
      console.log(`✅ Client: ${c.first_name} ${c.last_name}`);
    }
  }

  // Seed lawyers
  const lawyers = [
    {
      email: 'james.wilson@lawfirm.com', first: 'James', last: 'Wilson',
      firm: 'Wilson & Partners', bar: 'CA-100234', bar_state: 'CA',
      years: 15, fee: 250, city: 'San Francisco', state: 'CA',
      bio: 'Experienced real estate and business attorney with 15+ years helping clients navigate complex transactions.',
      specs: [1, 4], states: ['CA', 'NV'],
    },
    {
      email: 'sarah.chen@immigrationlaw.com', first: 'Sarah', last: 'Chen',
      firm: 'Chen Immigration Law', bar: 'NY-200456', bar_state: 'NY',
      years: 10, fee: 200, city: 'New York', state: 'NY',
      bio: 'Dedicated immigration attorney helping individuals, families, and businesses achieve their American dreams.',
      specs: [3, 5], states: ['NY', 'NJ', 'CT'],
    },
    {
      email: 'michael.roberts@familylaw.com', first: 'Michael', last: 'Roberts',
      firm: 'Roberts Family Law Group', bar: 'TX-300789', bar_state: 'TX',
      years: 8, fee: 175, city: 'Austin', state: 'TX',
      bio: 'Compassionate family law attorney helping clients through divorce, custody, and estate matters.',
      specs: [5, 9], states: ['TX'],
    },
    {
      email: 'diana.kim@businesslaw.com', first: 'Diana', last: 'Kim',
      firm: 'Kim Legal Group', bar: 'IL-400321', bar_state: 'IL',
      years: 12, fee: 300, city: 'Chicago', state: 'IL',
      bio: 'Corporate attorney specializing in business formation, contracts, and intellectual property.',
      specs: [4, 10, 11], states: ['IL', 'WI'],
    },
    {
      email: 'carlos.mendez@propertylaw.com', first: 'Carlos', last: 'Mendez',
      firm: 'Mendez Property Law', bar: 'FL-500654', bar_state: 'FL',
      years: 20, fee: 225, city: 'Miami', state: 'FL',
      bio: 'Seasoned real estate attorney with two decades handling property disputes and transactions in Florida.',
      specs: [1, 2], states: ['FL'],
    },
  ];

  for (const l of lawyers) {
    const [r] = await db.execute(
      `INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name) VALUES (?,?,'lawyer',?,?)`,
      [l.email, hash, l.first, l.last]
    );
    if (r.insertId) {
      const [lr] = await db.execute(
        `INSERT IGNORE INTO lawyers
         (user_id, bar_license_number, bar_state, law_firm, years_experience, bio, consultation_fee, city, state, approval_status, avg_rating, total_reviews)
         VALUES (?,?,?,?,?,?,?,?,?,'approved',?,?)`,
        [r.insertId, l.bar, l.bar_state, l.firm, l.years, l.bio, l.fee, l.city, l.state,
         (3.5 + Math.random() * 1.5).toFixed(2), Math.floor(Math.random() * 30) + 5]
      );
      const lawyerId = lr.insertId;
      for (const s of l.specs) {
        await db.execute(
          'INSERT IGNORE INTO lawyer_specializations (lawyer_id, specialization_id) VALUES (?,?)',
          [lawyerId, s]
        );
      }
      for (const s of l.states) {
        await db.execute(
          'INSERT IGNORE INTO lawyer_practice_states (lawyer_id, state) VALUES (?,?)',
          [lawyerId, s]
        );
      }
      console.log(`✅ Lawyer: ${l.first} ${l.last} (${l.firm})`);
    }
  }

  await db.end();
  console.log('\n🎉 Seeding complete!');
  console.log('\nTest credentials (all passwords: Password123!):');
  console.log('  Admin:   admin@legalmarket.com');
  console.log('  Client:  alice@example.com');
  console.log('  Lawyer:  james.wilson@lawfirm.com');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
