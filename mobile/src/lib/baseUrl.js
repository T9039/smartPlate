/**
 * Network Utility for smartPlate (React Native / Frontend)
 * Helps switch between localhost (emulators) and local IP (physical devices)
 */

import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.100'; // Replace with your laptop's Local IP address

const getBaseUrl = () => {
  // If we are in the AI Studio environment, we can use the relative path for web
  // but for mobile devices, it needs a real IP.
  if (Platform.OS === 'web') {
    return ''; // Relative path for web preview
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  return `http://${LOCAL_IP}:3000`;
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
