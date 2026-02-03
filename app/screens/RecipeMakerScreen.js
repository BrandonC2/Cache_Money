import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import apiClient from "../lib/apiClient";

export default function RecipeMakerScreen() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load recipes from API
  const loadRecipes = async () => {
    setError(null);
    try {
      const res = await apiClient.get("/recipes");
      
      console.log(`Successfully fetched ${res.data.length} recipes.`);

      // Construct full image URL for each recipe
      const baseUrl = apiClient.defaults.baseURL.replace(/\/$/, ""); // Remove trailing slash if exists

      const fullData = res.data.map((r) => ({
        ...r,
        fullImageUrl: r.fullImageUrl
          ? `${baseUrl}${r.fullImageUrl}`
          : r.image 
            ? `${baseUrl}/uploads/recipes/${r.image}` // Fallback if fullImageUrl isn't provided
            : null,
      }));

      setRecipes(fullData);
    } catch (err) {
      console.error("Failed to load recipes:", err);
      setError("Unable to connect to the server. Please check your internet.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate("RecipeDetails", { recipe: item })}
    >
      {item.fullImageUrl ? (
        <Image 
          source={{ uri: item.fullImageUrl }} 
          style={styles.recipeImage} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImagePlaceholder}>
          <Text style={{ color: "#888" }}>No Image Available</Text>
        </View>
      )}
      
      <View style={styles.recipeInfo}>
        <View style={styles.row}>
          <Text style={styles.recipeName}>{item.name}</Text>
          {item.foodGroup || item.recipeGroup && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.foodGroup || item.recipeGroup}</Text>
            </View>
          )}
        </View>

        <Text style={styles.recipeUser}>
          By: {typeof item.userId === 'object' ? item.userId.username : 'Community Member'}
        </Text>
        
        <Text style={styles.recipeIngredients}>
          🛒 {item.ingredients?.length || 0} Ingredients
        </Text>
      </View>
    </TouchableOpacity>
  );

  // 1. LOADING STATE
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4D693A" />
        <Text style={{ marginTop: 10 }}>Fetching tasty recipes...</Text>
      </View>
    );
  }

  // 2. ERROR STATE
  if (error && recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRecipes}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item._id}
        renderItem={renderRecipe}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4D693A"]} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No recipes yet. Be the first to create one!</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.createButton} 
        onPress={() => navigation.navigate("RecipeCreator")}
      >
        <Text style={styles.createButtonText}>+ Create Recipe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2ECD5" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  recipeCard: {
    backgroundColor: "#E8DCC8",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3, // Android Shadow
    shadowColor: "#000", // iOS Shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  recipeImage: { width: "100%", height: 180 },
  noImagePlaceholder: { width: "100%", height: 180, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center" },
  recipeInfo: { padding: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recipeName: { fontSize: 18, fontWeight: "700", color: "#2e4221" },
  recipeUser: { fontSize: 13, color: "#666", marginTop: 2 },
  recipeIngredients: { fontSize: 14, color: "#4D693A", marginTop: 8, fontWeight: "600" },
  badge: { backgroundColor: "#4D693A", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  createButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4D693A",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "#d9534f", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#4D693A", padding: 12, borderRadius: 8 },
  emptyText: { textAlign: "center", color: "#666", marginTop: 50 }
});