/**
 * Network Utility for smartPlate (React Native / Frontend)
 * Helps switch between localhost (emulators) and local IP (physical devices)
 */

import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.100'; // Replace with your laptop's Local IP address

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access localhost
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // iOS simulator uses localhost
      return 'http://localhost:3000';
    } else if (Platform.OS === 'web') {
      // Web browser
      return 'http://localhost:3000';
    }
    // For physical devices, use the local network IP
    return `http://${LOCAL_IP}:3000`;
  }
  
  // Production URL
  return 'https://api.smartplate.app';
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
