import { useState, useMemo, useEffect } from 'react';
import { getHistory } from '../services/recentStorage';
import apiClient from '../lib/apiClient';

export const useIngredientSuggestions = (query) => {
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [localHistory, setLocalHistory] = useState({});

  useEffect(() => {
    getHistory().then(setLocalHistory);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query && query.length > 2) {
        apiClient.get(`/inventory/search/${encodeURIComponent(query)}`)
          .then(res => setGlobalSuggestions(res.data))
          .catch(err => console.error("❌ Search error:", err));
      } else {
        setGlobalSuggestions([]);
      }
    }, 400); 

    return () => clearTimeout(handler);
  }, [query]);

  return useMemo(() => {
    // 1. Convert local history object to an array
    const historyArray = Object.values(localHistory || {});
    
    // 2. Start with local history as the base
    const combined = [...historyArray];
    
    // 3. Merge Global results
    globalSuggestions.forEach(gItem => {
      // FIX: Changed lItem.canonicalName to lItem.name to match your Schema
      const alreadyExists = combined.find(
        lItem => lItem.name?.toLowerCase() === gItem.name?.toLowerCase()
      );

      if (!alreadyExists) {
        // Tag it so the UI can show a "Global" icon or different color
        combined.push({ ...gItem, isGlobal: true });
      }
    });

    // 4. Sort: Local items first, then by name
    return combined.sort((a, b) => {
      if (a.isGlobal && !b.isGlobal) return 1;
      if (!a.isGlobal && b.isGlobal) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [localHistory, globalSuggestions]);
};