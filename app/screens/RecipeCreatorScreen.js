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

import * as ImagePicker from "expo-image-picker";
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";
import { Calendar } from 'react-native-calendars';

const foodGroups = [
  "Dessert",
  "Vegan",
  "Lactose-Free",
  "Entree",
  "Appetizer",
  "Gluten-Free",
  "Sauce",
  "Snack",
];

export default function RecipeCreatorScreen({ navigation }) {
  const [expireDate, setExpire] = useState(new Date());
  const [recipeName, setRecipeName] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const [ingredients, setIngredients] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    description: "",
    foodGroup: "",
    expirationDate: new Date(),
  });

  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showFoodGroupModal, setShowFoodGroupModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // IMAGE UPLOAD HANDLER
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

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // DATE PICKER
  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setCurrentItem({ ...currentItem, expirationDate: selectedDate });
    }
  };

  // ADD OR UPDATE INGREDIENT
  const addOrUpdateIngredient = () => {
    if (!currentItem.name || !currentItem.foodGroup) {
      setError("Please fill in all required ingredient fields.");
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

    setCurrentItem({
      name: "",
      description: "",
      foodGroup: "",
      expirationDate: new Date(),
    });

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
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setIngredients(ingredients.filter((_, index) => index !== i)),
      },
    ]);
  };

  // SUBMIT RECIPE
  const submitRecipe = async () => {
    if (!recipeName.trim())
      return setError("Please provide a recipe name.");

    if (ingredients.length === 0)
      return setError("Add at least one ingredient.");

    try {
      const username = await AsyncStorage.getItem("username");

      const form = new FormData();
      form.append("name", recipeName);
      form.append("description", recipeDesc);
      form.append("createdBy", username);
      form.append("ingredients", JSON.stringify(ingredients));

      if (imageUri) {
        form.append("image", {
          uri: imageUri,
          name: "recipe.jpg",
          type: "image/jpeg",
        });
      }

      const res = await apiClient.post("/recipes", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", res.data.message || "Recipe created!");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to create recipe.");
    }
  };

  return (
    <ImageBackground 
            style={styles.background}
            source={require("../assets/grid_paper.jpg")}
          >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBar}>
            <CustomBackButton onPress={() => navigation.goBack()} />
         
        
          <Text style={styles.headerTitle}>Create Recipe</Text>
          <View style={{ width: 80 }} />
        </View>

        <FlatList
          data={[{ key: "form" }]}
          renderItem={() => (
            <View style={styles.formContainer}>
              {error !== "" && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Recipe Name */}
              <Text style={styles.label}>Recipe Name *</Text>
              <TextInput
                placeholder="e.g., Spaghetti"
                value={recipeName}
                onChangeText={setRecipeName}
                style={styles.input}
              />

              {/* Description */}
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                placeholder="e.g., Family favorite"
                value={recipeDesc}
                onChangeText={setRecipeDesc}
                style={styles.input}
              />

              {/* IMAGE UPLOAD */}
              <Text style={styles.label}>Recipe Image (Optional)</Text>

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>
                  {imageUri ? "Change Image" : "Upload Image"}
                </Text>
              </TouchableOpacity>

              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                />
              )}

              {/* Ingredient Section */}
              <Text style={[styles.label, { marginTop: 24 }]}>
                {editingIndex !== null ? "Edit Ingredient" : "Add Ingredient"}
              </Text>

              {/* Name */}
              <TextInput
                placeholder="Ingredient Name *"
                value={currentItem.name}
                onChangeText={(t) =>
                  setCurrentItem({ ...currentItem, name: t })
                }
                style={styles.input}
              />

              {/* Notes */}
              <Text style={styles.label}>Notes</Text>
              <TextInput
                placeholder="Optional notes"
                value={currentItem.description}
                onChangeText={(t) =>
                  setCurrentItem({ ...currentItem, description: t })
                }
                style={styles.input}
              />

              {/* Food Group */}
              <Text style={styles.label}>Food Group *</Text>
              <TouchableOpacity
                style={styles.foodGroupButton}
                onPress={() => setShowFoodGroupModal(true)}
              >
                <Text>
                  {currentItem.foodGroup || "Select Food Group"}
                </Text>
                <Text>▼</Text>
              </TouchableOpacity>

              {/* Expiration Date */}
              <Text style={styles.label}>Expiration Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}
              >
                <Text>
                  📅 {currentItem.expirationDate.toDateString()}
                </Text>
              </TouchableOpacity>

            <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Expiration Date</Text>
            
            <Calendar
          
              current={expireDate.toISOString().split('T')[0]}
          
              onDayPress={(day) => {
               
                const newDate = new Date(day.year, day.month - 1, day.day);
                setExpire(newDate);
                setShowPicker(false); 
              }}
              
              
              markedDates={{
                [expireDate.toISOString().split('T')[0]]: {
                  selected: true, 
                  selectedColor: '#4D693A',
                  selectedTextColor: 'white'
                }
              }}

            
              theme={{
                calendarBackground: 'transparent', 
                
              
                backgroundColor: 'transparent',

            
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#4D693A', 
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#4D693A',
                dayTextColor: '#2d4150',
                arrowColor: '#4D693A',
                monthTextColor: '#4D693A',             
              }}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
              

              <TouchableOpacity
                style={styles.addButton}
                onPress={addOrUpdateIngredient}
              >
                <Text style={styles.addButtonText}>
                  {editingIndex !== null
                    ? "Update Ingredient"
                    : "✓ Add Ingredient"}
                </Text>
              </TouchableOpacity>

              {/* Ingredient List */}
              {ingredients.length > 0 && (
                <>
                  <Text style={[styles.label, { marginTop: 24 }]}>
                    Ingredients List
                  </Text>

                  <FlatList
                    data={ingredients}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.ingredientItem}>
                        <Text style={{ fontWeight: "600" }}>
                          {index + 1}. {item.name}
                        </Text>
                        <Text>{item.foodGroup}</Text>
                        {item.description !== "" && (
                          <Text>{item.description}</Text>
                        )}
                        <Text>
                          {item.expirationDate.toDateString()}
                        </Text>

                        <View style={{ flexDirection: "row", marginTop: 6 }}>
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
                            <Text style={styles.deleteButtonText}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#4D693A" }]}
                onPress={submitRecipe}
              >
                <Text style={styles.addButtonText}>✓ Create Recipe</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Food Group Modal */}
        <Modal
          visible={showFoodGroupModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFoodGroupModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Food Group</Text>

              {foodGroups.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.modalOption}
                  onPress={() => {
                    setCurrentItem({ ...currentItem, foodGroup: g });
                    setShowFoodGroupModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{g}</Text>
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
  container: { flex: 1, backgroundColor: "transparent" },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "transparent",
    marginTop: 40,
  },
  returnButtonHeaderText: { fontSize: 16, color: "#007bff" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  formContainer: { paddingHorizontal: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: '#e8d5c460',
    height: 50,
    borderWidth: 1,
    borderColor: "#c2b9b2ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  imageButton: {
    height: 50,
    backgroundColor: "#4D693A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  imageButtonText: { color: "white", fontWeight: "600" },

  foodGroupButton: {
    backgroundColor: '#e8d5c460',
    height: 50,
    borderWidth: 1,
    borderColor: "#c2b9b2ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#e8d5c460',
    height: 50,
    borderWidth: 1,
    borderColor: "#c2b9b2ff",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  addButton: {

    height: 50,
    backgroundColor: "#4D693A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  addButtonText: { color: "white", fontWeight: "600", fontSize: 16 },

  ingredientItem: {
    
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  editButtonText: { color: "white" },

  deleteButton: {
    backgroundColor: "#d81e1e",
    padding: 6,
    borderRadius: 6,
  },
  deleteButtonText: { color: "white" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  modalContent: {
    backgroundColor: "#fcfaf2ff",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCloseButton: {
    backgroundColor: "#4D693A",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  modalCloseButtonText: { color: "white", fontSize: 16, textAlign: "center" },
});
