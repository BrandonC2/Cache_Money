import AsyncStorage from "@react-native-async-storage/async-storage";

export const AUTH_STORAGE_KEYS = ["authToken", "username", "profilePicture"];

export async function clearStoredCredentials() {
  try {
    await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
  } catch (_) {
    // ignore
  }
}

/** Registered once from App; invoked when API returns 401 (stale/expired JWT). */
let unauthorizedHandler = null;

export function registerUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === "function" ? fn : null;
}

export function notifySessionUnauthorized() {
  unauthorizedHandler?.();
}
