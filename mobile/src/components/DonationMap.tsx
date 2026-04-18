import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { MapPin, Info, Navigation, Heart } from "lucide-react-native";

const MOCK_FOOD_BANKS = [
    { id: 1, name: "City Relief Center", address: "123 Hope St", distance: "0.8m" },
    { id: 2, name: "Green Earth Pantry", address: "55 Market Ave", distance: "1.2m" },
    { id: 3, name: "Community Kitchen", address: "90 Union Sq", distance: "2.5m" },
];

export default function DonationMap() {
  return (
    <View className="flex-1 bg-black p-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-2xl font-bold text-white uppercase tracking-tighter">Charity Map</Text>
          <Text className="text-white/40 text-sm font-medium">Don't waste, donate.</Text>
        </View>
        <View className="w-12 h-12 bg-[#F87171]/10 border border-[#F87171]/20 rounded-full items-center justify-center">
            <Heart color="#F87171" size={24} fill="rgba(248,113,113,0.2)" />
        </View>
      </View>

      {/* Map Container (Simulated) */}
      <View className="flex-1 bg-white/5 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative">
          <Image 
            source={{ uri: 'https://picsum.photos/seed/map/800/800' }}
            className="absolute inset-0 opacity-10 grayscale invert"
          />
          
          <View className="flex-1 items-center justify-center">
            {MOCK_FOOD_BANKS.map((bank, i) => (
                <View 
                    key={bank.id}
                    className="absolute"
                    style={{ 
                        top: `${20 + (i * 20)}%`, 
                        left: `${15 + (i * 25)}%` 
                    }}
                >
                    <MapPin color="#4ADE80" size={32} fill="rgba(74,222,128,0.2)" />
                </View>
            ))}
          </View>

          <View className="absolute bottom-6 right-6 gap-2">
            <TouchableOpacity className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <Navigation color="white" size={20} />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#4ADE80] p-4 rounded-2xl">
                <Info color="black" size={20} />
            </TouchableOpacity>
          </View>
      </View>

      {/* Info Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-24 h-48"
        contentContainerStyle={{ gap: 16 }}
      >
        {MOCK_FOOD_BANKS.map((bank) => (
            <View key={bank.id} className="w-[280px] bg-white/5 border border-white/10 p-6 rounded-[32px] shadow-xl justify-between">
                <View>
                    <Text className="font-bold text-white text-lg">{bank.name}</Text>
                    <Text className="text-sm text-white/40 font-medium">{bank.address}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-4">
                    <View className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-3 py-1.5 rounded-full">
                        <Text className="text-[#4ADE80] text-[10px] font-black uppercase tracking-widest">
                            {bank.distance} away
                        </Text>
                    </View>
                    <TouchableOpacity className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Directions</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ))}
      </ScrollView>
    </View>
  );
}
