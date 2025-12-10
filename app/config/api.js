import { Platform } from "react-native";

/**
 * Try to auto-detect the Metro bundler host.
 * Works on iOS/Android physical devices + simulators.
 * Falls back to null if detection fails.
 */
function detectHost() {
  try {
    const scriptURL =
      global?.__bundleUrl ||
      global?.__fbBatchedBridgeConfig?.remoteModuleConfig?.sourceURL ||
      global?.__fbAndroidBundleURL;

    if (!scriptURL) {
      console.log("detectHost: No bundler URL found in globals");
      return null;
    }

    // Extract host from URL (e.g., "http://192.168.1.100:8081/..." -> "192.168.1.100")
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match && match[1]) {
      const extractedHost = match[1];
      console.log("detectHost: Extracted host from bundler URL:", extractedHost);
      return extractedHost;
    }

    console.log("detectHost: Could not parse host from URL:", scriptURL);
    return null;
  } catch (e) {
    console.error("detectHost: Error during detection:", e);
    return null;
  }
}

let host = detectHost();

let API_BASE;

// Most reliable: if bundler URL reveals LAN host
if (host) {
  API_BASE = `http://${host}:5001`;
  console.log("API_BASE set from detected host:", API_BASE);
}
// Android emulator fallback
else if (Platform.OS === "android") {
  API_BASE = "http://10.0.2.2:5001";
  console.log("API_BASE set for Android emulator:", API_BASE);
}
// iPhone/iOS fallback — uses the machine's LAN IP
else {
  // Change ONLY this fallback line to your machine LAN IP
  API_BASE = "http://192.168.1.91:5001";
  console.log("API_BASE set to iOS fallback (manual LAN IP):", API_BASE);
}

console.log("Final API_BASE:", API_BASE);

export default API_BASE;
