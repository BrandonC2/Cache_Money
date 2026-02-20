import { useState } from 'react';
import axios from 'axios';
import { calculateConfidence } from '../services/matchEngine';

export const useRecipeCheck = (recipeId) => {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/grocery/check/${recipeId}`);
      
      // We map over the raw API data to add our "Confidence Intelligence"
      const enhancedComparison = response.data.map(item => {
        // Run our JS matching engine on the two names
        const confidence = calculateConfidence(
            { name: item.requiredName, quantity: item.requiredQty, unit: item.requiredUnit },
            { name: item.foundName, quantity: item.foundQty, unit: item.foundUnit }
          );
        let status = 'missing';
        if (confidence > 0.8) status = 'available';
        else if (confidence > 0.5) status = 'low_stock';
        return {
          ...item,
          confidenceScore: confidence,
          // Logic to decide UI status based on the score
          status: confidence > 0.8 ? 'available' : confidence > 0.4 ? 'substitute' : 'missing'
        };
      });

      setComparison(enhancedComparison);
    } catch (err) {
      console.error("Check failed", err);
    } finally {
      setLoading(false);
    }
  };

  const addMissingToGrocery = async (missingItems) => {
    try {
      await axios.post('/api/grocery/add-missing', { items: missingItems });
      alert("Added to grocery list!");
    } catch (err) {
      alert("Failed to update list");
    }
  };

  return { comparison, loading, checkAvailability, addMissingToGrocery };
};