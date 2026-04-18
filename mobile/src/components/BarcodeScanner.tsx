import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Camera, RefreshCw, X } from "lucide-react-native";
import { API_URL } from "../lib/baseUrl";

export default function BarcodeScanner({ onBack }: { onBack: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const mockScan = async () => {
    setLoading(true);
    // Simulating sequence
    setTimeout(async () => {
      try {
        const res = await fetch("https://world.openfoodfacts.org/api/v0/product/3017620422003.json");
        const data = await res.json();
        setScanResult(data.product);
      } catch (e) {
        console.error("Scan error", e);
      } finally {
        setLoading(false);
        setIsScanning(false);
      }
    }, 2000);
  };

  return (
    <View className="flex-1 bg-black p-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-2xl font-bold text-white uppercase tracking-tighter">Scan Barcode</Text>
        <TouchableOpacity onPress={onBack} className="p-2">
            <X color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* Simulator Frame */}
      <View className="relative aspect-[3/4] bg-white/5 border border-white/10 rounded-[40px] overflow-hidden items-center justify-center shadow-2xl">
        {!isScanning ? (
          <View className="items-center p-8">
            <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
              <Camera color="white" size={40} />
            </View>
            <Text className="text-white/40 mb-8 max-w-[220px] text-center text-sm font-medium">
                Point your camera at a barcode to automatically add items.
            </Text>
            <TouchableOpacity 
                onPress={() => { setIsScanning(true); mockScan(); }}
                className="bg-[#4ADE80] px-10 py-5 rounded-full shadow-xl"
            >
              <Text className="text-black font-black uppercase tracking-widest text-xs">Start Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center justify-center">
            <View className="w-64 h-32 border-2 border-[#4ADE80]/40 rounded-3xl items-center justify-center overflow-hidden">
                <View className="w-full h-1 bg-[#4ADE80] shadow-lg" />
            </View>
            <Text className="text-[#4ADE80] font-black mt-8 text-[10px] tracking-[0.3em] uppercase animate-pulse">
                {loading ? "Analyzing Data..." : "Aligning Barcode..."}
            </Text>
          </View>
        )}
      </View>

      {/* Results */}
      {scanResult && (
        <View className="bg-[#1a2e1a] p-6 rounded-[40px] mt-6 border border-white/10 shadow-2xl">
            <TouchableOpacity 
                onPress={() => setScanResult(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full border border-white/10"
            >
                <X color="white" size={16} />
            </TouchableOpacity>
            <View className="flex-row gap-4 mb-6">
                <Image 
                    source={{ uri: scanResult.image_url || "https://picsum.photos/seed/food/200/200" }} 
                    className="w-20 h-20 rounded-2xl bg-white/5"
                />
                <View className="flex-1">
                    <Text className="font-bold text-white text-lg">{scanResult.product_name}</Text>
                    <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{scanResult.brands}</Text>
                    <View className="mt-2">
                        <View className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-3 py-1.5 rounded-full items-center self-start">
                            <Text className="text-[#4ADE80] text-[10px] font-black uppercase tracking-widest">
                                Grade {scanResult.nutrition_grades?.toUpperCase() || "A"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity className="bg-white py-5 rounded-2xl items-center flex-row justify-center gap-2">
                <RefreshCw color="black" size={16} />
                <Text className="text-black font-black uppercase tracking-widest text-xs">Add to Inventory</Text>
            </TouchableOpacity>
        </View>
      )}

      <View className="mt-auto mb-8 bg-white/5 p-6 rounded-[32px] border border-dashed border-white/10">
          <Text className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-widest text-center">
              Mobile Feature: Uses Expo Camera in Production. In this prototype, we simulate API results.
          </Text>
      </View>
    </View>
  );
}
