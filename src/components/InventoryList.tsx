import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useStore";
import { Plus, Trash2, Search, Filter, Package } from "lucide-react";
import { InventoryItem } from "../types";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function InventoryList() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // New Item State
  const [newItem, setNewItem] = useState({
      name: "",
      quantity: 1,
      unit: "unit",
      expiry_date: "",
      category: "others"
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(item),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsAdding(false);
      setNewItem({ name: "", quantity: 1, unit: "unit", expiry_date: "", category: "others" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const filteredItems = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-sans text-white">Inventory</h1>
        <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(74,222,128,0.3)] active:scale-90 transition-transform"
        >
          <Plus />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim w-5 h-5" />
        <input 
            type="text" 
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder:text-text-dim"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl border border-white/10">
            <Filter className="w-4 h-4 text-text-dim" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
          <div className="glass p-4 rounded-[24px]">
              <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mb-1">Total Items</p>
              <p className="text-2xl font-bold text-white">{inventory.length}</p>
          </div>
          <div className="glass p-4 rounded-[24px]">
              <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mb-1">Categories</p>
              <p className="text-2xl font-bold text-white">{new Set(inventory.map(i => i.category)).size}</p>
          </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass p-4 rounded-[24px] flex items-center justify-between ${
                item.expiry_date && (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3
                ? "border-danger/30 bg-danger/5"
                : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Package className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-[11px] text-text-dim font-medium uppercase tracking-wider">{item.quantity} {item.unit} • {item.category}</p>
              </div>
            </div>
            <button 
                onClick={() => deleteMutation.mutate(item.id)}
                className="p-3 text-text-dim hover:text-danger hover:bg-danger/10 rounded-full transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" 
            />
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 glass rounded-t-[40px] p-8 pb-12 z-50 shadow-2xl max-w-xl mx-auto border-t border-glass-border"
            >
              <h2 className="text-xl font-bold mb-6 text-white">Add New Item</h2>
              <div className="space-y-4">
                <input 
                    className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-text-dim focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <div className="flex gap-4">
                    <input 
                        type="number"
                        className="flex-1 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-text-dim focus:ring-1 focus:ring-primary outline-none" 
                        placeholder="Qty"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    />
                    <select 
                        className="w-1/3 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-primary outline-none"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    >
                        <option value="unit">unit</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-dim pl-4 uppercase tracking-widest">Expiry Date</label>
                    <input 
                        type="date"
                        className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-primary outline-none"
                        value={newItem.expiry_date}
                        onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                    />
                </div>
                <button 
                    onClick={() => addItemMutation.mutate(newItem)}
                    className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-lg mt-4 active:scale-95 transition-all uppercase tracking-wider text-sm"
                >
                    Create Item
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
