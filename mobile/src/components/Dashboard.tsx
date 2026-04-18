import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/useStore";
import { AlertCircle, TrendingDown, Utensils, Zap, ChevronRight, Apple } from "lucide-react-native";
import { InventoryItem } from "../types";
import { API_URL } from "../lib/baseUrl";

export default function Dashboard() {
  const token = useAuthStore((state: any) => state.token);
  const user = useAuthStore((state: any) => state.user);

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const { data: nudges = [] } = useQuery<string[]>({
    queryKey: ["nudges"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/ai/nudges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const expiringSoon = inventory.filter((item: InventoryItem) => {
    if (!item.expiry_date) return false;
    const expiry = new Date(item.expiry_date);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  });

  return (
    <ScrollView className="flex-1 bg-black p-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-2xl font-bold text-white">Kitchen Insights</Text>
          <Text className="text-white/60">Welcome back, {user?.username}!</Text>
        </View>
        <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20">
          <Utensils color="#4ADE80" size={24} />
        </View>
      </View>

      {/* AI Nudge Section */}
      <View className="mb-8">
        <View className="flex-row items-center gap-2 mb-4">
          <Zap color="#4ADE80" size={16} fill="rgba(74,222,128,0.2)" />
          <Text className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Behavioral Nudges</Text>
        </View>
        <View className="gap-4">
          {nudges.map((nudge: string, i: number) => (
            <View
              key={i}
              className="bg-[#4ADE80]/5 border border-[#4ADE80]/20 p-5 rounded-[24px] relative overflow-hidden"
            >
              <View className="flex-row items-start gap-4">
                <View className="bg-[#4ADE80]/10 p-2 rounded-xl mt-1">
                  <TrendingDown color="#4ADE80" size={16} />
                </View>
                <View className="flex-1">
                   <Text className="text-[10px] font-black text-[#4ADE80] uppercase tracking-widest mb-1">Waste Analysis Log</Text>
                   <Text className="text-sm leading-6 text-white/80">{nudge}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Alerts Section */}
      <View className="mb-8">
        <Text className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-4">Expiring Soon</Text>
        {expiringSoon.length > 0 ? (
          <View className="gap-3">
            {expiringSoon.map((item: InventoryItem) => (
              <View
                key={item.id}
                className="bg-white/5 border border-white/10 p-4 rounded-[24px] flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-[#F87171]/10 rounded-xl items-center justify-center border border-[#F87171]/20">
                    <Apple color="#F87171" size={20} />
                  </View>
                  <View>
                    <Text className="font-semibold text-white">{item.name}</Text>
                    <Text className="text-[11px] text-white/40">
                       Expires in {Math.ceil((new Date(item.expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </Text>
                  </View>
                </View>
                <View className="w-2 h-2 rounded-full bg-[#F87171]" />
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white/5 border border-[#4ADE80]/20 p-8 rounded-[24px] items-center">
            <Text className="text-[#4ADE80] font-bold">All clear!</Text>
            <Text className="text-white/40 text-[10px] mt-1 uppercase">No items expiring soon</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-4 mb-24">
        <TouchableOpacity className="flex-1 bg-[#4ADE80] p-6 rounded-[24px] items-center gap-2 shadow-lg">
          <Utensils color="black" size={24} />
          <Text className="font-black text-[10px] uppercase tracking-wider text-black">Meal Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white/5 border border-white/10 p-6 rounded-[24px] items-center gap-2">
          <Zap color="#4ADE80" size={24} />
          <Text className="font-black text-[10px] uppercase tracking-wider text-white">AI Recipes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
