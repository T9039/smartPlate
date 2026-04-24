/**
 * Network Utility for smartPlate (React Native / Expo)
 *
 * Set your machine's LAN IP in mobile/.env:
 *   EXPO_PUBLIC_API_IP=192.168.x.x
 *
 * Each developer sets this locally — it is gitignored and never committed.
 */

import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return ''; // Relative path works fine for web preview
  }

  if (Platform.OS === 'android') {
    // Physical Android device: use EXPO_PUBLIC_API_IP from .env
    // Android emulator fallback: 10.0.2.2 routes to host machine
    const ip = process.env.EXPO_PUBLIC_API_IP;
    return ip ? `http://${ip}:3000` : 'http://10.0.2.2:3000';
  }

  // iOS (physical device or simulator)
  const ip = process.env.EXPO_PUBLIC_API_IP;
  if (!ip) {
    console.warn('[smartPlate] EXPO_PUBLIC_API_IP is not set in mobile/.env — API calls will fail on physical devices.');
  }
  return `http://${ip || 'localhost'}:3000`;
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
