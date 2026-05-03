// Replace '10.0.2.2' with your machine's local IP address (e.g., '192.168.1.100')
// if you are using Expo Go on a physical device on the same network.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://100.125.249.86:3000/api';
let authToken = null;
export const setAuthToken = (token) => {
  authToken = token;
};

const defaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch(`${API_URL}/inventory`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get inventory');
    return res.json();
  },

  getInventoryInsights: async (id) => {
    const res = await fetch(`${API_URL}/inventory/${id}/insights`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get insights');
    return res.json();
  },

  addInventoryItem: async (item) => {
    const res = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add inventory item');
    return res.json();
  },

  updateInventoryItem: async (id, updates) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: defaultHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update inventory item');
    return res.ok;
  },

  deleteInventoryItem: async (id) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete inventory item');
    return res.ok;
  },

  // Donations — hamper is a relationship to inventory items
  getDonations: async () => {
    const res = await fetch(`${API_URL}/donations`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get donations');
    return res.json();
  },

  addDonation: async (inventory_id) => {
    const res = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({ inventory_id }),
    });
    if (!res.ok) throw new Error('Failed to add donation');
    return res.json();
  },

  deleteDonation: async (inventory_id) => {
    const res = await fetch(`${API_URL}/donations/${inventory_id}`, {
      method: 'DELETE',
      headers: defaultHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete donation');
    return res.ok;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_URL}/analytics`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get analytics');
    return res.json();
  },

  // Waste Logs
  logWasteAction: async (actionData) => {
    const res = await fetch(`${API_URL}/waste-logs`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(actionData),
    });
    if (!res.ok) throw new Error('Failed to log waste action');
    return res.ok;
  },

  // AI & Notifications
  getRecipes: async () => {
    const res = await fetch(`${API_URL}/ai/recipes`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get recipes');
    return res.json();
  },

  getSavedRecipes: async () => {
    const res = await fetch(`${API_URL}/recipes/saved`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get saved recipes');
    return res.json();
  },

  saveRecipe: async (id) => {
    const res = await fetch(`${API_URL}/recipes/${id}/save`, { method: 'POST', headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to save recipe');
    return res.json();
  },

  unsaveRecipe: async (id) => {
    const res = await fetch(`${API_URL}/recipes/${id}/unsave`, { method: 'DELETE', headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to unsave recipe');
    return res.json();
  },

  getNudges: async () => {
    const res = await fetch(`${API_URL}/ai/nudges`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get nudges');
    return res.json();
  },

  getNotifications: async () => {
    const res = await fetch(`${API_URL}/notifications`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get notifications');
    return res.json();
  },

  // Admin
  getAdminUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get admin users');
    return res.json();
  },

  getAdminInventory: async () => {
    const res = await fetch(`${API_URL}/admin/inventory`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get admin inventory');
    return res.json();
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, { headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to get admin stats');
    return res.json();
  },

  adminToggleSuspend: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/suspend`, { method: 'PUT', headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to suspend user');
    return res.json();
  },

  adminDeleteUser: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers: defaultHeaders() });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },
};
