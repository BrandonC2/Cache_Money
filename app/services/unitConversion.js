// utils/unitConverter.js

const UNIT_MAP = {
  // Volume to ml
  "ml": 1,
  "cup": 240,
  "tablespoon": 15,
  "tbsp": 15,
  "teaspoon": 5,
  "tsp": 5,
  // Weight to grams
  "g": 1,
  "kg": 1000,
  "oz": 28.35,
  "lb": 453.59,
  // Discrete
  "unit": 1,
  "can": 400, // Standard approximation for tomatoes/beans
};

export const convertToBase = (quantity, unit) => {
  const normalizedUnit = unit?.toLowerCase().replace(/s$/, ""); // remove plural 's'
  const multiplier = UNIT_MAP[normalizedUnit] || 1;
  return quantity * multiplier;
};