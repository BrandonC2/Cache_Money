import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE from "../config/api";
import { isOnline } from "../utils/network";

const QUEUE_KEY = "offline_queue";

export async function syncOfflineData(token) {
  if (!(await isOnline())) return;

  const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY)) || [];
  if (!queue.length) return;

  for (const action of queue) {
    if (action.type === "ADD_INVENTORY") {
      await fetch(`${API_BASE}/api/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(action.payload)
      });
    }
  }

  await AsyncStorage.removeItem(QUEUE_KEY);
}
