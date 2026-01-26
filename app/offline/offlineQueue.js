import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "offline_queue";

export async function queueAction(action) {
  const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY)) || [];
  queue.push({ ...action, timestamp: Date.now() });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
