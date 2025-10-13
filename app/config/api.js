import { Platform } from 'react-native';
// Auto-detect API base for common development setups.
// - iOS simulator: localhost works
// - Android emulator (AVD): use 10.0.2.2 to reach host machine
// - Expo + physical device: override below with your machine LAN IP (e.g. http://192.168.1.100:5001)

// You can also set global.__API_BASE__ at runtime (for quick override),
// or edit this file to set a fixed URL.

const DEFAULT_PORT = 5001;

let API_BASE = null;

// Allow runtime override (handy when testing on device)
if (typeof global !== 'undefined' && global.__API_BASE__) {
	API_BASE = global.__API_BASE__;
}

if (!API_BASE) {
	if (Platform.OS === 'android') {
		// Android emulator mapping to host machine
		API_BASE = `http://10.0.2.2:${DEFAULT_PORT}`;
	} else {
		// iOS simulator and web (localhost works)
		API_BASE = `http://localhost:${DEFAULT_PORT}`;
	}
}

export default API_BASE;
