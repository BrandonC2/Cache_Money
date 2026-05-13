import { useState, useMemo, useEffect, useRef } from 'react';
import { getHistory } from '../services/recentStorage';
import apiClient from '../lib/apiClient';

export const useIngredientSuggestions = (query) => {
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [localHistory, setLocalHistory] = useState([]);
  const latestQueryRef = useRef('');

  useEffect(() => {
    getHistory().then(setLocalHistory);
  }, []);

  useEffect(() => {
    const currentQuery = String(query || '').trim();
    latestQueryRef.current = currentQuery.toLowerCase();
    const handler = setTimeout(() => {
      if (currentQuery.length > 2) {
        apiClient.get(`/inventory/search/${encodeURIComponent(currentQuery)}`)
          .then(res => {
            // Ignore stale responses from older queries.
            if (latestQueryRef.current !== currentQuery.toLowerCase()) return;
            setGlobalSuggestions(Array.isArray(res.data) ? res.data : []);
          })
          .catch(err => console.error("❌ Search error:", err));
      } else {
        setGlobalSuggestions([]);
      }
    }, 400); 

    return () => clearTimeout(handler);
  }, [query]);

  return useMemo(() => {
    // 1. Ensure local history is an array
    const historyArray = Array.isArray(localHistory) ? localHistory : [];
    
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
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [localHistory, globalSuggestions]);
};