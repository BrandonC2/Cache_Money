import { useFocusEffect, CommonActions } from "@react-navigation/native";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import apiClient from "../lib/apiClient";
import { useRecipeCheck } from '../hooks/useRecipeCheck';

/** Only returns a valid Mongo ObjectId hex string (prevents bad URLs → 404). */
function toHexObjectIdString(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    if (typeof value.$oid === "string") return toHexObjectIdString(value.$oid);
    if (typeof value.toString === "function") {
      const s = String(value.toString()).trim();
      if (/^[a-fA-F0-9]{24}$/.test(s)) return s;
    }
    return "";
  }
  const s = String(value).trim();
  return /^[a-fA-F0-9]{24}$/.test(s) ? s : "";
}

function recipeDocumentId(recipeLike, fallbackId) {
  return (
    toHexObjectIdString(recipeLike?._id) ||
    toHexObjectIdString(recipeLike?.id) ||
    toHexObjectIdString(fallbackId)
  );
}

export default function RecipeDetailsScreen({ route, navigation }) {
  const [recipe, setRecipe] = useState(route.params?.recipe);
  /** After DELETE succeeds, skip refetching detail (would 404) until user leaves the screen. */
  const [recipeRemoved, setRecipeRemoved] = useState(false);
  const deleteInFlight = useRef(false);
  const recipeId = recipeRemoved
    ? ""
    : recipeDocumentId(recipe, route.params?.recipeId) ||
      toHexObjectIdString(route.params?.recipeId);
  
  const { comparison, loading, checkAvailability, addMissingToGrocery, cookRecipe } =
    useRecipeCheck(recipeId);
  const [actionBusy, setActionBusy] = useState(false);

  /** Stable id from route only — avoids refetch loops when merged `recipe` state updates after GET. */
  const focusFetchId = useMemo(
    () =>
      toHexObjectIdString(route.params?.recipeId) ||
      recipeDocumentId(route.params?.recipe, route.params?.recipeId) ||
      "",
    [route.params?.recipeId, route.params?.recipe]
  );

  useEffect(() => {
    checkAvailability();
  }, [recipeId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (recipeRemoved) return undefined;
      const rid = focusFetchId;
      if (!rid) return undefined;

      const fetchRecipe = async () => {
        try {
          const res = await apiClient.get(`/recipes/${rid}`);
          if (isActive && res.data) {
            setRecipe((prev) => {
              const merged = { ...(prev || {}), ...res.data };
              const id = recipeDocumentId(merged, route.params?.recipeId);
              if (id) merged._id = id;
              return merged;
            });
          }
        } catch (err) {
          console.error("Recipe fetch error:", err);
        }
      };
      fetchRecipe();
      return () => {
        isActive = false;
      };
    }, [recipeRemoved, focusFetchId])
  );

  const handleDeleteRecipe = () => {
    const id = recipeDocumentId(recipe, route.params?.recipeId);
    if (!id) {
      Alert.alert("Error", "Could not determine this recipe's id. Go back and open the recipe again.");
      return;
    }
    Alert.alert(
      "Remove recipe",
      `Delete "${recipe.name}"? Scheduled meals for this recipe will be removed from your calendar.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (deleteInFlight.current) return;
            deleteInFlight.current = true;
            try {
              await apiClient.delete(`/recipes/${id}`);
              setRecipeRemoved(true);
              Alert.alert("Removed", "Recipe was deleted.", [
                {
                  text: "OK",
                  onPress: () =>
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: "MainNavBar",
                            state: {
                              routes: [
                                { name: "Pantry" },
                                { name: "Schedule" },
                                { name: "Camera" },
                                { name: "Grocery" },
                                { name: "Recipe" },
                              ],
                              index: 4,
                            },
                          },
                        ],
                      })
                    ),
                },
              ]);
            } catch (err) {
              const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Could not delete recipe.";
              Alert.alert("Error", String(msg));
            } finally {
              deleteInFlight.current = false;
            }
          },
        },
      ]
    );
  };

  const handleAction = async () => {
    if (comparison?.canMake) {
      try {
        setActionBusy(true);
        const result = await cookRecipe();
        if (result.ok) {
          Alert.alert("Enjoy!", "Ingredients were deducted from your pantry.");
        } else {
          Alert.alert("Could not cook", result.message || "Try again.");
        }
      } finally {
        setActionBusy(false);
      }
    } else {
      await addMissingToGrocery();
    }
  };

  if (!recipe) return <Text>No Recipe Data</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>
      {recipe.fullImageUrl && <Image source={{ uri: recipe.fullImageUrl }} style={styles.image} />}
      
      {/* Dynamic Action Button */}
      <View style={styles.actionSection}>
        {loading || actionBusy ? (
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

{/* Instructions Section */}
<Text style={styles.sectionTitle}>Instructions</Text>
{recipe.instructions?.length ? recipe.instructions.map((step, i) => (
  <View key={i} style={styles.stepContainer}>
    <Text style={styles.stepNumber}>{i + 1}</Text>
    <Text style={styles.stepDescription}>{typeof step.description === "string" ? step.description : step.description?.toString?.() || ""}</Text>
  </View>
)) : (
  <Text style={styles.emptyInstructions}>No instructions yet.</Text>
)}

      <TouchableOpacity
        style={[styles.editBtn, styles.planBtn]}
        onPress={() =>
          navigation.navigate("MealPrep", {
            recipeId: recipe._id,
            recipeName: recipe.name,
            ingredients: recipe.ingredients || [],
          })
        }
      >
        <Text style={styles.editText}>📅 Plan this meal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate("EditRecipe", { recipe })}
      >
        <Text style={styles.editText}>Edit Recipe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteRecipe}>
        <Text style={styles.deleteBtnText}>Remove recipe</Text>
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
  planBtn: { backgroundColor: '#E8F5E9', borderRadius: 8, marginTop: 12 },
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
stepContainer: { flexDirection: 'row', marginBottom: 15, paddingRight: 20 },
stepNumber: { fontWeight: 'bold', color: '#4D693A', marginRight: 10 },
stepDescription: { flex: 1, fontSize: 15, lineHeight: 22 },
emptyInstructions: { color: '#999', fontStyle: 'italic', marginVertical: 8 },
  deleteBtn: {
    marginTop: 12,
    marginBottom: 32,
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9534f",
    backgroundColor: "#fff5f5",
  },
  deleteBtnText: { color: "#d9534f", fontWeight: "600", fontSize: 16 },
});
