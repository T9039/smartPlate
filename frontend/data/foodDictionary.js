import { CATEGORY_ICONS } from './mockData';

const keywordToIcon = {
  // Fruits
  apple: 'nutrition-outline',
  banana: 'nutrition-outline',
  orange: 'nutrition-outline',
  grape: 'nutrition-outline',
  lemon: 'nutrition-outline',
  lime: 'nutrition-outline',
  berry: 'nutrition-outline',
  peach: 'nutrition-outline',
  pear: 'nutrition-outline',
  fruit: 'nutrition-outline',
  mango: 'nutrition-outline',
  watermelon: 'nutrition-outline',
  
  // Vegetables
  carrot: 'leaf-outline',
  tomato: 'leaf-outline',
  potato: 'leaf-outline',
  onion: 'leaf-outline',
  garlic: 'leaf-outline',
  pepper: 'leaf-outline',
  lettuce: 'leaf-outline',
  spinach: 'leaf-outline',
  broccoli: 'leaf-outline',
  cabbage: 'leaf-outline',
  veg: 'leaf-outline',
  salad: 'leaf-outline',
  cucumber: 'leaf-outline',
  mushroom: 'leaf-outline',

  // Dairy & Alternatives
  milk: 'water-outline',
  cheese: 'beaker-outline',
  yogurt: 'beaker-outline',
  butter: 'beaker-outline',
  cream: 'beaker-outline',
  egg: 'egg-outline',
  
  // Meat & Protein
  chicken: 'restaurant-outline',
  beef: 'restaurant-outline',
  pork: 'restaurant-outline',
  fish: 'fish-outline',
  salmon: 'fish-outline',
  tuna: 'fish-outline',
  bacon: 'restaurant-outline',
  sausage: 'restaurant-outline',
  steak: 'restaurant-outline',
  meat: 'restaurant-outline',
  tofu: 'cube-outline',

  // Pantry & Carbs
  bread: 'fast-food-outline',
  rice: 'ellipse-outline',
  pasta: 'analytics-outline',
  noodle: 'analytics-outline',
  flour: 'cube-outline',
  sugar: 'cube-outline',
  salt: 'cube-outline',
  spice: 'flask-outline',
  oil: 'water-outline',
  cereal: 'cafe-outline',
  oat: 'cafe-outline',

  // Drinks
  water: 'water-outline',
  juice: 'pint-outline',
  soda: 'pint-outline',
  cola: 'pint-outline',
  beer: 'beer-outline',
  wine: 'wine-outline',
  coffee: 'cafe-outline',
  tea: 'cafe-outline',
  drink: 'pint-outline',

  // Snacks & Sweets
  chocolate: 'ice-cream-outline',
  cake: 'fast-food-outline',
  cookie: 'fast-food-outline',
  candy: 'ice-cream-outline',
  chip: 'fast-food-outline',
  snack: 'fast-food-outline',

  // Prepared Meals
  pizza: 'pizza-outline',
  burger: 'fast-food-outline',
  sandwich: 'fast-food-outline',
  soup: 'cafe-outline',
  leftover: 'file-tray-full-outline',
  meal: 'restaurant-outline'
};

/**
 * Returns the best Ionicons name for a given food item name.
 * If no specific keyword matches, it falls back to the category default.
 */
export const getFoodIcon = (itemName, category) => {
  if (!itemName) return CATEGORY_ICONS[category] || 'nutrition-outline';
  
  const normalizedName = itemName.toLowerCase();
  
  // Check against dictionary keywords
  for (const [keyword, iconName] of Object.entries(keywordToIcon)) {
    if (normalizedName.includes(keyword)) {
      return iconName;
    }
  }

  // Fallback to category
  return CATEGORY_ICONS[category] || 'nutrition-outline';
};
