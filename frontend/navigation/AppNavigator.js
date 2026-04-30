import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext } from '../context/AppContext';
import { COLORS, SPACING } from '../styles/theme';

// Auth screens
import LoginScreen from '../screens/Login';
import SignUpScreen from '../screens/SignUp';

// User screens
import HomeScreen from '../screens/Home';
import InventoryScreen from '../screens/Inventory';
import RecipesScreen from '../screens/Recipes';
import DonationsScreen from '../screens/Donations';
import ProfileScreen from '../screens/Profile';
import AddFoodScreen from '../screens/AddFood';
import AIInsightsDetailsScreen from '../screens/AIInsightsDetails';
import RecipeDetailsScreen from '../screens/RecipeDetails';

// Admin screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminFoodMonitor from '../screens/admin/AdminFoodMonitor';
import AdminDonations from '../screens/admin/AdminDonations';
import AdminAnalytics from '../screens/admin/AdminAnalytics';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── User tab bar ─────────────────────────────────────────────────────────────

function TabIcon({ emoji, label, focused, activeColor, inactiveColor }) {
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.55 }]}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? activeColor : inactiveColor }]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  const { activeTheme } = useAppContext();
  const insets = useSafeAreaInsets();
  
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const tabHeight = 60 + bottomPadding;

  const tabBarBg =
    activeTheme === 'eco' ? '#1B5E20' :
    activeTheme === 'premium' ? '#162720' :
    '#FFFFFF';

  const tabBarBorder =
    activeTheme === 'eco' ? '#155724' :
    activeTheme === 'premium' ? '#1B2E25' :
    COLORS.border;

  const activeColor =
    activeTheme === 'eco' ? '#A5D6A7' :
    activeTheme === 'premium' ? '#D4AC0D' :
    COLORS.primary;

  const inactiveColor =
    (activeTheme === 'eco' || activeTheme === 'premium')
      ? 'rgba(255,255,255,0.45)'
      : COLORS.textMuted;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} activeColor={activeColor} inactiveColor={inactiveColor} /> }}
      />
      <Tab.Screen name="Inventory" component={InventoryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Inventory" focused={focused} activeColor={activeColor} inactiveColor={inactiveColor} /> }}
      />
      <Tab.Screen name="Recipes" component={RecipesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🍳" label="Recipes" focused={focused} activeColor={activeColor} inactiveColor={inactiveColor} /> }}
      />
      <Tab.Screen name="Donations" component={DonationsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🤝" label="Donate" focused={focused} activeColor={activeColor} inactiveColor={inactiveColor} /> }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} activeColor={activeColor} inactiveColor={inactiveColor} /> }}
      />
    </Tab.Navigator>
  );
}

// ─── Admin tab bar ────────────────────────────────────────────────────────────

function AdminTabs() {
  const insets = useSafeAreaInsets();
  
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const tabHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.adminTabBar, { height: tabHeight, paddingBottom: bottomPadding }],
      }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboard}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Dashboard" focused={focused} activeColor="#95D5B2" inactiveColor="rgba(255,255,255,0.45)" /> }}
      />
      <Tab.Screen name="AdminUsers" component={AdminUsers}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Users" focused={focused} activeColor="#95D5B2" inactiveColor="rgba(255,255,255,0.45)" /> }}
      />
      <Tab.Screen name="AdminFoodMonitor" component={AdminFoodMonitor}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗂️" label="Food" focused={focused} activeColor="#95D5B2" inactiveColor="rgba(255,255,255,0.45)" /> }}
      />
      <Tab.Screen name="AdminDonations" component={AdminDonations}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🤝" label="Donations" focused={focused} activeColor="#95D5B2" inactiveColor="rgba(255,255,255,0.45)" /> }}
      />
      <Tab.Screen name="AdminAnalytics" component={AdminAnalytics}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📈" label="Analytics" focused={focused} activeColor="#95D5B2" inactiveColor="rgba(255,255,255,0.45)" /> }}
      />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  const { isAuthenticated, user } = useAppContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : user.role === 'admin' ? (
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="AIInsightsDetails" component={AIInsightsDetailsScreen} />
          <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  adminTabBar: {
    backgroundColor: '#1B4332',
    borderTopColor: '#163527',
    borderTopWidth: 1,
    paddingTop: 6,
  },
});
