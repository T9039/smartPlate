import React, { createContext, useContext, useState } from 'react';
import {
  mockUser,
  mockInventory,
  mockDonationHamper,
  mockImpact,
  mockCommunityDropOffs,
  mockIncomingRequests,
  CHALLENGE_TIERS,
  mockAllUsers,
  mockAllInventoryEntries,
  mockDonationComplaints,
} from '../data/mockData';
import { COLORS, ECO_COLORS, PREMIUM_COLORS } from '../styles/theme';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(mockUser);
  const [inventory, setInventory] = useState(mockInventory);
  const [donationHamper, setDonationHamper] = useState(mockDonationHamper);
  const [impact, setImpact] = useState(mockImpact);

  // Challenge
  const [challengeItemsUsedToday, setChallengeItemsUsedToday] = useState(0);
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [activeTheme, setActiveThemeState] = useState('default');
  const [challengeTiers, setChallengeTiers] = useState(CHALLENGE_TIERS);

  // Community donations
  const [communityDropOffs, setCommunityDropOffs] = useState(mockCommunityDropOffs);
  const [incomingRequests, setIncomingRequests] = useState(mockIncomingRequests);

  // Admin state
  const [allUsers, setAllUsers] = useState(mockAllUsers);
  const [allInventoryEntries, setAllInventoryEntries] = useState(mockAllInventoryEntries);
  const [donationComplaints, setDonationComplaints] = useState(mockDonationComplaints);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const login = (name, role = 'home') => {
    if (name) setUser((prev) => ({ ...prev, name, role }));
    setIsAuthenticated(true);
  };

  const logout = () => setIsAuthenticated(false);

  // ─── Inventory ─────────────────────────────────────────────────────────────
  const addToInventory = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      addedDate: new Date().toISOString().split('T')[0],
      usedRecently: false,
      donated: false,
      emoji: item.emoji || '🥗',
    };
    setInventory((prev) => [newItem, ...prev]);
  };

  const removeFromInventory = (id) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  // Mark item used: tracks challenge progress and removes from inventory
  const markItemUsed = (id) => {
    const newCount = challengeItemsUsedToday + 1;
    setChallengeItemsUsedToday(newCount);

    const newRewards = challengeTiers
      .filter((t) => newCount >= t.threshold && !unlockedRewards.includes(t.reward))
      .map((t) => t.reward);
    if (newRewards.length > 0) {
      setUnlockedRewards((prev) => [...prev, ...newRewards]);
    }

    removeFromInventory(id);
    setImpact((prev) => ({ ...prev, itemsSaved: prev.itemsSaved + 1, moneySaved: prev.moneySaved + 20 }));
  };

  // ─── Donations ─────────────────────────────────────────────────────────────
  const addToDonationHamper = (item) => {
    if (donationHamper.find((d) => d.name === item.name)) return;
    const donationItem = {
      id: 'd' + Date.now(),
      name: item.name,
      quantity: `${item.quantity} ${item.unit || ''}`.trim(),
      sourceType: item.sourceType || 'manual',
      readyStatus: false,
      emoji: item.emoji || '📦',
    };
    setDonationHamper((prev) => [...prev, donationItem]);
    setImpact((prev) => ({ ...prev, donationsMade: prev.donationsMade + 1 }));
    if (item.id) removeFromInventory(item.id);
  };

  const removeFromDonationHamper = (id) => {
    setDonationHamper((prev) => prev.filter((i) => i.id !== id));
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
  const adminRemoveUser = (userId) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const adminToggleSuspendUser = (userId) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
      )
    );
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
        challengeItemsUsedToday, unlockedRewards, activeTheme, challengeTiers,
        communityDropOffs, incomingRequests,
        allUsers, allInventoryEntries, donationComplaints,
        login, logout,
        addToInventory, removeFromInventory, markItemUsed,
        addToDonationHamper, removeFromDonationHamper,
        updateUser, setActiveTheme,
        updateChallengeTier, addChallengeTier,
        requestCommunityItem, acceptIncomingRequest, declineIncomingRequest,
        adminRemoveUser, adminToggleSuspendUser,
        adminRemoveEntry, adminFlagEntry, adminUnflagEntry,
        adminResolveComplaint,
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
