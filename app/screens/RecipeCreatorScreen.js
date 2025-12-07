import React, { useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";

const foodTrait = ["Desert", "Vegan", "Lactose-Free", "Entree", "Appetitzer", "Gluten-Free, Sauce, "];

export default function RecipeCreatorScreen({ navigation }) {
  const [recipeName, setRecipeName] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    description: "",
    foodGroup: "",
    //expirationDate: new Date(),
  });
  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showFoodGroupModal, setShowFoodGroupModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  /*// Date picker handler
  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setCurrentItem({ ...currentItem, expirationDate: selectedDate });
    }
  }*/

  // Add or update ingredient
  const addOrUpdateIngredient = () => {
    if (!currentItem.name || !currentItem.foodGroup) {
      setError("Please fill in all required fields for the ingredient.");
      return;
    }

    if (editingIndex !== null) {
      // Update existing ingredient
      const updatedIngredients = [...ingredients];
      updatedIngredients[editingIndex] = currentItem;
      setIngredients(updatedIngredients);
      setEditingIndex(null);
    } else {
      // Add new ingredient
      setIngredients([...ingredients, currentItem]);
    }

    // Reset current item
    setCurrentItem({ name: "", description: "", foodGroup: "", expirationDate: new Date() });
    setError("");
  };

  // Edit an ingredient
  const editIngredient = (index) => {
    setCurrentItem(ingredients[index]);
    setEditingIndex(index);
    setError("");
  };

  // Delete an ingredient
  const deleteIngredient = (index) => {
    Alert.alert(
      "Delete Ingredient",
      "Are you sure you want to delete this ingredient?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedIngredients = ingredients.filter((_, i) => i !== index);
            setIngredients(updatedIngredients);
            // Reset edit mode if deleting currently edited item
            if (editingIndex === index) setEditingIndex(null);
          },
        },
      ]
    );
  };

  // Submit recipe
  const submitRecipe = async () => {
    if (!recipeName.trim()) {
      setError("Please provide a recipe name.");
      return;
    }
    if (ingredients.length === 0) {
      setError("Please add at least one ingredient.");
      return;
    }
    try {
      const username = await AsyncStorage.getItem("username");
      const newRecipe = {
        name: recipeName,
        description: recipeDesc,
        ingredients,
        createdBy: username,
      };
      const res = await apiClient.post("/recipes", newRecipe);
      Alert.alert("Success", res.data.message || "Recipe created!");
      
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create recipe.");
    }
  };

  return (
    <ImageBackground style={styles.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.returnButtonHeader}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.returnButtonHeaderText}>← Return</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Recipe</Text>
          <View style={{ width: 80 }} />
        </View>

        <FlatList
          data={[{ key: "form" }]}
          renderItem={() => (
            <View style={styles.formContainer}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Recipe Name */}
              <Text style={styles.label}>Recipe Name *</Text>
              <TextInput
                placeholder="e.g., Spaghetti w/ Meatballs"
                value={recipeName}
                onChangeText={setRecipeName}
                style={styles.input}
                placeholderTextColor="#999"
              />

              {/* Recipe Description */}
              <Text style={styles.label}>Recipe Notes (Optional)</Text>
              <TextInput
                placeholder="e.g., Family favorite/Very Important"
                value={recipeDesc}
                onChangeText={setRecipeDesc}
                style={styles.input}
                placeholderTextColor="#999"
              />

              {/* Ingredient Section */}
              <Text style={[styles.label, { marginTop: 24 }]}>
                {editingIndex !== null ? "Edit Ingredient" : "Add Ingredient"}
              </Text>
              <TextInput
                placeholder="Ingredient Name *"
                value={currentItem.name}
                onChangeText={(text) =>
                  setCurrentItem({ ...currentItem, name: text })
                }
                style={styles.input}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                placeholder="e.g., Organic, Bulk"
                value={currentItem.description}
                onChangeText={(text) =>
                  setCurrentItem({ ...currentItem, description: text })
                }
                style={styles.input}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Food Group *</Text>
              <TouchableOpacity
                style={styles.foodGroupButton}
                onPress={() => setShowFoodGroupModal(true)}
              >
                <Text style={styles.foodGroupButtonText}>
                  {currentItem.foodGroup || "Select Food Group"}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Expiration Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {currentItem.expirationDate.toDateString()}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={currentItem.expirationDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              <TouchableOpacity
                style={styles.addButton}
                onPress={addOrUpdateIngredient}
              >
                <Text style={styles.addButtonText}>
                  {editingIndex !== null ? "Update Ingredient" : "✓ Add Ingredient"}
                </Text>
              </TouchableOpacity>

              {/* Ingredients List */}
              {ingredients.length > 0 && (
                <>
                  <Text style={[styles.label, { marginTop: 24 }]}>
                    Ingredients List
                  </Text>
                  <FlatList
                    data={ingredients}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.ingredientItem}>
                        <Text style={{ fontWeight: "600" }}>
                          {index + 1}. {item.name}
                        </Text>
                        <Text>{item.foodGroup}</Text>
                        {item.description ? <Text>{item.description}</Text> : null}
                        <Text>{item.expirationDate.toDateString()}</Text>

                        <View style={{ flexDirection: "row", marginTop: 8 }}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => editIngredient(index)}
                          >
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteIngredient(index)}
                          >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </>
              )}

              {/* Submit Recipe Button */}
              <TouchableOpacity
                style={[styles.addButton, { marginTop: 32, backgroundColor: "#4D693A" }]}
                onPress={submitRecipe}
              >
                <Text style={styles.addButtonText}>✓ Create Recipe</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </View>
          )}
          keyExtractor={(item) => item.key}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />

        {/* Food Group Modal */}
        <Modal
          visible={showFoodGroupModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFoodGroupModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Food Group</Text>
              {foodGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.modalOption,
                    currentItem.foodGroup === group && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setCurrentItem({ ...currentItem, foodGroup: group });
                    setError("");
                    setShowFoodGroupModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      currentItem.foodGroup === group && styles.modalOptionTextSelected,
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFoodGroupModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, backgroundColor: "rgba(255, 255, 255, 0.95)" },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 40,
  },
  returnButtonHeader: { padding: 8 },
  returnButtonHeaderText: { fontSize: 16, fontWeight: "600", color: "#007bff" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  formContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
    marginBottom: 12,
  },
  foodGroupButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  foodGroupButtonText: { fontSize: 16, color: "#333" },
  dropdownIcon: { fontSize: 12, color: "#999" },
  dateButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dateButtonText: { fontSize: 16, color: "#333" },
  errorText: { color: "#d81e1e", fontSize: 14, marginBottom: 12, fontWeight: "600" },
  addButton: {
    backgroundColor: "#4D693A",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  ingredientItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 8,
  },
  editButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  editButtonText: { color: "white", fontWeight: "600" },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#d81e1e",
    borderRadius: 6,
  },
  deleteButtonText: { color: "white", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#333" },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalOptionSelected: { backgroundColor: "#e8f0e8" },
  modalOptionText: { fontSize: 16, color: "#666" },
  modalOptionTextSelected: { color: "#4D693A", fontWeight: "600" },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
