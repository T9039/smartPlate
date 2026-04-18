import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useStore";
import { Plus, Trash2, Search, Filter, Package } from "lucide-react-native";
import { InventoryItem } from "../types";
import { API_URL } from "../lib/baseUrl";

export default function InventoryList() {
  const token = useAuthStore((state: any) => state.token);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
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
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await fetch(`${API_URL}/inventory`, {
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
      await fetch(`${API_URL}/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const filteredItems = inventory.filter((item: InventoryItem) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View className="flex-1 bg-black p-6 pt-16">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-white uppercase tracking-tighter">Inventory</Text>
        <TouchableOpacity 
            onPress={() => setIsAdding(true)}
            className="w-10 h-10 bg-[#4ADE80] rounded-full items-center justify-center shadow-lg"
        >
          <Plus color="black" size={24} />
        </TouchableOpacity>
      </View>

      <View className="relative mb-6">
        <View className="absolute left-4 top-4 z-10">
          <Search color="rgba(255,255,255,0.4)" size={20} />
        </View>
        <TextInput 
            placeholder="Search items..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="bg-white/5 border border-white/10 p-4 pl-12 rounded-[24px] text-white"
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[24px]">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Items</Text>
                <Text className="text-2xl font-bold text-white">{inventory.length}</Text>
            </View>
            <View className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[24px]">
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Stock Vol</Text>
                <Text className="text-2xl font-bold text-white">{new Set(inventory.map((i: InventoryItem) => i.category)).size}</Text>
            </View>
        </View>

        <View className="gap-3 mb-24">
            {filteredItems.map((item: InventoryItem) => (
            <View 
                key={item.id}
                className="bg-white/5 border border-white/10 p-4 rounded-[24px] flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center">
                    <Package color="#4ADE80" size={20} />
                </View>
                <View>
                    <Text className="font-semibold text-white">{item.name}</Text>
                    <Text className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{item.quantity} {item.unit} • {item.category}</Text>
                </View>
                </View>
                <TouchableOpacity 
                    onPress={() => deleteMutation.mutate(item.id)}
                    className="p-2"
                >
                <Trash2 color="#F87171" size={20} />
                </TouchableOpacity>
            </View>
            ))}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={isAdding} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#1a2e1a] rounded-t-[40px] p-8 pb-12 border-t border-white/10">
                <Text className="text-xl font-bold text-white mb-6">Add New Item</Text>
                <View className="gap-4">
                    <TextInput 
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none" 
                        placeholder="Item Name"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={newItem.name}
                        onChangeText={(text: string) => setNewItem({...newItem, name: text})}
                    />
                    <View className="flex-row gap-4">
                        <TextInput 
                            keyboardType="numeric"
                            className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none" 
                            placeholder="Qty"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={String(newItem.quantity)}
                            onChangeText={(text: string) => setNewItem({...newItem, quantity: Number(text) || 0})}
                        />
                         <TextInput 
                            className="w-1/3 bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none" 
                            placeholder="Unit"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={newItem.unit}
                            onChangeText={(text: string) => setNewItem({...newItem, unit: text})}
                        />
                    </View>
                    <TextInput 
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none" 
                        placeholder="Expiry (YYYY-MM-DD)"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={newItem.expiry_date}
                        onChangeText={(text: string) => setNewItem({...newItem, expiry_date: text})}
                    />
                    <TouchableOpacity 
                        onPress={() => addItemMutation.mutate(newItem)}
                        className="bg-[#4ADE80] py-5 rounded-2xl items-center mt-4"
                    >
                        <Text className="text-black font-black uppercase tracking-widest">Create Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setIsAdding(false)}
                        className="items-center py-2"
                    >
                        <Text className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}
