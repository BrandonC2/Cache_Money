import React, { useState } from "react";
import { 
  View, TextInput, Button, Image, Alert, StyleSheet, 
  ScrollView, Text, TouchableOpacity 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;

  // --- State Management ---
  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [ingredients, setIngredients] = useState(recipe.ingredients || []);
  const [instructions, setInstructions] = useState(recipe.instructions || []);
  
  // Image State
  const [image, setImage] = useState(recipe.fullImageUrl || null); 
  const [newImage, setNewImage] = useState(null); 

  // New Ingredient Input State
  const [newIng, setNewIng] = useState({ name: "", quantity: "", unit: "Cup(s)", foodGroup: "Protein" });

  // =====================
  // 1. Image Handling
  // =====================
  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert("Permission required", "Please allow access to your photos");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      let localUri = result.assets[0].uri;

      // iOS fix for ph:// URIs
      if (localUri.startsWith("ph://")) {
        const tempUri = `${FileSystem.cacheDirectory}recipe_${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: localUri, to: tempUri });
        localUri = tempUri;
      }

      setNewImage(localUri);
      setImage(localUri);
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // =====================
  // 2. Array Logic (Ingredients & Steps)
  // =====================
  const addIngredient = () => {
    if (!newIng.name || !newIng.quantity) return Alert.alert("Error", "Enter name and quantity");
    setIngredients([...ingredients, newIng]);
    setNewIng({ name: "", quantity: "", unit: "Cup(s)", foodGroup: "Protein" });
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateInstruction = (text, index) => {
    const updated = [...instructions];
    updated[index].description = text;
    setInstructions(updated);
  };

  const addStep = () => {
    setInstructions([...instructions, { description: "", imageUri: "" }]);
  };

  const removeStep = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  // =====================
  // 3. API Save Logic
  // =====================
  const saveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();
      
      formData.append("name", name);
      formData.append("description", description);
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("instructions", JSON.stringify(instructions));

      if (newImage) {
        formData.append("image", {
          uri: newImage,
          name: `recipe_update_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }

      const res = await apiClient.put(`/recipes/${recipe._id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        },
      });

      const updatedRecipe = res.data.data;
      // Re-attach the base URL for the image so the details screen can see it
      updatedRecipe.fullImageUrl = updatedRecipe.image
        ? `${apiClient.defaults.baseURL}/uploads/recipes/${updatedRecipe.image}?t=${Date.now()}`
        : null;

      navigation.navigate("RecipeDetails", { recipe: updatedRecipe });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save changes.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Recipe Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Ingredients</Text>
      {ingredients.map((item, idx) => (
        <View key={idx} style={styles.rowItem}>
          <Text style={{ flex: 1 }}>{item.quantity} {item.unit} {item.name}</Text>
          <TouchableOpacity onPress={() => removeIngredient(idx)}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Inline Adder */}
      <View style={styles.addArea}>
        <TextInput 
          placeholder="Qty" 
          value={newIng.quantity} 
          onChangeText={(t) => setNewIng({...newIng, quantity: t})} 
          style={[styles.input, { width: 60, marginRight: 5 }]} 
        />
        <TextInput 
          placeholder="New Ingredient..." 
          value={newIng.name} 
          onChangeText={(t) => setNewIng({...newIng, name: t})} 
          style={[styles.input, { flex: 1 }]} 
        />
        <TouchableOpacity style={styles.plusBtn} onPress={addIngredient}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Instructions</Text>
      {instructions.map((step, idx) => (
        <View key={idx} style={styles.stepRow}>
          <View style={styles.stepNum}><Text style={{color: '#fff'}}>{idx + 1}</Text></View>
          <TextInput
            value={step.description}
            onChangeText={(text) => updateInstruction(text, idx)}
            multiline
            style={[styles.input, { flex: 1, minHeight: 60 }]}
          />
          <TouchableOpacity onPress={() => removeStep(idx)} style={{ marginLeft: 10 }}>
            <Text style={{ color: 'red' }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Button title="+ Add Step" onPress={addStep} color="#4D693A" />

      <View style={styles.divider} />

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}
      <Button title="Change Main Photo" onPress={handlePickImage} />

      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
        <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2ECD5" },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#4D693A', fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: '#fff' },
  rowItem: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 5, alignItems: 'center' },
  addArea: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  plusBtn: { backgroundColor: '#4D693A', padding: 15, borderRadius: 8, marginLeft: 5 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  stepNum: { backgroundColor: '#4D693A', width: 25, height: 25, borderRadius: 12.5, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 10 },
  previewImage: { width: "100%", height: 200, borderRadius: 10, marginVertical: 15 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 25 },
  saveBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});