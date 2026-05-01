/**
 * mockData.js
 *
 * All user/inventory/donation DATA has been moved to the database.
 * Run `cd server && npx tsx seed.ts` to populate the DB with demo data.
 *
 * This file only contains:
 *   - Static UI constants (CATEGORIES, CHALLENGE_TIERS)
 *   - Static location config (mockDonationLocations) — no DB table yet
 *   - Pure date utility functions
 */

// ─── Static UI constants ───────────────────────────────────────────────────────

export const CATEGORIES = [
  'Fruits', 'Vegetables', 'Dairy', 'Meat',
  'Pantry', 'Snacks', 'Beverages', 'Leftovers',
];

export const CATEGORY_ICONS = {
  Vegetables: 'leaf-outline',
  Fruits: 'nutrition-outline',
  Dairy: 'water-outline',
  Meat: 'restaurant-outline',
  Pantry: 'cube-outline',
  Leftovers: 'fast-food-outline',
  Other: 'ellipsis-horizontal-outline',
};

/**
 * Default challenge tier config — also seeded into the challenge_tiers DB table.
 * Used client-side as a fallback / initial state before the server responds.
 */
export const CHALLENGE_TIERS = [
  { threshold: 3, reward: 'icon',          label: 'Eco Champion Icon', emoji: 'medal-outline', description: 'New profile icon for your achievements' },
  { threshold: 6, reward: 'eco_theme',     label: 'Eco Theme',         emoji: 'leaf-outline', description: 'Green & wood eco-friendly UI theme' },
  { threshold: 9, reward: 'premium_theme', label: 'Premium Theme',     emoji: 'star-outline', description: 'Gold & green premium UI theme' },
];

/**
 * Physical donation drop-off locations.
 * Seeded into the donation_locations DB table — this list is kept here
 * as a frontend fallback until a GET /api/donation-locations route is added.
 */
export const mockDonationLocations = [
  { id: 'loc1', name: 'Greenside Community Hub', address: '12 Oak Ave, Greenside',  slots: ['08:00 – 10:00', '10:00 – 12:00', '14:00 – 16:00'] },
  { id: 'loc2', name: 'Sandton Food Bank',        address: '45 Rivonia Rd, Sandton', slots: ['09:00 – 11:00', '13:00 – 15:00', '15:00 – 17:00'] },
  { id: 'loc3', name: 'Soweto Soup Kitchen',      address: '7 Vilakazi St, Soweto',  slots: ['07:00 – 09:00', '11:00 – 13:00'] },
  { id: 'loc4', name: 'Rosebank Pantry',          address: '3 Bath Ave, Rosebank',   slots: ['10:00 – 12:00', '14:00 – 16:00', '16:00 – 18:00'] },
];

// ─── Date utility functions ────────────────────────────────────────────────────

export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

export const getExpiryLabel = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0)  return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  if (days <= 7)  return `${days} days left`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
  return `${Math.ceil(days / 30)} months left`;
};

export const isExpiringSoon = (expiryDate) => getDaysUntilExpiry(expiryDate) <= 5;

export const getValidIcon = (iconString) => {
  if (!iconString) return 'nutrition-outline';
  
  // Known legacy emojis mapped to Ionicons
  const legacyMap = {
    '🥗': 'leaf-outline',
    '🍎': 'nutrition-outline',
    '📦': 'cube-outline',
    '🥩': 'restaurant-outline',
    '🥛': 'water-outline',
    '🍕': 'fast-food-outline',
    '🍽️': 'restaurant-outline',
    '✅': 'checkmark-circle-outline',
    '❌': 'close-circle-outline',
    '⚠️': 'warning-outline',
    'ℹ️': 'information-circle-outline',
    '🏆': 'trophy-outline',
    '👥': 'people-outline',
    '💰': 'cash-outline',
    '📈': 'stats-chart-outline',
    '🗑️': 'trash-outline',
    '🗂️': 'folder-outline',
    '🤝': 'heart-outline',
  };
  
  if (legacyMap[iconString]) return legacyMap[iconString];
  
  // If it contains non-ASCII characters (likely an emoji), fallback to default
  if (/[^\x00-\x7F]/.test(iconString)) return 'nutrition-outline';
  
  return iconString;
};
