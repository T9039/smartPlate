import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/useStore";
import { motion } from "motion/react";
import { AlertCircle, TrendingDown, Utensils, Zap, ChevronRight, Apple } from "lucide-react";
import { InventoryItem } from "../types";

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const { data: nudges = [] } = useQuery<string[]>({
    queryKey: ["nudges"],
    queryFn: async () => {
      const res = await fetch("/api/ai/nudges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const expiringSoon = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiry = new Date(item.expiry_date);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  });

  return (
    <div className="p-6 space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans">Kitchen Insights</h1>
          <p className="text-text-dim">Welcome back, {user?.username}!</p>
        </div>
        <div className="w-12 h-12 bg-glass border border-glass-border rounded-full flex items-center justify-center backdrop-blur-md">
          <Utensils className="text-primary w-6 h-6" />
        </div>
      </header>

      {/* AI Nudge Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-text-dim uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary fill-primary/20" /> Behavioral Nudges
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {nudges.map((nudge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-primary/5 border border-primary/20 p-5 rounded-[24px] relative overflow-hidden group"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-xl mt-1">
                  <TrendingDown className="w-4 h-4 text-primary" />
                </div>
                <div>
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">Waste Analysis Log</span>
                   <p className="text-sm leading-relaxed text-slate-200 pr-4">{nudge}</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Alerts Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-text-dim uppercase tracking-[0.2em]">Expiring Soon</h2>
        {expiringSoon.length > 0 ? (
          <div className="space-y-3">
            {expiringSoon.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="glass p-4 rounded-[24px] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center border border-danger/20">
                    <Apple className="text-danger w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-[11px] text-text-dim flex items-center gap-1">
                       Expires in {Math.ceil((new Date(item.expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass bg-primary/5 border-primary/20 p-8 rounded-[24px] text-center">
            <p className="text-primary font-bold">All clear!</p>
            <p className="text-text-dim text-xs mt-1">No items expiring in the next 3 days.</p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-primary text-black p-6 rounded-[24px] flex flex-col items-center gap-2 shadow-[0_10px_20px_rgba(74,222,128,0.2)] active:scale-95 transition-all">
          <Utensils className="w-8 h-8" />
          <span className="font-black text-xs uppercase tracking-wider">Meal Plan</span>
        </button>
        <button className="glass p-6 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all">
          <Zap className="w-8 h-8 text-primary" />
          <span className="font-black text-xs uppercase tracking-wider text-white">AI Recipes</span>
        </button>
      </div>
    </div>
  );
}
