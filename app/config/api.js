import { Platform, NativeModules } from "react-native";

/**
 * Try to auto-detect Metro bundler host.
 * Works on iOS/Android, emulator/physical, dev mode only.
 */
function detectHost() {
  try {
    // Best source (works in RN 0.70+ reliably)
    const bundleURL = Platform?.bundleURL;
    if (bundleURL?.startsWith("http")) {
      return bundleURL.split("://")[1].split(":")[0];
    }

    // Secondary fallback (older RN versions)
    const sourceURL = NativeModules?.DevSettings?.sourceURL;
    if (sourceURL?.startsWith("http")) {
      return sourceURL.split("://")[1].split(":")[0];
    }

    // Last resort (rarely works)
    const scriptURL =
      global?.__bundleUrl ||
      global?.__fbBatchedBridgeConfig?.remoteModuleConfig?.sourceURL ||
      global?.__fbAndroidBundleURL;

    if (scriptURL?.startsWith?.("http")) {
      return scriptURL.split("://")[1].split(":")[0];
    }

    return null; // Production or file:// bundle
  } catch {
    return null;
  }
}

let host = detectHost();

let API_BASE;

// If Metro is running and we got the device's LAN IP
if (host) {
  API_BASE = `http://${host}:5001`;
}
// Android Emulator
else if (Platform.OS === "android") {
  API_BASE = "http://10.0.2.2:5001";
}
// iOS physical device fallback — change this once
else {
  API_BASE = "http://192.168.1.91:5001";
}

console.log("Using API_BASE:", API_BASE);

export default API_BASE;
