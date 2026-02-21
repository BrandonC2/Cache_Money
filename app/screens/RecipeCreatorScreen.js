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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";

const RecipefoodGroups = ["Dessert", "Vegan", "Lactose-Free", "Entree", "Appetizer", "Gluten-Free", "Sauce", "Snack"];
const foodGroups = ["Protein", "Grain", "Dairy", "Fruit", "Vegetable", "Spice"];
const units = ["Cup(s)", "Teaspoon(s)", "Tablespoon(s)", "Gram(s)", "Ounce(s)", "Pound(s)"];

export default function RecipeCreatorScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [recipeName, setRecipeName] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [recipeGroup, setRecipeGroup] = useState("");
  const [mainImageUri, setMainImageUri] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const [showRecipeGroupModal, setShowRecipeGroupModal] = useState(false);
  const [showFoodGroupModal, setShowFoodGroupModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  
  const [ingredientEditingIndex, setIngredientEditingIndex] = useState(null);
  const [instructionEditingIndex, setInstructionEditingIndex] = useState(null);

  const [currentItem, setCurrentItem] = useState({ name: "", foodGroup: "", quantity: "", unit: "" });
  const [currentInstruction, setCurrentInstruction] = useState({ description: "", imageUri: null });

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.6 });
    if (!result.canceled) {
      if (type === "main") setMainImageUri(result.assets[0].uri);
      if (type === "step") setCurrentInstruction({ ...currentInstruction, imageUri: result.assets[0].uri });
    }
  };

  const addOrUpdateIngredient = () => {
    if (!currentItem.name || !currentItem.foodGroup || !currentItem.quantity) {
      Alert.alert("Error", "Name, Quantity, and Food Group are required.");
      return;
    }
    if (ingredientEditingIndex !== null) {
      const updated = [...ingredients];
      updated[ingredientEditingIndex] = currentItem;
      setIngredients(updated);
      setIngredientEditingIndex(null);
    } else {
      setIngredients([...ingredients, currentItem]);
    }
    setCurrentItem({ name: "", foodGroup: "", quantity: "", unit: "" });
  };

  const deleteIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addOrUpdateInstruction = () => {
    if (!currentInstruction.description) return;
    if (instructionEditingIndex !== null) {
      const updated = [...instructions];
      updated[instructionEditingIndex] = currentInstruction;
      setInstructions(updated);
      setInstructionEditingIndex(null);
    } else {
      setInstructions([...instructions, currentInstruction]);
    }
    setCurrentInstruction({ description: "", imageUri: null });
    setShowInstructionModal(false);
  };

  const moveInstruction = (index, direction) => {
    const newInstructions = [...instructions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newInstructions.length) return;
    [newInstructions[index], newInstructions[targetIndex]] = [newInstructions[targetIndex], newInstructions[index]];
    setInstructions(newInstructions);
  };

const submitRecipe = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const form = new FormData();
    
    form.append("name", recipeName);
    form.append("description", recipeDesc);
    form.append("foodGroup", recipeGroup || "Other");
    form.append("createdBy", userId);

    // FIX 1: Ensure ingredients are a clean JSON string
    form.append("ingredients", JSON.stringify(ingredients));

    // FIX 2: Ensure instructions are mapped correctly AND stringified
    // This ensures MongoDB receives a valid array of objects
    const formattedInstructions = instructions.map((step) => ({
      description: step.description,
      imageUri: step.imageUri || "" // If your backend handles step images, keep this
    }));
    
    form.append("instructions", JSON.stringify(formattedInstructions));

    // FIX 3: Main Image
    if (mainImageUri) {
      form.append("image", { 
        uri: mainImageUri, 
        name: "main_recipe.jpg", 
        type: "image/jpeg" 
      });
    }

    // Use your IP address here if apiClient isn't updated!
    await apiClient.post("/recipes", form, { 
      headers: { "Content-Type": "multipart/form-data" } 
    });

    Alert.alert("Success", "Recipe saved to MongoDB!");
    navigation.goBack();
  } catch (err) {
    console.error("Upload Error:", err);
    Alert.alert("Error", "Failed to save recipe. Check console for Network Error.");
  }
};

  return (
    <ImageBackground style={styles.background} source={require("../assets/grid_paper.jpg")}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>New Recipe</Text>
          <TouchableOpacity onPress={submitRecipe}>
            <Text style={styles.saveHeaderBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={[{ key: "form" }]}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={() => (
            <View>
              {/* RECIPE META */}
              <TextInput 
                placeholder="Recipe Title" 
                style={styles.mainTitleInput} 
                value={recipeName} 
                onChangeText={setRecipeName} 
              />

              <TouchableOpacity style={styles.selector} onPress={() => setShowRecipeGroupModal(true)}>
                <Text style={{ color: recipeGroup ? '#000' : '#888' }}>
                  {recipeGroup || "📂 Select Recipe Category"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mainImageContainer} onPress={() => pickImage("main")}>
                {mainImageUri ? (
                  <Image source={{ uri: mainImageUri }} style={styles.fullImage} />
                ) : (
                  <Text style={{ color: "#666" }}>+ Add Cover Photo</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* INGREDIENT BUILDER */}
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientInputRow}>
                <TextInput 
                  placeholder="Name" 
                  value={currentItem.name} 
                  onChangeText={(t) => setCurrentItem({...currentItem, name: t})} 
                  style={[styles.smallInput, { flex: 2 }]} 
                />
                <TextInput 
                  placeholder="Qty" 
                  keyboardType="numeric"
                  value={currentItem.quantity} 
                  onChangeText={(t) => setCurrentItem({...currentItem, quantity: t})} 
                  style={[styles.smallInput, { flex: 1, marginHorizontal: 5 }]} 
                />
              </View>
              
              <View style={styles.ingredientInputRow}>
                <TouchableOpacity style={[styles.selector, { flex: 1, marginBottom: 0, marginRight: 5 }]} onPress={() => setShowUnitModal(true)}>
                  <Text numberOfLines={1}>{currentItem.unit || "Unit"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.selector, { flex: 1, marginBottom: 0 }]} onPress={() => setShowFoodGroupModal(true)}>
                  <Text numberOfLines={1}>{currentItem.foodGroup || "Group"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniAddBtn} onPress={addOrUpdateIngredient}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </View>

              {/* INGREDIENT LIST */}
              {ingredients.map((item, idx) => (
                <View key={idx} style={styles.ingredientChip}>
                  <Text style={{ flex: 1 }}>{item.quantity} {item.unit} {item.name} ({item.foodGroup})</Text>
                  <TouchableOpacity onPress={() => deleteIngredient(idx)}><Text style={{ color: 'red' }}>✕</Text></TouchableOpacity>
                </View>
              ))}

              <View style={styles.divider} />

              {/* INSTRUCTIONS */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <TouchableOpacity style={styles.addStepTrigger} onPress={() => setShowInstructionModal(true)}>
                  <Text style={styles.addStepTriggerText}>+ Add Step</Text>
                </TouchableOpacity>
              </View>

              {instructions.map((item, idx) => (
                <View key={idx} style={styles.stepCard}>
                  <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>{idx + 1}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepDescText}>{item.description}</Text>
                    {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.stepImageSmall} />}
                  </View>
                  <View style={styles.reorderArrows}>
                    <TouchableOpacity onPress={() => moveInstruction(idx, 'up')} disabled={idx === 0}><Text style={[styles.arrow, idx === 0 && { opacity: 0.2 }]}>▲</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => moveInstruction(idx, 'down')} disabled={idx === instructions.length - 1}><Text style={[styles.arrow, idx === instructions.length - 1 && { opacity: 0.2 }]}>▼</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        />

        {/* --- MODALS --- */}
        {/* Recipe Group Modal */}
        <Modal visible={showRecipeGroupModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Category</Text>
              {RecipefoodGroups.map(g => (
                <TouchableOpacity key={g} style={styles.modalOption} onPress={() => { setRecipeGroup(g); setShowRecipeGroupModal(false); }}>
                  <Text>{g}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowRecipeGroupModal(false)} style={styles.cancelBtn}><Text>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Unit Modal */}
        <Modal visible={showUnitModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Unit</Text>
              {units.map(u => (
                <TouchableOpacity key={u} style={styles.modalOption} onPress={() => { setCurrentItem({...currentItem, unit: u}); setShowUnitModal(false); }}>
                  <Text>{u}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowUnitModal(false)} style={styles.cancelBtn}><Text>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Food Group Modal */}
        <Modal visible={showFoodGroupModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Food Group</Text>
              {foodGroups.map(f => (
                <TouchableOpacity key={f} style={styles.modalOption} onPress={() => { setCurrentItem({...currentItem, foodGroup: f}); setShowFoodGroupModal(false); }}>
                  <Text>{f}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowFoodGroupModal(false)} style={styles.cancelBtn}><Text>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Instruction Modal (Your Smooth Version) */}
        <Modal visible={showInstructionModal} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%' }}>
                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <TextInput
                      placeholder="What's the next step?"
                      multiline maxLength={300}
                      style={styles.modalTextArea}
                      value={currentInstruction.description}
                      onChangeText={(t) => setCurrentInstruction({...currentInstruction, description: t})}
                    />
                    <TouchableOpacity style={styles.modalImagePicker} onPress={() => pickImage("step")}>
                      {currentInstruction.imageUri ? <Image source={{ uri: currentInstruction.imageUri }} style={styles.fullImage} /> : <Text>📸 Add Step Photo</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveStepBtn} onPress={addOrUpdateInstruction}><Text style={styles.saveStepBtnText}>Save Step</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowInstructionModal(false)}><Text>Cancel</Text></TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E4221' },
  saveHeaderBtn: { color: '#4D693A', fontWeight: 'bold', fontSize: 16 },
  mainTitleInput: { fontSize: 28, fontWeight: 'bold', color: '#2E4221', marginBottom: 10 },
  selector: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', marginBottom: 15 },
  mainImageContainer: { height: 180, backgroundColor: '#E0E0E0', borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  divider: { height: 1, backgroundColor: '#CCC', marginVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4D693A' },
  ingredientInputRow: { flexDirection: 'row', marginBottom: 8 },
  smallInput: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD' },
  miniAddBtn: { backgroundColor: '#4D693A', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
  ingredientChip: { flexDirection: 'row', backgroundColor: '#FFF', padding: 10, borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#EEE' },
  stepCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  stepNumberCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4D693A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumberText: { color: '#FFF', fontWeight: 'bold' },
  stepDescText: { fontSize: 14, color: '#333' },
  stepImageSmall: { width: '100%', height: 100, borderRadius: 8, marginTop: 10 },
  reorderArrows: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#EEE', marginLeft: 10 },
  arrow: { fontSize: 18, color: '#4D693A' },
  addStepTrigger: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addStepTriggerText: { color: '#4D693A', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalTextArea: { height: 100, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 15, textAlignVertical: 'top' },
  modalImagePicker: { height: 120, backgroundColor: '#F0F0F0', borderRadius: 12, marginVertical: 15, justifyContent: 'center', alignItems: 'center' },
  saveStepBtn: { backgroundColor: '#4D693A', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveStepBtnText: { color: '#FFF', fontWeight: 'bold' },
  cancelBtn: { marginTop: 15, alignItems: 'center' }
});