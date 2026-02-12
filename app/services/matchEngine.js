import { convertToBase } from './unitConversion';

const BASICS = ['salt', 'water', 'pepper', 'olive oil', 'flour', 'sugar', 'baking powder'];

const SYNONYMS = {
    "aubergine": "eggplant",
    "cilantro": "coriander",
    "tomato": ["canned tomato", "roma tomato", "diced tomato"],
};

// 1. Helper: Name Normalization
const normalize = (name) => {
    if (!name) return "";
    return name.toLowerCase()
        .replace(/s\b/g, '') // remove plurals
        .replace(/(fresh|organic|large|small)\s+/g, '') // remove adjectives
        .trim();
};

// 2. Helper: Semantic/Fuzzy Scoring logic
const getNameSimilarity = (reqRaw, storeRaw) => {
  const req = normalize(reqRaw);
  const store = normalize(storeRaw);

  if (req === store) return 1.0;

  // Synonym check
  const synonym = SYNONYMS[req];
  if (Array.isArray(synonym) ? synonym.includes(store) : synonym === store) {
    return 0.95;
  }

  // Penalty logic (Fresh vs Dried)
  const isDried = (s) => s.toLowerCase().includes('dried') || s.toLowerCase().includes('powder');
  const baseFuzzy = 0.7; // Fallback score for "partial matches" like "Diced Tomato" vs "Tomato"
  
  if (isDried(reqRaw) !== isDried(storeRaw)) {
    return baseFuzzy * 0.5; 
  }

  return req.includes(store) || store.includes(req) ? 0.8 : 0.2;
};


export const calculateConfidence = (recipeItem, pantryItem) => {
    // 1a. Calculate Name Score
    const nameScore = getNameSimilarity(recipeItem.name, pantryItem.name);

    // 1b. Identify if it's a staple
    const isBASIC = BASICS.includes(normalize(recipeItem.name));
    let quantityScore = 1.0;

    // 2. Calculate Quantity Score
    if (!isBASIC){
        const recipeBase = convertToBase(recipeItem.quantity, recipeItem.unit);
        const pantryBase = convertToBase(pantryItem.quantity, pantryItem.unit);
    
    if (pantryBase < recipeBase && recipeBase > 0) {
        // Percentage of requirement met
        quantityScore = pantryBase / recipeBase; 
    }

    }
    
    // 3. Composite Scoring
    // If the name score is very low, the quantity is irrelevant.
    if (nameScore < 0.4) return 0;

    // Weighted average: 80% name accuracy, 20% quantity sufficiency
    const finalScore = (nameScore * 0.8) + (quantityScore * 0.2);
    return parseFloat(finalScore.toFixed(2));
};