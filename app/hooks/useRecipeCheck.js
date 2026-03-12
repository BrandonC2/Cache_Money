import { useState } from 'react';
import apiClient from '../lib/apiClient';
import { calculateConfidence } from '../services/matchEngine';

export const useRecipeCheck = (recipeId) => {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  const checkAvailability = async () => {
    if (!recipeId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/grocerylist/check/${recipeId}`);
      const { canCook, ingredientsStatus } = response.data;

      // Map over ingredientsStatus to add confidence scores (API returns: name, required, current, unit, isMissing, missingAmount)
      const enhancedItems = (ingredientsStatus || []).map(item => {
        const confidence = calculateConfidence(
          { name: item.name, quantity: item.required, unit: item.unit },
          { name: item.name, quantity: item.current, unit: item.unit }
        );
        const status = confidence > 0.8 ? 'available' : confidence > 0.4 ? 'substitute' : 'missing';
        return { ...item, confidenceScore: confidence, status };
      });

      setComparison({ canMake: canCook, ingredientsStatus: enhancedItems });
    } catch (err) {
      console.error("Check failed", err);
    } finally {
      setLoading(false);
    }
  };

  const addMissingToGrocery = async (missingItems) => {
    const items = missingItems ?? (comparison?.ingredientsStatus || [])
      .filter(i => i.isMissing)
      .map(i => ({ name: i.name, quantity: i.missingAmount ?? i.required, unit: i.unit ?? '' }));
    if (items.length === 0) return;
    try {
      await apiClient.post('/grocerylist/add-missing', { items });
      alert("Added to grocery list!");
    } catch (err) {
      alert("Failed to update list");
    }
  };

  return { comparison, loading, checkAvailability, addMissingToGrocery };
};