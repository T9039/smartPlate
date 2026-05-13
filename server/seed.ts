/**
 * smartPlate — Database Seed Script
 * Run once (idempotent):  cd server && npx tsx seed.ts
 *
 * Creates:
 *   - Demo user    demo@smartplate.com / 123456   (role: home)
 *   - Admin user   admin@smartplate.com / admin123 (role: admin)
 *
 * Populates Demo account with extensive data to showcase all features.
 */

import './lib/db.js';
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

upsertUser.run('Thuto (Demo)',  'demo@smartplate.com',  demoHash,  'home');
upsertUser.run('Admin', 'admin@smartplate.com', adminHash, 'admin');

const demoUser  = db.prepare(`SELECT id FROM users WHERE email = ?`).get('demo@smartplate.com')  as { id: number };
const adminUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get('admin@smartplate.com') as { id: number };

console.log(`✅ Demo  user id: ${demoUser.id}`);
console.log(`✅ Admin user id: ${adminUser.id}`);

// ─── Clear existing Demo Data to ensure fresh rich state ─────────────────────
db.prepare('DELETE FROM inventory WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM waste_logs WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM donation_hampers WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM hamper_items WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM notifications WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM recipes WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM saved_recipes WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM donation_complaints WHERE user_id = ?').run(demoUser.id);
db.prepare('DELETE FROM community_dropoffs WHERE user_id = ?').run(demoUser.id);

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
const insertLocation = db.prepare(`INSERT INTO donation_locations (name, address) VALUES (?, ?)`);
const insertSlot = db.prepare(`INSERT INTO donation_location_slots (location_id, slot_time) VALUES (?, ?)`);

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
}
console.log('✅ Donation locations seeded');

// ─── 4. Rich Inventory ───────────────────────────────────────────────────────
const insertItem = db.prepare(`
  INSERT INTO inventory
    (user_id, name, category, quantity, unit, price, expiry_date, added_date, emoji, ecoscore, brand, packaging)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const inventoryItems = [
  // Expiring soon to trigger notifications and AI
  { name: 'Fresh Spinach', category: 'Produce', qty: 1, unit: 'bunch', price: 22.99, expiry: daysFromNow(1), emoji: 'leaf-outline', ecoscore: 'A', brand: 'Woolworths', packaging: 'Plastic' },
  { name: 'Avocados', category: 'Produce', qty: 2, unit: 'pieces', price: 45.00, expiry: daysFromNow(2), emoji: 'nutrition-outline', ecoscore: 'B', brand: 'Farm Fresh', packaging: 'None' },
  { name: 'Greek Yoghurt', category: 'Dairy', qty: 500, unit: 'g', price: 34.50, expiry: daysFromNow(3), emoji: 'water-outline', ecoscore: 'C', brand: 'Danone', packaging: 'Plastic' },
  // Staples
  { name: 'Free Range Eggs', category: 'Dairy', qty: 12, unit: 'pieces', price: 54.99, expiry: daysFromNow(14), emoji: 'egg-outline', ecoscore: 'B', brand: 'Nulaid', packaging: 'Paper' },
  { name: 'Chicken Breasts', category: 'Meat', qty: 800, unit: 'g', price: 95.00, expiry: daysFromNow(4), emoji: 'restaurant-outline', ecoscore: 'D', brand: 'County Fair', packaging: 'Plastic' },
  { name: 'Almond Milk', category: 'Beverages', qty: 1, unit: 'L', price: 39.99, expiry: daysFromNow(30), emoji: 'water-outline', ecoscore: 'A', brand: 'Almond Breeze', packaging: 'Paper' },
  { name: 'Jasmine Rice', category: 'Pantry', qty: 2, unit: 'kg', price: 45.99, expiry: daysFromNow(365), emoji: 'cube-outline', ecoscore: 'B', brand: 'Spekko', packaging: 'Plastic' },
  { name: 'Cheddar Cheese', category: 'Dairy', qty: 400, unit: 'g', price: 65.00, expiry: daysFromNow(21), emoji: 'water-outline', ecoscore: 'C', brand: 'Clover', packaging: 'Plastic' },
  { name: 'Tomatoes', category: 'Produce', qty: 6, unit: 'pieces', price: 25.00, expiry: daysFromNow(5), emoji: 'leaf-outline', ecoscore: 'A', brand: 'Local', packaging: 'None' },
  { name: 'Sourdough Bread', category: 'Bakery', qty: 1, unit: 'loaf', price: 40.00, expiry: daysFromNow(4), emoji: 'cube-outline', ecoscore: 'B', brand: 'Artisan', packaging: 'Paper' },
];

for (const it of inventoryItems) {
  insertItem.run(demoUser.id, it.name, it.category, it.qty, it.unit, it.price, it.expiry, todayStr, it.emoji, it.ecoscore, it.brand, it.packaging);
}
console.log(`✅ ${inventoryItems.length} rich inventory items seeded`);

// ─── 5. Highly Specific Waste Logs (Triggers Algo Insights) ──────────────────
const insertLog = db.prepare(`
  INSERT INTO waste_logs (user_id, item_name, quantity, action, price, logged_at) VALUES (?, ?, ?, ?, ?, ?)
`);

// We want to show massive financial waste on meat, and frequent waste on bread.
const logs = [
  // Consumed items (Good habits)
  { name: 'Jasmine Rice', qty: 1, action: 'consumed', price: 20, daysAgo: 1 },
  { name: 'Jasmine Rice', qty: 1, action: 'consumed', price: 20, daysAgo: 5 },
  { name: 'Jasmine Rice', qty: 1, action: 'consumed', price: 20, daysAgo: 10 },
  { name: 'Free Range Eggs', qty: 6, action: 'consumed', price: 25, daysAgo: 2 },
  { name: 'Almond Milk', qty: 1, action: 'consumed', price: 40, daysAgo: 3 },
  { name: 'Tomatoes', qty: 4, action: 'consumed', price: 15, daysAgo: 4 },
  
  // Wasted items (Bad habits -> triggers financial warnings)
  { name: 'Premium Ribeye Steak', qty: 2, action: 'wasted', price: 220.00, daysAgo: 2 }, // Huge financial loss!
  { name: 'Sourdough Bread', qty: 1, action: 'wasted', price: 40.00, daysAgo: 4 },
  { name: 'Sourdough Bread', qty: 1, action: 'wasted', price: 40.00, daysAgo: 12 },
  { name: 'Sourdough Bread', qty: 1, action: 'wasted', price: 40.00, daysAgo: 20 }, // Frequent waste warning
  { name: 'Fresh Coriander', qty: 1, action: 'wasted', price: 15.00, daysAgo: 7 },
  { name: 'Greek Yoghurt', qty: 1, action: 'wasted', price: 34.50, daysAgo: 9 },
];

for (const log of logs) {
  insertLog.run(demoUser.id, log.name, log.qty, log.action, log.price, daysFromNow(-log.daysAgo) + " 10:00:00");
}
console.log(`✅ ${logs.length} waste logs seeded (High financial waste triggered)`);

// ─── 6. Beautiful Cached Recipes ─────────────────────────────────────────────
const insertRecipe = db.prepare(`
  INSERT INTO recipes (user_id, title, time, difficulty, emoji, ingredients, steps)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const recipe1Ingredients = JSON.stringify([
  { name: 'Chicken Breasts', status: 'in-inventory' },
  { name: 'Fresh Spinach', status: 'expiring' },
  { name: 'Garlic', status: 'missing' },
  { name: 'Olive Oil', status: 'missing' }
]);
const recipe1Steps = JSON.stringify([
  "Slice the chicken breasts into thin strips.",
  "Heat olive oil in a pan over medium heat and sauté minced garlic.",
  "Add the chicken strips and cook until golden brown.",
  "Toss in the fresh spinach and cook until just wilted.",
  "Season with salt and pepper, and serve hot."
]);

const recipe2Ingredients = JSON.stringify([
  { name: 'Greek Yoghurt', status: 'expiring' },
  { name: 'Avocados', status: 'expiring' },
  { name: 'Lemon Juice', status: 'missing' },
  { name: 'Sourdough Bread', status: 'in-inventory' }
]);
const recipe2Steps = JSON.stringify([
  "Toast thick slices of sourdough bread.",
  "In a bowl, mash the avocados with a squeeze of lemon juice.",
  "Spread a thick layer of Greek yoghurt on the toast.",
  "Top with the mashed avocado and a sprinkle of chili flakes."
]);

insertRecipe.run(demoUser.id, 'Spinach & Garlic Chicken', '25 mins', 'Easy', 'restaurant-outline', recipe1Ingredients, recipe1Steps);
const r2Res = insertRecipe.run(demoUser.id, 'Creamy Avocado Yoghurt Toast', '10 mins', 'Easy', 'leaf-outline', recipe2Ingredients, recipe2Steps) as any;

// Save one recipe to showcase the Saved Recipes tab
db.prepare(`INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)`).run(demoUser.id, r2Res.lastInsertRowid);
console.log('✅ Premium recipes seeded');

// ─── 7. Donations & Community ────────────────────────────────────────────────
const insertHamper = db.prepare(`INSERT INTO donation_hampers (user_id, name, quantity, source_type, ready_status, emoji) VALUES (?, ?, ?, ?, ?, ?)`);
insertHamper.run(demoUser.id, 'Canned Beans', '4 cans', 'manual', 1, 'cube-outline');
insertHamper.run(demoUser.id, 'Rice', '1 kg', 'manual', 1, 'cube-outline');

// Admin drops off an item in the community
const adminDropoff = db.prepare(`INSERT INTO community_dropoffs (location_id, user_id) VALUES (1, ?)`).run(adminUser.id) as any;
db.prepare(`INSERT INTO community_dropoff_items (dropoff_id, item_name) VALUES (?, ?)`).run(adminDropoff.lastInsertRowid, 'Box of Apples (Slightly Bruised)');
db.prepare(`INSERT INTO community_dropoff_items (dropoff_id, item_name) VALUES (?, ?)`).run(adminDropoff.lastInsertRowid, 'Extra Loaves of Bread');

console.log('✅ Community drop-offs and hampers seeded');

// ─── 8. Meaningful Notifications ─────────────────────────────────────────────
const insertNotif = db.prepare(`INSERT INTO notifications (user_id, title, message, type, time) VALUES (?, ?, ?, ?, ?)`);

insertNotif.run(demoUser.id, 'Urgent: Expiry Warning', 'Your Fresh Spinach expires tomorrow! We have generated a recipe for you.', 'warning', '1 hour ago');
insertNotif.run(demoUser.id, 'Financial Alert', 'You have wasted R609.50 overall. Check Algo Insights for details.', 'warning', 'Yesterday');
insertNotif.run(demoUser.id, 'Community Update', 'New items were dropped off at Greenside Community Hub.', 'info', '2 days ago');

console.log('✅ Meaningful notifications seeded');

console.log('\n🌟 Rich Demo Environment Seed Complete! 🌟');
db.close();
