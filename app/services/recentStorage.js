// need to reflect the keyS

const RECENT_KEY = 'pantry_history';

export const saveToHistory = (item) => {
    const history = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  
    // Add new item to the front, remove duplicates
    const updated = [item, ...history.filter(h => h.name !== item.name)].slice(0, 10);
  
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

export const getHistory = () => {
    const data = localStorage.getItem(RECENT_KEY);
    // Return an empty object if nothing exists yet
    return data ? JSON.parse(data) : {};};

export const trackUsage = (ingredient) => {
    const history = JSON.parse(localStorage.getItem('pantry_history') || '{}');
  
    // Use the name as a key for O(1) lookup
    const key = ingredient.name.toLowerCase();
  
    history[key] = {
        ...ingredient,
        usageCount: (history[key]?.usageCount || 0) + 1,
        lastUsed: Date.now()
    };

    localStorage.setItem('pantry_history', JSON.stringify(history));
};