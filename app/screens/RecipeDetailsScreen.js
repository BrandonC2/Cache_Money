import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback, useEffect } from "react"; // Added useEffect here
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import apiClient from "../lib/apiClient";
import { useRecipeCheck } from '../hooks/useRecipeCheck';

export default function RecipeDetailsScreen({ route, navigation }) {
  const [recipe, setRecipe] = useState(route.params.recipe);
  const { recipeId } = route.params;
  
  // Custom hook to check if we have the ingredients
  const { comparison, loading, checkAvailability, addMissingToGrocery } = useRecipeCheck(recipeId);

  useEffect(() => {
    checkAvailability();
  }, [recipeId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchRecipe = async () => {
  // If there's no ID, don't even bother the server
  if (!recipe?._id) {
    console.warn("Fetch aborted: No recipe ID found.");
    return;
  }

  try {
    const res = await apiClient.get(`/recipes/${recipe._id}`);
    // ... rest of your code
  } catch (err) {
    console.error("404 Check - URL attempted:", `/recipes/${recipe._id}`, err);
  }
      };
      fetchRecipe();
      return () => { isActive = false; };
    }, [recipe?._id])
  );

  // Helper to handle the "Action" button
  const handleAction = () => {
    if (comparison?.canMake) {
      console.log("Creating dish...");
      // Add logic to navigate to a 'Cook' screen or deduct inventory
    } else {
      addMissingToGrocery();
      alert("Missing items added to grocery list!");
    }
  };

  if (!recipe) return <Text>No Recipe Data</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>
      {recipe.fullImageUrl && <Image source={{ uri: recipe.fullImageUrl }} style={styles.image} />}
      
      {/* Dynamic Action Button */}
      <View style={styles.actionSection}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: comparison?.canMake ? "#4CAF50" : "#FF9800" }]} 
            onPress={handleAction}
          >
            <Text style={styles.actionText}>
              {comparison?.canMake ? "🍳 Cook This Dish" : "🛒 Get Missing Ingredients"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {recipe.ingredients.map((ing, i) => (
        <View key={i} style={styles.ingredientItem}>
          <Text style={{ fontWeight: "600" }}>{ing.name}</Text>
          {/* You can use your IngredientStatus component here to show if it's in stock */}
        </View>
      ))}

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate("EditRecipe", { recipe })}
      >
        <Text style={styles.editText}>Edit Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2ECD5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, marginTop: 20 },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 12 },
  actionSection: { marginVertical: 15 },
  actionBtn: { padding: 15, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  ingredientItem: { marginBottom: 12, padding: 10, backgroundColor: "#E8DCC8", borderRadius: 8 },
  editBtn: { marginTop: 20, padding: 10, alignItems: 'center' },
  editText: { color: '#888' }
});


