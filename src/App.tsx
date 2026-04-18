import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutDashboard, Package, ScanLine, Map as MapIcon, Settings, User } from "lucide-react";
import Dashboard from "./components/Dashboard";
import InventoryList from "./components/InventoryList";
import BarcodeScanner from "./components/BarcodeScanner";
import DonationMap from "./components/DonationMap";
import Login from "./components/Login";
import { useAuthStore } from "./store/useStore";
import { motion } from "motion/react";

const queryClient = new QueryClient();

function AppShell() {
  const { user, logout } = useAuthStore();

  if (!user) return <Login />;

  return (
    <div className="min-h-screen text-white font-sans flex flex-col max-w-xl mx-auto border-x border-glass-border shadow-2xl overflow-hidden relative">
      {/* Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/scanner" element={<BarcodeScanner />} />
          <Route path="/map" element={<DonationMap />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 w-full max-w-xl bg-glass/20 backdrop-blur-xl border-t border-glass-border px-4 py-4 pb-8 flex justify-between items-center z-50">
        <NavItem to="/" icon={<LayoutDashboard />} label="Home" />
        <NavItem to="/inventory" icon={<Package />} label="Stock" />
        <div className="relative -mt-12">
          <NavLink to="/scanner">
            <div className="w-16 h-16 bg-primary rounded-[24px] shadow-[0_0_20px_rgba(74,222,128,0.4)] flex items-center justify-center text-black border-4 border-black/20 active:scale-95 transition-all">
                <ScanLine className="w-8 h-8" />
            </div>
          </NavLink>
        </div>
        <NavItem to="/map" icon={<MapIcon />} label="Donation" />
        <button onClick={logout} className="flex flex-col items-center gap-1 p-2 text-text-dim hover:text-white transition-colors">
           <User className="w-6 h-6" />
           <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `
      flex flex-col items-center gap-1 p-2 transition-all group
      ${isActive ? "text-primary" : "text-text-dim hover:text-white"}
    `}>
      {({ isActive }) => (
        <>
            <div className={`relative transition-all ${isActive ? "scale-110" : ""}`}>
                {icon}
                {isActive && (
                    <motion.div 
                        layoutId="activeTab"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                    />
                )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppShell />
      </Router>
    </QueryClientProvider>
  );
}
