import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "../store/useStore";
import { API_URL } from "../lib/baseUrl";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleSubmit = async () => {
    setError("");
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { username, email, password } : { email, password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, data.token);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 items-center justify-center p-6"
      >
        <View className="w-full bg-[#1a2e1a] rounded-[40px] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-[#4ADE80] rounded-2xl items-center justify-center shadow-lg transform rotate-6">
                    <Text className="text-black font-black text-3xl">sP</Text>
                </View>
            </View>
            
            <Text className="text-3xl font-black text-center text-white mb-2 uppercase tracking-tighter">smartPlate</Text>
            <Text className="text-white/40 text-center mb-8 font-medium">Reduce waste, eat better.</Text>

            <View className="gap-4">
            {isRegister && (
                <View>
                <Text className="text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest pl-4">Username</Text>
                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none"
                    placeholder="pick a username"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                />
                </View>
            )}
            <View>
                <Text className="text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest pl-4">Email</Text>
                <TextInput
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none"
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                />
            </View>
            <View>
                <Text className="text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest pl-4">Password</Text>
                <TextInput
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                />
            </View>

            {error ? <Text className="text-[#F87171] text-xs font-bold pl-4 mb-2 uppercase tracking-tighter">{error}</Text> : null}

            <TouchableOpacity
                onPress={handleSubmit}
                className="bg-[#4ADE80] py-5 rounded-2xl items-center shadow-xl mt-4"
            >
                <Text className="text-black font-black uppercase tracking-wider text-sm">
                    {isRegister ? "Create Account" : "Sign In"}
                </Text>
            </TouchableOpacity>
            </View>

            <View className="mt-8 flex-row justify-center items-center">
                <Text className="text-white/40 text-sm">
                    {isRegister ? "Already have an account?" : "New to smartPlate?"}
                </Text>
                <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                    <Text className="text-[#4ADE80] font-black uppercase text-xs tracking-widest ml-2">
                        {isRegister ? "Sign In" : "Register"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
