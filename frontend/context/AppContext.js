import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../lib/api';
import { useAlert } from './AlertContext';
import { CATEGORIES, CHALLENGE_TIERS, mockDonationLocations } from '../data/mockData';
import { COLORS, ECO_COLORS, PREMIUM_COLORS } from '../styles/theme';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { alert, toast } = useAlert();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [donationHamper, setDonationHamper] = useState([]);
  const [impact, setImpact] = useState({ itemsSaved: 0, moneySaved: 0, donationsMade: 0 });

  // AI & Notifications
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Challenge
  const [challengeItemsUsedToday, setChallengeItemsUsedToday] = useState(0);
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [activeTheme, setActiveThemeState] = useState('default');
  const [challengeTiers, setChallengeTiers] = useState(CHALLENGE_TIERS);

  // Admin state (populated by admin API routes)
  const [allUsers, setAllUsers] = useState([]);
  const [allInventoryEntries, setAllInventoryEntries] = useState([]);
  const [donationComplaints, setDonationComplaints] = useState([]);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalItemsTracked: 0, totalDonations: 0 });

  // Community donations (locations are static config, drop-offs come from DB)
  const [communityDropOffs, setCommunityDropOffs] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [donationLocations] = useState(mockDonationLocations);

  // Initial Data Fetch
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        loadAdminData();
      } else {
        loadInitialData();
      }
    }
  }, [isAuthenticated, user]);

  const loadAdminData = async () => {
    try {
      const users = await api.getAdminUsers();
      setAllUsers(users);

      const inv = await api.getAdminInventory();
      setAllInventoryEntries(inv);
      
      const stats = await api.getAdminStats();
      setAdminStats(stats);
    } catch (e) {
      console.warn('Failed to load admin data:', e);
    }
  };

  const loadInitialData = async () => {
    try {
      const invData = await api.getInventory();
      setInventory(invData);

      const donData = await api.getDonations();
      setDonationHamper(donData);

      const analyticsData = await api.getAnalytics();
      setImpact(prev => ({
        ...prev,
        itemsSaved: analyticsData.itemsSaved,
        donationsMade: analyticsData.donationsMade,
      }));

      await fetchRecipes();
      await fetchSavedRecipes();

      try {
        const nudgesData = await api.getNudges();
        setNudges(nudgesData);
      } catch (e) { console.warn('Failed to fetch nudges', e); }

      try {
        const notifsData = await api.getNotifications();
        setNotifications(notifsData);
      } catch (e) { console.warn('Failed to fetch notifications', e); }

    } catch (e) {
      console.warn('Failed to fetch data from API:', e);
      setInventory([]);
      setDonationHamper([]);
    }
  };

  const fetchRecipes = async () => {
    try {
      const recipesData = await api.getRecipes();
      setRecipes(recipesData);
    } catch (e) { console.warn('Failed to fetch recipes', e); }
  };

  const fetchSavedRecipes = async () => {
    try {
      const savedData = await api.getSavedRecipes();
      setSavedRecipes(savedData);
    } catch (e) { console.warn('Failed to fetch saved recipes', e); }
  };

  const saveRecipe = async (id, recipeData) => {
    try {
      await api.saveRecipe(id);
      setSavedRecipes((prev) => {
        if (prev.find(r => r.id === id)) return prev;
        return [recipeData, ...prev];
      });
      toast('Recipe saved!', 'success');
    } catch (e) { console.warn('Failed to save recipe', e); }
  };

  const unsaveRecipe = async (id) => {
    try {
      await api.unsaveRecipe(id);
      setSavedRecipes((prev) => prev.filter(r => r.id !== id));
      toast('Recipe removed from saved', 'info');
    } catch (e) { console.warn('Failed to unsave recipe', e); }
  };

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.username,
        email: res.user.email,
        role: res.user.role || 'home',
        activeTheme: res.user.activeTheme || 'default',
        avatar: res.user.avatar || null,
      });
      setActiveThemeState(res.user.activeTheme || 'default');
      setIsAuthenticated(true);
      if (res.user.role === 'admin') {
        toast('Welcome back, Admin', 'info');
      } else {
        toast('Logged in successfully', 'success');
      }
    } catch (e) {
      console.warn('Login failed:', e?.message);
      alert('Login Failed', 'Invalid email or password.');
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.register(username, email, password);
      setAuthToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.username,
        email: res.user.email,
        role: res.user.role || 'home',
        activeTheme: 'default',
        avatar: null,
      });
      setIsAuthenticated(true);
      toast('Account created successfully!', 'success');
    } catch (e) {
      console.error('API Register Error', e);
      alert('Registration Failed', 'Email may already be in use.');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setUser(null);
    setInventory([]);
    setDonationHamper([]);
    setNotifications([]);
    setRecipes([]);
    setSavedRecipes([]);
    setNudges([]);
    setUnlockedRewards([]);
    setChallengeItemsUsedToday(0);
    setImpact({ itemsSaved: 0, moneySaved: 0, donationsMade: 0 });
  };

  // ─── Inventory ─────────────────────────────────────────────────────────────
  const addToInventory = async (item) => {
    try {
      const dbItem = {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price || 0,
        expiry_date: item.expiryDate,
        added_date: new Date().toISOString().split('T')[0],
        emoji: item.emoji || 'nutrition-outline',
      };
      const addedItem = await api.addInventoryItem(dbItem);
      setInventory((prev) => [addedItem, ...prev]);
      toast('Item added', 'success');
    } catch (e) {
      console.error('API Error adding inventory', e);
      alert('Error', 'Could not save item. Please try again.');
    }
  };

  const removeFromInventory = async (id) => {
    try {
      await api.deleteInventoryItem(id);
      setInventory((prev) => prev.filter((i) => i.id.toString() !== id.toString()));
    } catch (e) {
      console.error('API Error removing inventory', e);
      setInventory((prev) => prev.filter((i) => i.id.toString() !== id.toString()));
    }
  };

  // Mark item used: tracks challenge progress and removes from inventory
  const markItemUsed = async (id) => {
    const newCount = challengeItemsUsedToday + 1;
    setChallengeItemsUsedToday(newCount);

    const newRewards = challengeTiers
      .filter((t) => newCount >= t.threshold && !unlockedRewards.includes(t.reward))
      .map((t) => t.reward);
    if (newRewards.length > 0) {
      setUnlockedRewards((prev) => [...prev, ...newRewards]);
    }

    try {
      const item = inventory.find(i => i.id.toString() === id.toString());
      if (item) {
        await api.logWasteAction({ item_name: item.name, quantity: item.quantity, action: 'consumed' });
      }
    } catch (e) {
      console.error(e);
    }

    removeFromInventory(id);
    setImpact((prev) => ({ ...prev, itemsSaved: prev.itemsSaved + 1, moneySaved: prev.moneySaved + 20 }));
  };

  // ─── Donations ─────────────────────────────────────────────────────────────
  const addToDonationHamper = async (item) => {
    // Prevent duplicates
    if (donationHamper.find((d) => d.id === item.id)) return;

    try {
      // Tell the server: mark this inventory item as in-hamper
      const hamperItem = await api.addDonation(item.id);

      // Move item from inventory → hamper in local state (no delete needed)
      setInventory((prev) => prev.filter((i) => i.id !== item.id));
      setDonationHamper((prev) => [...prev, hamperItem]);
      setImpact((prev) => ({ ...prev, donationsMade: prev.donationsMade + 1 }));
    } catch (e) {
      console.warn('Error adding to donation hamper:', e?.message);
    }
  };

  const removeFromDonationHamper = async (id) => {
    // id here is the inventory_id (same as hamper item id)
    const item = donationHamper.find((i) => i.id.toString() === id.toString());
    try {
      await api.deleteDonation(id);

      // Move item back from hamper → inventory in local state (no re-insert needed)
      setDonationHamper((prev) => prev.filter((i) => i.id.toString() !== id.toString()));
      if (item) {
        setInventory((prev) => [{ ...item, inHamper: false }, ...prev]);
        toast('Item returned to inventory', 'info');
      }
    } catch (e) {
      console.warn('Error removing from donation hamper:', e?.message);
      // Still remove from local hamper on failure
      setDonationHamper((prev) => prev.filter((i) => i.id.toString() !== id.toString()));
    }
  };

  // ─── User profile ──────────────────────────────────────────────────────────
  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  const setActiveTheme = (theme) => {
    setActiveThemeState(theme);
    setUser((prev) => ({ ...prev, activeTheme: theme }));
  };

  // ─── Challenge (admin-editable) ────────────────────────────────────────────
  const updateChallengeTier = (index, updates) => {
    setChallengeTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  };

  const addChallengeTier = (tier) => setChallengeTiers((prev) => [...prev, tier]);

  // ─── Community donation requests ───────────────────────────────────────────
  const requestCommunityItem = (dropOffId, itemName) => {
    setCommunityDropOffs((prev) => {
      const updated = {};
      for (const locId of Object.keys(prev)) {
        updated[locId] = prev[locId].map((d) =>
          d.id === dropOffId
            ? { ...d, requests: [...(d.requests || []), { id: 'r' + Date.now(), item: itemName, status: 'pending' }] }
            : d
        );
      }
      return updated;
    });
  };

  const acceptIncomingRequest = (reqId) => {
    setIncomingRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' } : r)));
  };

  const declineIncomingRequest = (reqId) => {
    setIncomingRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: 'declined' } : r)));
  };

  // ─── Admin: user management ────────────────────────────────────────────────
  const adminRemoveUser = async (userId) => {
    try {
      await api.adminDeleteUser(userId);
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) { console.warn('Failed to delete user', e); }
  };

  const adminToggleSuspendUser = async (userId) => {
    try {
      await api.adminToggleSuspend(userId);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
        )
      );
    } catch (e) { console.warn('Failed to toggle suspend', e); }
  };

  // ─── Admin: inventory oversight ────────────────────────────────────────────
  const adminRemoveEntry = (entryId) => {
    setAllInventoryEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const adminFlagEntry = (entryId, reason) => {
    setAllInventoryEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, flagged: true, flagReason: reason } : e))
    );
  };

  const adminUnflagEntry = (entryId) => {
    setAllInventoryEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, flagged: false, flagReason: null } : e))
    );
  };

  // ─── Admin: donation complaints ────────────────────────────────────────────
  const adminResolveComplaint = (complaintId, resolution) => {
    setDonationComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: 'resolved', resolution } : c))
    );
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, user, inventory, donationHamper, impact,
        recipes, savedRecipes, nudges, notifications,
        challengeItemsUsedToday, unlockedRewards, activeTheme, challengeTiers,
        communityDropOffs, incomingRequests, donationLocations,
        allUsers, allInventoryEntries, donationComplaints, adminStats,
        login, register, logout,
        addToInventory, removeFromInventory, markItemUsed,
        addToDonationHamper, removeFromDonationHamper,
        updateUser, setActiveTheme,
        updateChallengeTier, addChallengeTier,
        requestCommunityItem, acceptIncomingRequest, declineIncomingRequest,
        adminRemoveUser, adminToggleSuspendUser,
        adminRemoveEntry, adminFlagEntry, adminUnflagEntry,
        adminResolveComplaint,
        fetchRecipes, fetchSavedRecipes, saveRecipe, unsaveRecipe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

// Returns the correct color palette based on the active theme
export const useColors = () => {
  const { activeTheme } = useAppContext();
  if (activeTheme === 'eco') return ECO_COLORS;
  if (activeTheme === 'premium') return PREMIUM_COLORS;
  return COLORS;
};
