/**
 * smartPlate — Database Seed Script
 * Run once (idempotent):  cd server && npx tsx seed.ts
 *
 * Creates:
 *   - Demo user    demo@smartplate.com / 123456   (role: home)
 *   - Admin user   admin@smartplate.com / admin123 (role: admin)
 *
 * Then populates the demo account with:
 *   - 8 inventory items  (expiry dates relative to today)
 *   - 3 donation hamper items
 *   - 3 notifications
 *   - 4 waste log entries
 *   - 4 donation locations + time slots
 *   - 3 default challenge tiers
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('smartplate.db');
db.exec('PRAGMA foreign_keys = ON;');

// ─── Helpers ────────────────────────────────────────────────────────────────
const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const todayStr = daysFromNow(0);

// ─── 1. Users ────────────────────────────────────────────────────────────────
const demoHash  = bcrypt.hashSync('123456',  10);
const adminHash = bcrypt.hashSync('admin123', 10);

const upsertUser = db.prepare(`
  INSERT INTO users (username, email, password_hash, role, status)
  VALUES (?, ?, ?, ?, 'active')
  ON CONFLICT(email) DO NOTHING
`);

upsertUser.run('Demo',  'demo@smartplate.com',  demoHash,  'home');
upsertUser.run('Admin', 'admin@smartplate.com', adminHash, 'admin');

const demoUser  = db.prepare(`SELECT id FROM users WHERE email = ?`).get('demo@smartplate.com')  as { id: number };
const adminUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get('admin@smartplate.com') as { id: number };

console.log(`✅ Demo  user id: ${demoUser.id}`);
console.log(`✅ Admin user id: ${adminUser.id}`);

// ─── 2. Challenge Tiers ──────────────────────────────────────────────────────
const upsertTier = db.prepare(`
  INSERT INTO challenge_tiers (threshold, reward, label, emoji, description)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(reward) DO NOTHING
`);

upsertTier.run(3, 'icon',          'Eco Champion Icon', 'medal-outline', 'New profile icon for your achievements');
upsertTier.run(6, 'eco_theme',     'Eco Theme',         'leaf-outline', 'Green & wood eco-friendly UI theme');
upsertTier.run(9, 'premium_theme', 'Premium Theme',     'star-outline', 'Gold & green premium UI theme');

console.log('✅ Challenge tiers seeded');

// ─── 3. Donation Locations ───────────────────────────────────────────────────
const insertLocation = db.prepare(`
  INSERT INTO donation_locations (name, address) VALUES (?, ?)
`);
const insertSlot = db.prepare(`
  INSERT INTO donation_location_slots (location_id, slot_time) VALUES (?, ?)
`);

// Only seed if table is empty
const locationCount = (db.prepare(`SELECT COUNT(*) as c FROM donation_locations`).get() as { c: number }).c;
if (locationCount === 0) {
  const locations = [
    { name: 'Greenside Community Hub', address: '12 Oak Ave, Greenside',   slots: ['08:00 – 10:00', '10:00 – 12:00', '14:00 – 16:00'] },
    { name: 'Sandton Food Bank',        address: '45 Rivonia Rd, Sandton',  slots: ['09:00 – 11:00', '13:00 – 15:00', '15:00 – 17:00'] },
    { name: 'Soweto Soup Kitchen',      address: '7 Vilakazi St, Soweto',   slots: ['07:00 – 09:00', '11:00 – 13:00'] },
    { name: 'Rosebank Pantry',          address: '3 Bath Ave, Rosebank',    slots: ['10:00 – 12:00', '14:00 – 16:00', '16:00 – 18:00'] },
  ];

  for (const loc of locations) {
    const res = insertLocation.run(loc.name, loc.address) as { lastInsertRowid: number };
    for (const slot of loc.slots) {
      insertSlot.run(res.lastInsertRowid, slot);
    }
  }
  console.log('✅ Donation locations + slots seeded');
} else {
  console.log('ℹ️  Donation locations already exist — skipping');
}

// ─── 4. Demo Inventory ───────────────────────────────────────────────────────
const insertItem = db.prepare(`
  INSERT INTO inventory
    (user_id, name, category, quantity, unit, price, expiry_date, added_date, emoji)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const invCount = (db.prepare(`SELECT COUNT(*) as c FROM inventory WHERE user_id = ?`).get(demoUser.id) as { c: number }).c;
if (invCount === 0) {
  const items = [
    { name: 'Tomatoes',       category: 'Vegetables', qty: 4,   unit: 'pieces', price: 25.00, expiry: daysFromNow(3),  emoji: 'leaf-outline' },
    { name: 'Full Cream Milk',category: 'Dairy',      qty: 1,   unit: 'litre',  price: 22.99, expiry: daysFromNow(4),  emoji: 'water-outline' },
    { name: 'Brown Bread',    category: 'Pantry',     qty: 1,   unit: 'loaf',   price: 18.99, expiry: daysFromNow(10), emoji: 'cube-outline' },
    { name: 'Chicken Breast', category: 'Meat',       qty: 500, unit: 'g',      price: 59.99, expiry: daysFromNow(5),  emoji: 'restaurant-outline' },
    { name: 'Spinach',        category: 'Vegetables', qty: 1,   unit: 'bunch',  price: 15.00, expiry: daysFromNow(2),  emoji: 'leaf-outline' },
    { name: 'Pasta',          category: 'Pantry',     qty: 500, unit: 'g',      price: 12.99, expiry: daysFromNow(210),emoji: 'cube-outline' },
    { name: 'Garlic',         category: 'Vegetables', qty: 3,   unit: 'cloves', price: 8.00,  expiry: daysFromNow(20), emoji: 'leaf-outline' },
    { name: 'Cheddar Cheese', category: 'Dairy',      qty: 200, unit: 'g',      price: 35.99, expiry: daysFromNow(15), emoji: 'water-outline' },
  ];

  for (const it of items) {
    insertItem.run(demoUser.id, it.name, it.category, it.qty, it.unit, it.price, it.expiry, todayStr, it.emoji);
  }
  console.log(`✅ ${items.length} inventory items seeded for Demo user`);
} else {
  console.log('ℹ️  Demo inventory already exists — skipping');
}

// ─── 5. Demo Donation Hamper ─────────────────────────────────────────────────
const insertDonation = db.prepare(`
  INSERT INTO donation_hampers (user_id, name, quantity, source_type, ready_status, emoji)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const donCount = (db.prepare(`SELECT COUNT(*) as c FROM donation_hampers WHERE user_id = ?`).get(demoUser.id) as { c: number }).c;
if (donCount === 0) {
  insertDonation.run(demoUser.id, 'All Purpose Flour', '1 kg',    'manual',    1, 'cube-outline');
  insertDonation.run(demoUser.id, 'Spaghetti Pasta',   '500 g',   'inventory', 1, 'cube-outline');
  insertDonation.run(demoUser.id, 'Tomato Sauce',       '2 cans',  'manual',    1, 'cube-outline');
  console.log('✅ Donation hamper items seeded for Demo user');
} else {
  console.log('ℹ️  Demo donation hamper already exists — skipping');
}

// ─── 6. Demo Notifications ───────────────────────────────────────────────────
const insertNotif = db.prepare(`
  INSERT INTO notifications (user_id, title, message, type, time)
  VALUES (?, ?, ?, ?, ?)
`);

const notifCount = (db.prepare(`SELECT COUNT(*) as c FROM notifications WHERE user_id = ?`).get(demoUser.id) as { c: number }).c;
if (notifCount === 0) {
  insertNotif.run(demoUser.id, 'Spinach expiring soon!',   'Your spinach expires in 2 days. Use it in a salad or stir-fry today.', 'warning', '2 hours ago');
  insertNotif.run(demoUser.id, 'Recipe match found',       'Tomato & Spinach Pasta matches 92% of your current inventory!',         'info',    '5 hours ago');
  insertNotif.run(demoUser.id, 'Donation hamper ready',    'Your donation hamper has 3 items and is ready to submit.',               'success', 'Yesterday');
  console.log('✅ Notifications seeded for Demo user');
} else {
  console.log('ℹ️  Demo notifications already exist — skipping');
}

// ─── 7. Demo Waste Logs (seeds analytics) ───────────────────────────────────
const insertLog = db.prepare(`
  INSERT INTO waste_logs (user_id, item_name, quantity, action) VALUES (?, ?, ?, ?)
`);

const logCount = (db.prepare(`SELECT COUNT(*) as c FROM waste_logs WHERE user_id = ?`).get(demoUser.id) as { c: number }).c;
if (logCount === 0) {
  insertLog.run(demoUser.id, 'Leftover Rice',    2, 'consumed');
  insertLog.run(demoUser.id, 'Old Yoghurt',      1, 'wasted');
  insertLog.run(demoUser.id, 'Broccoli',         1, 'consumed');
  insertLog.run(demoUser.id, 'Mince Meat',       3, 'consumed');
  console.log('✅ Waste logs seeded for Demo user');
} else {
  console.log('ℹ️  Demo waste logs already exist — skipping');
}

console.log('\n🌱 Seed complete.');
db.close();
