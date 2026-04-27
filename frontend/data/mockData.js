// All mock data for the app — no backend needed

export const mockUser = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@gmail.com',
  avatar: null,
  joinDate: '2025-09-01',
  role: 'home',
  unlockedRewards: [],
  activeTheme: 'default',
};

export const mockInventory = [
  { id: '1', name: 'Tomatoes', category: 'Vegetables', quantity: 4, unit: 'pieces', price: 25.00, expiryDate: '2026-04-24', image: null, addedDate: '2026-04-20', usedRecently: false, expiringSoon: true, donated: false, emoji: '🍅' },
  { id: '2', name: 'Full Cream Milk', category: 'Dairy', quantity: 1, unit: 'litre', price: 22.99, expiryDate: '2026-04-25', image: null, addedDate: '2026-04-21', usedRecently: true, expiringSoon: true, donated: false, emoji: '🥛' },
  { id: '3', name: 'Brown Bread', category: 'Pantry', quantity: 1, unit: 'loaf', price: 18.99, expiryDate: '2026-05-02', image: null, addedDate: '2026-04-20', usedRecently: false, expiringSoon: false, donated: false, emoji: '🍞' },
  { id: '4', name: 'Chicken Breast', category: 'Meat', quantity: 500, unit: 'g', price: 59.99, expiryDate: '2026-04-27', image: null, addedDate: '2026-04-22', usedRecently: false, expiringSoon: false, donated: false, emoji: '🍗' },
  { id: '5', name: 'Spinach', category: 'Vegetables', quantity: 1, unit: 'bunch', price: 15.00, expiryDate: '2026-04-23', image: null, addedDate: '2026-04-21', usedRecently: false, expiringSoon: true, donated: false, emoji: '🥬' },
  { id: '6', name: 'Pasta', category: 'Pantry', quantity: 500, unit: 'g', price: 12.99, expiryDate: '2026-12-01', image: null, addedDate: '2026-03-01', usedRecently: false, expiringSoon: false, donated: false, emoji: '🍝' },
  { id: '7', name: 'Garlic', category: 'Vegetables', quantity: 3, unit: 'cloves', price: 8.00, expiryDate: '2026-05-15', image: null, addedDate: '2026-04-10', usedRecently: false, expiringSoon: false, donated: false, emoji: '🧄' },
  { id: '8', name: 'Cheddar Cheese', category: 'Dairy', quantity: 200, unit: 'g', price: 35.99, expiryDate: '2026-05-08', image: null, addedDate: '2026-04-18', usedRecently: false, expiringSoon: false, donated: false, emoji: '🧀' },
];

export const mockDonationHamper = [
  { id: 'd1', name: 'All Purpose Flour', quantity: '1 kg', sourceType: 'manual', readyStatus: true, emoji: '🌾' },
  { id: 'd2', name: 'Spaghetti Pasta', quantity: '500 g', sourceType: 'inventory', readyStatus: true, emoji: '🍝' },
  { id: 'd3', name: 'Tomato Sauce', quantity: '2 cans', sourceType: 'manual', readyStatus: true, emoji: '🥫' },
];

export const mockRecipes = [
  {
    id: 'r1', title: 'Tomato & Spinach Pasta', image: null, time: '20 mins', difficulty: 'Easy', matchPercent: 92, ingredientsUsedCount: 4, emoji: '🍝',
    ingredients: [{ name: 'Tomatoes', status: 'expiring' }, { name: 'Spinach', status: 'expiring' }, { name: 'Garlic', status: 'in-inventory' }, { name: 'Pasta', status: 'in-inventory' }, { name: 'Olive Oil', status: 'missing' }],
    steps: ['Boil a large pot of salted water and cook pasta per package instructions.', 'Heat olive oil in a pan over medium heat. Add minced garlic and sauté 1 minute.', 'Add diced tomatoes and cook for 5 minutes until softened.', 'Add spinach and stir until wilted, about 2 minutes.', 'Season with salt, pepper, and chilli flakes to taste.', 'Drain pasta and toss with the tomato-spinach sauce.', 'Serve hot with optional parmesan.'],
  },
  {
    id: 'r2', title: 'Creamy Chicken Stir-Fry', image: null, time: '30 mins', difficulty: 'Medium', matchPercent: 78, ingredientsUsedCount: 3, emoji: '🍳',
    ingredients: [{ name: 'Chicken Breast', status: 'in-inventory' }, { name: 'Garlic', status: 'in-inventory' }, { name: 'Spinach', status: 'expiring' }, { name: 'Cream', status: 'missing' }, { name: 'Onion', status: 'missing' }],
    steps: ['Slice chicken breast into thin strips and season with salt and pepper.', 'Heat oil in a wok or large pan over high heat.', 'Add chicken and stir-fry for 6–8 minutes until golden.', 'Add minced garlic and cook for 1 minute.', 'Pour in cream and simmer for 3 minutes.', 'Add spinach and cook until wilted.', 'Serve over rice or noodles.'],
  },
  {
    id: 'r3', title: 'Cheesy Tomato Toast', image: null, time: '10 mins', difficulty: 'Easy', matchPercent: 85, ingredientsUsedCount: 3, emoji: '🥪',
    ingredients: [{ name: 'Brown Bread', status: 'in-inventory' }, { name: 'Tomatoes', status: 'expiring' }, { name: 'Cheddar Cheese', status: 'in-inventory' }, { name: 'Butter', status: 'missing' }],
    steps: ['Preheat oven grill to high.', 'Slice tomatoes and bread.', 'Spread butter on bread and top with tomato slices.', 'Sprinkle grated cheddar cheese generously on top.', 'Grill for 3–5 minutes until cheese is golden and bubbly.', 'Season with salt and pepper, serve immediately.'],
  },
  {
    id: 'r4', title: 'Garlic Milk Soup', image: null, time: '25 mins', difficulty: 'Medium', matchPercent: 71, ingredientsUsedCount: 2, emoji: '🍲',
    ingredients: [{ name: 'Garlic', status: 'in-inventory' }, { name: 'Full Cream Milk', status: 'expiring' }, { name: 'Potato', status: 'missing' }, { name: 'Fresh Herbs', status: 'missing' }],
    steps: ['Peel and slice garlic cloves.', 'Sauté garlic in butter until fragrant and golden.', 'Add diced potato and cook for 5 minutes.', 'Pour in milk and bring to a gentle simmer.', 'Cook 15 minutes until potato is completely soft.', 'Blend until smooth. Season to taste.', 'Serve with crusty bread.'],
  },
];

export const mockNotifications = [
  { id: 'n1', title: 'Tomatoes expiring soon!', message: 'Your tomatoes expire in 2 days. Try the Tomato & Spinach Pasta recipe.', time: '2 hours ago', type: 'warning' },
  { id: 'n2', title: 'Recipe match found', message: 'Tomato & Spinach Pasta matches 92% of your current inventory!', time: '5 hours ago', type: 'info' },
  { id: 'n3', title: 'Donation hamper ready', message: 'Your donation hamper has 3 items and is ready to submit.', time: 'Yesterday', type: 'success' },
];

export const mockImpact = {
  itemsSaved: 12,
  moneySaved: 284.50,
  donationsMade: 3,
};

// Donation locations
export const mockDonationLocations = [
  { id: 'loc1', name: 'Greenside Community Hub', address: '12 Oak Ave, Greenside', slots: ['08:00 – 10:00', '10:00 – 12:00', '14:00 – 16:00'] },
  { id: 'loc2', name: 'Sandton Food Bank', address: '45 Rivonia Rd, Sandton', slots: ['09:00 – 11:00', '13:00 – 15:00', '15:00 – 17:00'] },
  { id: 'loc3', name: 'Soweto Soup Kitchen', address: '7 Vilakazi St, Soweto', slots: ['07:00 – 09:00', '11:00 – 13:00'] },
  { id: 'loc4', name: 'Rosebank Pantry', address: '3 Bath Ave, Rosebank', slots: ['10:00 – 12:00', '14:00 – 16:00', '16:00 – 18:00'] },
];

export const mockCommunityDropOffs = {
  loc1: [
    { id: 'c1', user: 'Sarah M.', items: ['Rice (2 kg)', 'Tinned Beans'], requests: [] },
    { id: 'c2', user: 'James K.', items: ['Cooking Oil', 'Sugar (1 kg)'], requests: [] },
  ],
  loc2: [{ id: 'c3', user: 'Priya N.', items: ['Lentils', 'Canned Tomatoes'], requests: [] }],
  loc3: [
    { id: 'c4', user: 'Thabo M.', items: ['Maize Meal (5 kg)', 'Tea Bags'], requests: [] },
    { id: 'c5', user: 'Lindiwe S.', items: ['Vegetable Oil'], requests: [] },
  ],
  loc4: [{ id: 'c6', user: 'David C.', items: ['Pasta (500 g)', 'Tomato Sauce'], requests: [] }],
};

export const mockIncomingRequests = [
  { id: 'req1', fromUser: 'Thabo M.', requestedItem: 'All Purpose Flour', locationId: 'loc3', status: 'pending' },
  { id: 'req2', fromUser: 'Sarah M.', requestedItem: 'Spaghetti Pasta', locationId: 'loc1', status: 'pending' },
];

export const CHALLENGE_TIERS = [
  { threshold: 3, reward: 'icon', label: 'Eco Champion Icon', emoji: '🏅', description: 'New profile icon for your achievements' },
  { threshold: 6, reward: 'eco_theme', label: 'Eco Theme', emoji: '🌿', description: 'Green & wood eco-friendly UI theme' },
  { threshold: 9, reward: 'premium_theme', label: 'Premium Theme', emoji: '👑', description: 'Gold & green premium UI theme' },
];

// ─── Admin mock data ─────────────────────────────────────────────────────────

export const mockAllUsers = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex.johnson@gmail.com', joinDate: '2025-09-01', status: 'active', itemsAdded: 8, donationsMade: 3, itemsSaved: 12 },
  { id: 'u2', name: 'Sarah Mitchell', email: 'sarah.m@gmail.com', joinDate: '2025-10-15', status: 'active', itemsAdded: 14, donationsMade: 5, itemsSaved: 19 },
  { id: 'u3', name: 'James Khumalo', email: 'james.k@gmail.com', joinDate: '2026-01-03', status: 'active', itemsAdded: 5, donationsMade: 1, itemsSaved: 4 },
  { id: 'u4', name: 'Priya Naidoo', email: 'priya.n@gmail.com', joinDate: '2026-02-20', status: 'suspended', itemsAdded: 0, donationsMade: 0, itemsSaved: 0 },
  { id: 'u5', name: 'Thabo Molefe', email: 'thabo.m@gmail.com', joinDate: '2026-03-10', status: 'active', itemsAdded: 7, donationsMade: 2, itemsSaved: 6 },
  { id: 'u6', name: 'Lindiwe Sithole', email: 'lindiwe.s@gmail.com', joinDate: '2026-03-22', status: 'active', itemsAdded: 3, donationsMade: 1, itemsSaved: 3 },
];

export const mockAllInventoryEntries = [
  { id: 'e1', userId: 'u1', userName: 'Alex Johnson', name: 'Tomatoes', category: 'Vegetables', addedDate: '2026-04-20', flagged: false, flagReason: null, emoji: '🍅' },
  { id: 'e2', userId: 'u2', userName: 'Sarah Mitchell', name: 'Samsung 65" TV', category: 'Electronics', addedDate: '2026-04-21', flagged: true, flagReason: 'Non-food item', emoji: '📺' },
  { id: 'e3', userId: 'u3', userName: 'James Khumalo', name: 'Brown Bread', category: 'Pantry', addedDate: '2026-04-22', flagged: false, flagReason: null, emoji: '🍞' },
  { id: 'e4', userId: 'u1', userName: 'Alex Johnson', name: 'Chicken Breast', category: 'Meat', addedDate: '2026-04-22', flagged: false, flagReason: null, emoji: '🍗' },
  { id: 'e5', userId: 'u5', userName: 'Thabo Molefe', name: 'xxxxxxxxxxxxxxx', category: 'Pantry', addedDate: '2026-04-24', flagged: true, flagReason: 'Spam / nonsense entry', emoji: '❓' },
  { id: 'e6', userId: 'u2', userName: 'Sarah Mitchell', name: 'Full Cream Milk', category: 'Dairy', addedDate: '2026-04-23', flagged: false, flagReason: null, emoji: '🥛' },
  { id: 'e7', userId: 'u6', userName: 'Lindiwe Sithole', name: 'Spinach', category: 'Vegetables', addedDate: '2026-04-24', flagged: false, flagReason: null, emoji: '🥬' },
  { id: 'e8', userId: 'u5', userName: 'Thabo Molefe', name: 'Nike Air Max Shoes', category: 'Pantry', addedDate: '2026-04-25', flagged: true, flagReason: 'Non-food item', emoji: '👟' },
];

export const mockDonationComplaints = [
  { id: 'dc1', userId: 'u3', userName: 'James Khumalo', type: 'failed_pickup', description: 'Drop-off box was completely full at Greenside Community Hub. Had to leave without donating.', date: '2026-04-23', status: 'open', locationName: 'Greenside Community Hub' },
  { id: 'dc2', userId: 'u2', userName: 'Sarah Mitchell', type: 'complaint', description: 'My bread donation was rejected — staff said it was stale. I checked the date and it had 2 days left.', date: '2026-04-22', status: 'resolved', locationName: 'Sandton Food Bank', resolution: 'Contacted Sandton Food Bank. Policy updated to accept items within 3 days of expiry.' },
  { id: 'dc3', userId: 'u5', userName: 'Thabo Molefe', type: 'failed_pickup', description: 'Could not locate the donation drop-off point at Soweto Soup Kitchen. No signage visible.', date: '2026-04-24', status: 'open', locationName: 'Soweto Soup Kitchen' },
  { id: 'dc4', userId: 'u1', userName: 'Alex Johnson', type: 'complaint', description: 'The 08:00 time slot at Greenside Hub was double-booked. Two people arrived at the same time and there was confusion.', date: '2026-04-25', status: 'open', locationName: 'Greenside Community Hub' },
];

export const mockAnalyticsData = {
  totalFoodSaved: 284,   // kg equivalent
  totalFoodWasted: 47,   // kg equivalent
  totalDonations: 89,
  totalUsers: 6,
  activeUsers: 5,
  totalItemsSaved: 41,
  moneySavedTotal: 3420,
  topWastedCategory: 'Vegetables',
  topDonatedItem: 'Bread',
  weeklyTrend: [
    { week: 'Wk 1', saved: 45, wasted: 12, donations: 18 },
    { week: 'Wk 2', saved: 62, wasted: 9, donations: 24 },
    { week: 'Wk 3', saved: 78, wasted: 15, donations: 21 },
    { week: 'Wk 4', saved: 99, wasted: 11, donations: 26 },
  ],
  categoryBreakdown: [
    { category: 'Vegetables', saved: 89, wasted: 18 },
    { category: 'Dairy', saved: 42, wasted: 10 },
    { category: 'Meat', saved: 67, wasted: 8 },
    { category: 'Pantry', saved: 55, wasted: 6 },
    { category: 'Bread & Grains', saved: 31, wasted: 5 },
  ],
  donationsByLocation: [
    { location: 'Greenside Hub', count: 34 },
    { location: 'Sandton Food Bank', count: 28 },
    { location: 'Soweto Soup Kitchen', count: 15 },
    { location: 'Rosebank Pantry', count: 12 },
  ],
};

// Helpers
export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

export const getExpiryLabel = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  if (days <= 7) return `${days} days left`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
  return `${Math.ceil(days / 30)} months left`;
};

export const isExpiringSoon = (expiryDate) => getDaysUntilExpiry(expiryDate) <= 5;

export const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Pantry', 'Snacks', 'Beverages', 'Leftovers'];
