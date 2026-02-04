import { useFocusEffect } from "@react-navigation/native";
import React, {useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import apiClient from "../lib/apiClient"; // adjust the path if needed

export default function RecipeDetailsScreen({ route, navigation }) {
  const [recipe, setRecipe] = useState(route.params.recipe);

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

  if (!recipe) return <Text>No Recipe Data</Text>;
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>

      {recipe.fullImageUrl && (
        <Image source={{ uri: recipe.fullImageUrl }} style={styles.image} />
      )}

      <Text style={styles.description}>{recipe.description || "No description provided."}</Text>

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {recipe.ingredients.map((ing, i) => (
        <View key={i} style={styles.ingredientItem}>
          <Text style={{ fontWeight: "600" }}>{ing.name}</Text>
          {ing.foodGroup && <Text>Group: {ing.foodGroup}</Text>}
          {ing.notes && <Text>Notes: {ing.notes}</Text>}
          {ing.expirationDate && <Text>Expires: {new Date(ing.expirationDate).toDateString()}</Text>}
        </View>
      ))}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate("EditRecipe", { recipe })}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2ECD5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, marginTop: 20 },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 12 },
  description: { fontSize: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  ingredientItem: { marginBottom: 12, padding: 10, backgroundColor: "#E8DCC8", borderRadius: 8 },
  
});
