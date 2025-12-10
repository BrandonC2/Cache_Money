import { Platform } from "react-native";

/**
 * Extract the Metro bundler host from the app's bundle URL.
 * Works on iOS/Android physical devices + simulators.
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

/**
 * Get the machine's LAN IP by using the bundler host.
 * The Metro bundler runs on the machine's LAN IP, so we can extract it.
 * This avoids hardcoding an IP that may change.
 */
function getLanIp() {
  const host = detectHost();
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    console.log("getLanIp: Using detected bundler host:", host);
    return host;
  }
  // Fallback: try localhost (only works for iOS simulator on same machine)
  console.log("getLanIp: Falling back to localhost");
  return "localhost";
}

/**
 * Determine API_BASE dynamically based on platform and bundler host.
 * Uses the Metro bundler's host as the LAN IP (most reliable).
 */
function getApiBase() {
  const host = getLanIp();

  // Android emulator has a special route to the host machine
  if (Platform.OS === "android" && (host === "localhost" || host === "127.0.0.1")) {
    const apiBase = "http://10.0.2.2:5001";
    console.log("getApiBase: Using Android emulator route:", apiBase);
    return apiBase;
  }

  // For all other cases, use the detected/fallback host
  const apiBase = `http://${host}:5001`;
  console.log("getApiBase: Using host:", host, "→ API_BASE:", apiBase);
  return apiBase;
}

const API_BASE = getApiBase();
console.log("Final API_BASE:", API_BASE);

export default API_BASE;
