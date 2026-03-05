import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'pantry_history';

export const saveToHistory = async (item) => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const updated = [item, ...history.filter(h => h.name !== item.name)].slice(0, 10);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('saveToHistory error:', err);
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('getHistory error:', err);
    return {};
  }
};

export const trackUsage = async (ingredient) => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    const history = raw ? JSON.parse(raw) : {};
    const key = ingredient.name.toLowerCase();
    history[key] = {
      ...ingredient,
      usageCount: (history[key]?.usageCount || 0) + 1,
      lastUsed: Date.now(),
    };
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('trackUsage error:', err);
  }
};