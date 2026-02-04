import React, { SafeAreaView, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl, TextInput
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import apiClient from "../lib/apiClient";

export default function RecipeMakerScreen() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]); // To store search results

  // Load recipes from API
const loadRecipes = async () => {
  setError(null);
  try {
    const res = await apiClient.get("/recipes");
    
    // NEW CLOUDINARY LOGIC
    const fullData = res.data.map((r) => ({
      ...r,
      // Since 'image' is now a full URL from Cloudinary, use it directly
      fullImageUrl: r.image || null, 
    }));

    // LOG THIS: Copy this exact output from your console and paste it into Chrome
    if (fullData.length > 0) {
      console.log("🔗 TEST THIS LINK:", fullData[0].fullImageUrl);
    }

    setRecipes(fullData);
  } catch (err) {
    console.error("Failed to load recipes:", err);
    setError("Unable to connect to the server.");
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

const renderRecipe = ({ item }) => {
    // Determine the group name safely
    const groupName = item.foodGroup || item.recipeGroup;
    
    // Determine the chef name safely
    const chefName = item.userId && typeof item.userId === 'object' 
      ? item.userId.username 
      : 'Community Member';

    return (
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
            
            {/* FIXED LOGIC: We check if groupName exists first */}
            {!!groupName && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{groupName}</Text>
              </View>
            )}
          </View>

          <Text style={styles.recipeUser}>By: {chefName}</Text>
          
          <Text style={styles.recipeIngredients}>
            🛒 {item.ingredients?.length || 0} Ingredients
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

  const handleSearch = (text) => {
  setSearchQuery(text);
  
  // Filter the original recipes array (assuming it's called 'recipes')
  const filtered = recipes.filter((item) => {
    const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
    const textData = text.toUpperCase();
    return itemData.indexOf(textData) > -1;
  });

  setFilteredRecipes(filtered);
};

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes (e.g. Pasta)..."
          value={searchQuery}
          onChangeText={(text) => handleSearch(text)}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={searchQuery.length > 0 ? filteredRecipes : recipes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate("RecipeDetails", { recipe: item })}
          >
            {/* Recipe Image */}
            <Image 
              source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
              style={styles.cardImage} 
            />
            
            {/* Recipe Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.foodGroup}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
  recipeImage: { 
    width: "100%",      // Takes up the full width of the card
    height: 200,        // You MUST have a fixed height for remote images
    backgroundColor: "#ddd", // Helps you see the box while the image loads
  },
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
  emptyText: { textAlign: "center", color: "#666", marginTop: 50 },
  
searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#e8d5c460",
  borderRadius: 10,
  margin: 15,
  paddingHorizontal: 15,
  borderWidth: 1,
  borderColor: "#c2b9b2ff",
},
searchInput: {
  flex: 1,
  height: 45,
  fontSize: 16,
  color: "#333",
},
clearButton: {
  fontSize: 18,
  color: "#999",
  padding: 5,
},
card: {
  backgroundColor: "white",
  borderRadius: 12,
  marginHorizontal: 15,
  marginBottom: 15,
  flexDirection: "row", // Puts image and text side-by-side
  overflow: "hidden",
  elevation: 3, // Shadow for Android
  shadowColor: "#000", // Shadow for iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  borderWidth: 1,
  borderColor: "#c2b9b2ff",
},
cardImage: {
  width: 100,
  height: 100,
  backgroundColor: "#f0f0f0",
},
cardInfo: {
  flex: 1,
  padding: 10,
  justifyContent: "center",
},
cardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#4D693A", // Matching your dark green theme
  marginBottom: 2,
},
cardCategory: {
  fontSize: 12,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 5,
},
cardDescription: {
  fontSize: 14,
  color: "#666",
  lineHeight: 18,
},

});