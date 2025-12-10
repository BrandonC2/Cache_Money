import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import apiClient from "../lib/apiClient";

export default function RecipeMaker({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load recipes from API on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await apiClient.get("/recipes");

        // If your API returns { success, data }, adjust as needed
        setRecipes(response.data);
      } catch (err) {
        console.log("Recipe load error:", err);
        setError("Could not load recipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Recipe Maker",
      headerShown: false,
    });
  }, []);

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate("RecipeDetails", { recipe: item })}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
      ) : (
        <View style={styles.noImageBox}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Text style={styles.recipeDesc} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Loading */}
      {loading && (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 40 }}
        />
      )}

      {/* Error */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Recipes List */}
      {!loading && !error && (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipe}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      {/* Add Recipe Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateRecipe")}
      >
        <Text style={styles.addButtonText}>+ Add Recipe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  recipeCard: {
    backgroundColor: "#f4f4f4",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
  },

  recipeImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
  },

  noImageBox: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  noImageText: { color: "#777" },

  recipeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  recipeDesc: {
    marginTop: 4,
    color: "#666",
  },

  errorText: {
    marginTop: 40,
    textAlign: "center",
    color: "red",
    fontSize: 16,
  },

  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#000",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 50,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
