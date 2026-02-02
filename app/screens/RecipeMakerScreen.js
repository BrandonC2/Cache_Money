import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import apiClient from "../lib/apiClient";

export default function RecipeMakerScreen() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load recipes from API
  const loadRecipes = async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get("/recipes");
      // Construct full image URL for each recipe
      const fullData = res.data.map((r) => ({
        ...r,
        fullImageUrl: r.image ? `${apiClient.defaults.baseURL}/uploads/recipes/${r.image}`: null,
      }));
      setRecipes(fullData);
    } catch (err) {
      console.error("Failed to load recipes:", err);
      Alert.alert("Error", "Failed to load recipes.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  // Navigate to RecipeCreator with callback
  const goToCreateRecipe = () => {
    navigation.navigate("RecipeCreator", {
      onNewRecipe: (newRecipe) => {
        // Prepend the new recipe to the list
        setRecipes((prev) => [newRecipe, ...prev]);
      },
    });
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() =>
        navigation.navigate("RecipeDetails", { recipe: item })
      }
    >
      {item.fullImageUrl ? (
        <Image source={{ uri: item.fullImageUrl }} style={styles.recipeImage} />
      ) : (
        <View style={[styles.recipeImage, { justifyContent: "center", alignItems: "center" }]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeUser}>By: {item.userId.username}</Text>
        <Text style={styles.recipeIngredients}>
          Ingredients: {item.ingredients.length}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D693A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item._id}
        renderItem={renderRecipe}
        refreshing={refreshing}
        onRefresh={loadRecipes}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>No recipes yet.</Text>}
      />
      <TouchableOpacity style={styles.createButton} onPress={goToCreateRecipe}>
        <Text style={styles.createButtonText}>+ Create Recipe</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2ECD5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  recipeCard: {
    backgroundColor: "#E8DCC8",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  recipeImage: { width: "100%", height: 200 },
  recipeInfo: { padding: 12 },
  recipeName: { fontSize: 18, fontWeight: "700" },
  recipeUser: { fontSize: 14, color: "#666", marginTop: 4 },
  recipeIngredients: { fontSize: 14, color: "#333", marginTop: 4 },
  createButton: {
    backgroundColor: "#4D693A",
    padding: 12,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
});
