import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Dimensions } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutDashboard, Package, ScanLine, Map as MapIcon, User, Ghost } from "lucide-react-native";
import { useAuthStore } from "./src/store/useStore";

// Mock implementation of components for mobile structure
// In a real project, these are imported from ./src/components/
import Dashboard from "./src/components/Dashboard";
import InventoryList from "./src/components/InventoryList";
import BarcodeScanner from "./src/components/BarcodeScanner";
import DonationMap from "./src/components/DonationMap";
import Login from "./src/components/Login";

const queryClient = new QueryClient();

function AppShell() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("home");

  if (!user) return <Login />;

  const renderScreen = () => {
    switch (activeTab) {
      case "home": return <Dashboard />;
      case "inventory": return <InventoryList />;
      case "scanner": return <BarcodeScanner onBack={() => setActiveTab("home")} />;
      case "map": return <DonationMap />;
      default: return <Dashboard />;
    }
  };

  return (
    <View className="flex-1 bg-[#0c0c0c]">
      <StatusBar barStyle="light-content" />
      
      {/* Main Content Area */}
      <View className="flex-1">
        {renderScreen()}
      </View>

      {/* Tab Navigation */}
      <View className="absolute bottom-0 w-full bg-[#1a2e1a]/80 backdrop-blur-xl border-t border-white/10 px-6 pt-4 pb-8 flex-row justify-between items-center">
        <NavItem 
            active={activeTab === "home"} 
            onPress={() => setActiveTab("home")} 
            icon={LayoutDashboard} 
            label="Home" 
        />
        <NavItem 
            active={activeTab === "inventory"} 
            onPress={() => setActiveTab("inventory")} 
            icon={Package} 
            label="Stock" 
        />
        
        <View className="-mt-14 items-center">
          <TouchableOpacity 
            onPress={() => setActiveTab("scanner")}
            activeOpacity={0.8}
            className="w-16 h-16 bg-[#4ADE80] rounded-[24px] shadow-lg flex items-center justify-center border-4 border-black/20"
          >
            <ScanLine color="black" size={32} />
          </TouchableOpacity>
        </View>

        <NavItem 
            active={activeTab === "map"} 
            onPress={() => setActiveTab("map")} 
            icon={MapIcon} 
            label="Donation" 
        />
        <TouchableOpacity 
            onPress={logout}
            className="items-center gap-1 opacity-60"
        >
          <User color="white" size={24} />
          <Text className="text-[10px] text-white font-bold uppercase tracking-wider">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NavItem({ active, onPress, icon: Icon, label }: { active: boolean, onPress: () => void, icon: any, label: string }) {
  return (
    <TouchableOpacity 
        onPress={onPress}
        className={`items-center gap-1 ${active ? "opacity-100" : "opacity-40"}`}
    >
      <Icon color={active ? "#4ADE80" : "white"} size={24} />
      <Text className={`text-[10px] uppercase font-bold tracking-wider ${active ? "text-[#4ADE80]" : "text-white"}`}>
        {label}
      </Text>
      {active && <View className="mt-1 w-1 h-1 bg-[#4ADE80] rounded-full" />}
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
