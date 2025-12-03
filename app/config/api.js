import { Platform } from "react-native";

/**
 * Try to auto-detect the Metro bundler host.
 * Works on iOS/Android physical devices + simulators.
 */
function detectHost() {
  try {
    const scriptURL =
      global?.__bundleUrl ||
      global?.__fbBatchedBridgeConfig?.remoteModuleConfig?.sourceURL ||
      global?.__fbAndroidBundleURL;

    if (!scriptURL) return null;

    const host = scriptURL.split("://")[1].split(":")[0];
    return host;
  } catch (e) {
    return null;
  }
}

let host = detectHost();

let API_BASE;

// Most reliable: if bundler URL reveals LAN host
if (host) {
  API_BASE = `http://${host}:5001`;
}
// Android emulator fallback
else if (Platform.OS === "android") {
  API_BASE = "http://10.0.2.2:5001";
}
// iPhone fallback — uses the machine’s LAN IP **manually**
else {
  // Change ONLY this fallback line to your machine LAN IP
  API_BASE = "http://192.168.1.91:5001";
}

console.log("Using API_BASE:", API_BASE);

export default API_BASE;
