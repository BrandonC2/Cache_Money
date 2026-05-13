import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'pantry_history';
const HISTORY_LIMIT = 10;

const canonicalName = (value) => String(value || '').trim().toLowerCase();

const asHistoryArray = (parsed) => {
  if (!parsed) return [];
  if (Array.isArray(parsed)) {
    return parsed
      .filter((x) => x && typeof x === 'object' && canonicalName(x.name))
      .map((x, idx) => ({
        ...x,
        usageCount: Number(x.usageCount) || 1,
        // Preserve given timestamp, otherwise infer newer-first from index
        lastUsed: Number(x.lastUsed) || (Date.now() - idx),
      }));
  }
  if (typeof parsed === 'object') {
    return Object.values(parsed)
      .filter((x) => x && typeof x === 'object' && canonicalName(x.name))
      .map((x) => ({
        ...x,
        usageCount: Number(x.usageCount) || 1,
        lastUsed: Number(x.lastUsed) || Date.now(),
      }));
  }
  return [];
};

export const saveToHistory = async (item) => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const history = asHistoryArray(parsed);
    const name = canonicalName(item?.name);
    if (!name) return;
    const existing = history.find((h) => canonicalName(h.name) === name);
    const updatedEntry = {
      ...(existing || {}),
      ...item,
      name: item.name,
      usageCount: (existing?.usageCount || 0) + 1,
      lastUsed: Date.now(),
    };
    const updated = [updatedEntry, ...history.filter((h) => canonicalName(h.name) !== name)]
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, HISTORY_LIMIT);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('saveToHistory error:', err);
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return asHistoryArray(parsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, HISTORY_LIMIT);
  } catch (err) {
    console.error('getHistory error:', err);
    return [];
  }
};

export const trackUsage = async (ingredient) => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const history = asHistoryArray(parsed);
    const name = canonicalName(ingredient?.name);
    if (!name) return;
    const existing = history.find((h) => canonicalName(h.name) === name);
    const entry = {
      ...(existing || {}),
      ...ingredient,
      name: ingredient.name,
      usageCount: (existing?.usageCount || 0) + 1,
      lastUsed: Date.now(),
    };
    const updated = [entry, ...history.filter((h) => canonicalName(h.name) !== name)]
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, HISTORY_LIMIT);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('trackUsage error:', err);
  }
};