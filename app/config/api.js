import { Platform } from 'react-native';
// Auto-detect API base for common development setups.
// - iOS simulator: localhost works
// - Android emulator (AVD): use 10.0.2.2 to reach host machine
// - Expo + physical device: override below with your machine LAN IP (e.g. http://192.168.1.100:5001)

// Default backend port
const DEFAULT_PORT = 5001;

let API_BASE = null;

// Runtime override (handy for ngrok or dynamic URLs)
if (typeof global !== 'undefined' && global.__API_BASE__) {
  API_BASE = global.__API_BASE__;
}

if (!API_BASE) {
  if (Platform.OS === 'android') {
    // Android emulator maps localhost to host machine
    API_BASE = `http://10.0.2.2:${DEFAULT_PORT}`;
  } else {
    // iOS simulator and web
    API_BASE = `http://localhost:${DEFAULT_PORT}`;
  }
}

// For physical devices, you can manually set your machine's LAN IP like:
// API_BASE = 'http://192.168.1.100:5000';

console.log('Using API_BASE:', API_BASE);

export default API_BASE;
