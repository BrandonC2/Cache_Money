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

      {/* Ingredients Section */}
<Text style={styles.sectionTitle}>Ingredients</Text>
<View style={styles.ingredientsCard}>
  {recipe.ingredients.map((ing, i) => (
    <View key={i} style={styles.ingredientItem}>
      <View style={styles.bullet} />
      <Text style={styles.ingredientText}>
        <Text style={styles.qtyText}>{ing.quantity} {ing.unit} </Text>
        <Text style={styles.ingName}>{ing.name}</Text>
      </Text>
      {/* Optional: Show food group tag */}
      <View style={styles.groupTag}>
        <Text style={styles.groupTagText}>{ing.foodGroup}</Text>
      </View>
    </View>
  ))}
</View>

{/* Instructions Section (Recommended addition) */}
<Text style={styles.sectionTitle}>Instructions</Text>
{recipe.instructions?.map((step, i) => (
  <View key={i} style={styles.stepContainer}>
    <Text style={styles.stepNumber}>{i + 1}</Text>
    <Text style={styles.stepDescription}>{step.description}</Text>
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
  editText: { color: '#888' },
  ingredientsCard: {
  backgroundColor: "#FFF",
  borderRadius: 12,
  padding: 15,
  marginVertical: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
ingredientItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#F0F0F0",
},
bullet: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: "#4D693A",
  marginRight: 10,
},
ingredientText: { flex: 1, fontSize: 16 },
qtyText: { fontWeight: "700", color: "#4D693A" },
ingName: { color: "#333" },
groupTag: {
  backgroundColor: "#E8F5E9",
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 4,
},
groupTagText: { fontSize: 10, color: "#4D693A", fontWeight: "bold" },
// Instructions Styles
stepContainer: { flexDirection: 'row', marginBottom: 15, paddingRight: 20 },
stepNumber: { fontWeight: 'bold', color: '#4D693A', marginRight: 10 },
stepDescription: { flex: 1, fontSize: 15, lineHeight: 22 }
});
