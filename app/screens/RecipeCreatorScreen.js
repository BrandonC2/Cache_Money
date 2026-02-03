import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";

const foodGroups = ["Protein", "Grain", "Dairy", "Fruit", "Vegetable", "Spice"];

const RecipefoodGroups = [
  "Dessert",
  "Vegan",
  "Lactose-Free",
  "Entree",
  "Appetizer",
  "Gluten-Free",
  "Sauce",
  "Snack",
];

const units = [
  "Cup(s)",
  "Teaspoon(s)",
  "Tablespoon(s)",
  "Gram(s)",
  "Quart(s)",
  "Ounce(s)",
  "Pound(s)",
  "Gallon(s)",
];

export default function RecipeCreatorScreen({ navigation }) {
  const [recipeName, setRecipeName] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [recipeGroup, setRecipeGroup] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  
  // State for the item being currently typed
  const [currentItem, setCurrentItem] = useState({
    name: "",
    description: "",
    foodGroup: "",
    quantity: "",
    unit: "",
  });

  const [error, setError] = useState("");
  const [showRecipeGroupModal, setShowRecipeGroupModal] = useState(false);
  const [showFoodGroupModal, setShowFoodGroupModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false); // FIXED: Added this state
  const [editingIndex, setEditingIndex] = useState(null);


  useEffect(() => {
  const checkUser = async () => {
    const id = await AsyncStorage.getItem("userId");
    console.log("Current UserID in Storage:", id);
    if (!id) {
      setError("Warning: No User ID found. Please log in again.");
    }
  };
  checkUser();
}, []);

  // ===========================
  // IMAGE PICKER
  // ===========================
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Enable photos to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // ===========================
  // ADD / UPDATE INGREDIENT
  // ===========================
  const addOrUpdateIngredient = () => {
    if (!currentItem.name || !currentItem.foodGroup || !currentItem.quantity) {
      setError("Name, Food Group, and Quantity are required.");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...ingredients];
      updated[editingIndex] = currentItem;
      setIngredients(updated);
      setEditingIndex(null);
    } else {
      setIngredients([...ingredients, currentItem]);
    }

    // Reset current item fields
    setCurrentItem({ name: "", description: "", foodGroup: "", quantity: "", unit: "" });
    setError("");
  };

  const editIngredient = (index) => {
    setCurrentItem(ingredients[index]);
    setEditingIndex(index);
    setError("");
  };

  const deleteIngredient = (i) => {
    Alert.alert("Delete?", "Remove this ingredient?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () =>
          setIngredients(ingredients.filter((_, index) => index !== i))
      },
    ]);
  };

  // ===========================
  // SUBMIT RECIPE
  // ===========================
  const submitRecipe = async () => {
  if (!recipeName || ingredients.length === 0) {
    Alert.alert("Error", "Please provide a name and at least one ingredient.");
    return;
  }

  try {
    const userId = await AsyncStorage.getItem("userId");
    
    // We match the backend expectations and the Atlas document structure here
    const form = new FormData();
    form.append("name", recipeName);
    form.append("description", recipeDesc || "");
    
    // Use 'foodGroup' to match your existing Atlas documents
    form.append("foodGroup", recipeGroup || "Other"); 
    
    // Use 'createdBy' so the backend validation passes
    form.append("createdBy", userId); 

    // Formatting ingredients to match the Object structure in your logs
    const formattedIngredients = ingredients.map(ing => ({
      name: ing.name,
      quantity: Number(ing.quantity),
      unit: ing.unit,
      notes: ing.notes || ""
    }));
    
    form.append("ingredients", JSON.stringify(formattedIngredients));

    if (imageUri) {
      form.append("image", {
        uri: imageUri,
        name: `recipe_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    await apiClient.post("/recipes", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Alert.alert("Success", "Recipe created!");
    navigation.goBack();

  } catch (err) {
    console.error("Submission error:", err.response?.data || err.message);
    Alert.alert("Error", "Failed to save recipe.");
  }
};

  return (
    <ImageBackground style={styles.background} source={require("../assets/grid_paper.jpg")}>
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Create Recipe</Text>
          <View style={{ width: 80 }} />
        </View>

        <FlatList
          data={[{ key: "form" }]}
          renderItem={() => (
            <View style={styles.formContainer}>
              {error !== "" && <Text style={styles.errorText}>{error}</Text>}

              <Text style={styles.label}>Recipe Name *</Text>
              <TextInput value={recipeName} onChangeText={setRecipeName} style={styles.input} placeholder="Spaghetti" />
              <Text style={styles.label}>Recipe Category *</Text>
              <TouchableOpacity 
                style={styles.selectorButton} 
                onPress={() => setShowRecipeGroupModal(true)}
              >
                <Text>{recipeGroup || "Select Category (e.g. Vegan, Dessert)"}</Text>
              </TouchableOpacity>
              <Text style={styles.label}>Recipe Notes</Text>
              <TextInput value={recipeDesc} onChangeText={setRecipeDesc} style={styles.input} placeholder="Family recipe" />

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>{imageUri ? "Change Image" : "Upload Image"}</Text>
              </TouchableOpacity>
              {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

              <View style={styles.divider} />

              <Text style={styles.label}>{editingIndex !== null ? "Edit Ingredient" : "Add Ingredient"}</Text>
              <TextInput 
                placeholder="Ingredient Name *" 
                value={currentItem.name} 
                onChangeText={(t) => setCurrentItem({ ...currentItem, name: t })} 
                style={styles.input} 
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.label}>Qty *</Text>
                  <TextInput 
                    placeholder="2" 
                    value={currentItem.quantity} 
                    keyboardType="numeric" 
                    onChangeText={(t) => setCurrentItem({ ...currentItem, quantity: t.replace(/[^0-9.]/g, '') })} 
                    style={styles.input} 
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={styles.label}>Unit</Text>
                  <TouchableOpacity style={styles.selectorButton} onPress={() => setShowUnitModal(true)}>
                    <Text numberOfLines={1}>{currentItem.unit || "Select"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Food Group *</Text>
              <TouchableOpacity style={styles.selectorButton} onPress={() => setShowFoodGroupModal(true)}>
                <Text>{currentItem.foodGroup || "Select Group"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addButton} onPress={addOrUpdateIngredient}>
                <Text style={styles.addButtonText}>{editingIndex !== null ? "Update" : "+ Add to List"}</Text>
              </TouchableOpacity>

              {/* INGREDIENTS LIST DISPLAY */}
              {ingredients.map((item, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item.quantity} {item.unit} {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      {item.foodGroup} {item.description ? `• ${item.description}` : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => editIngredient(index)} style={styles.miniButton}>
                      <Text style={{color: 'blue'}}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteIngredient(index)} style={styles.miniButton}>
                      <Text style={{color: 'red'}}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.submitButton} onPress={submitRecipe}>
                <Text style={styles.submitButtonText}>CREATE RECIPE</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Unit Modal */}
        <Modal visible={showUnitModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Unit</Text>
              {units.map((u) => (
                <TouchableOpacity key={u} style={styles.modalOption} onPress={() => { setCurrentItem({ ...currentItem, unit: u }); setShowUnitModal(false); }}>
                  <Text>{u}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowUnitModal(false)} style={styles.closeBtn}><Text style={{color:'white'}}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Recipe Food Group Modal */}
        <Modal visible={showRecipeGroupModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Recipe Category</Text>
              <FlatList
                data={RecipefoodGroups}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalOption} 
                    onPress={() => {
                      setRecipeGroup(item);
                      setShowRecipeGroupModal(false);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity 
                onPress={() => setShowRecipeGroupModal(false)} 
                style={styles.closeBtn}
              >
                <Text style={{color:'white'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Food Group Modal */}
        <Modal visible={showFoodGroupModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Food Group</Text>
              {foodGroups.map((g) => (
                <TouchableOpacity key={g} style={styles.modalOption} onPress={() => { setCurrentItem({ ...currentItem, foodGroup: g }); setShowFoodGroupModal(false); }}>
                  <Text>{g}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowFoodGroupModal(false)} style={styles.closeBtn}><Text style={{color:'white'}}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  headerBar: { flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  formContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: '#333' },
  input: { backgroundColor: '#fff', height: 45, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, marginBottom: 15 },
  selectorButton: { backgroundColor: '#fff', height: 45, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center', marginBottom: 15 },
  imageButton: { height: 40, backgroundColor: "#666", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  imageButtonText: { color: "white", fontWeight: "600" },
  previewImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 20 },
  addButton: { height: 45, backgroundColor: "#4D693A", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  addButtonText: { color: "white", fontWeight: "bold" },
  submitButton: { height: 55, backgroundColor: "#2e4221", borderRadius: 8, justifyContent: "center", alignItems: "center", marginTop: 30 },
  submitButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  ingredientItem: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  miniButton: { marginLeft: 15 },
  errorText: { color: "red", fontWeight: 'bold', marginBottom: 10 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: "white", padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  closeBtn: { marginTop: 20, backgroundColor: '#333', padding: 15, borderRadius: 8, alignItems: 'center' }
});