import { useState, useEffect } from 'react';
import axios from 'axios';

export const useRecipeCheck = (recipeId) => {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  const checkAvailability = async () => {
    setLoading(true);
    try {
      // Calls the logic we defined in the previous step
      const response = await axios.get(`/api/grocery/check/${recipeId}`);
      setComparison(response.data);
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