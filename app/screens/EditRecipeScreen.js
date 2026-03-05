import React, { useState } from "react";
import { 
  View, TextInput, Button, Image, Alert, StyleSheet, 
  ScrollView, Text, TouchableOpacity, ActivityIndicator 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;

  // --- State ---
  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [foodGroup, setFoodGroup] = useState(recipe.foodGroup || "Other");
  const [ingredients, setIngredients] = useState(recipe.ingredients || []);
  const [instructions, setInstructions] = useState(recipe.instructions || []);
  const [image, setImage] = useState(recipe.fullImageUrl || null);
  const [newMainImage, setNewMainImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Ingredient Input
  const [newIng, setNewIng] = useState({ name: "", quantity: "", unit: "Cup(s)", foodGroup: "Other" });

  // =====================
  // 1. Image Pickers
  // =====================
  const pickImage = async (type, index = null) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (result.canceled) return;
    const uri = result.assets[0].uri;

    if (type === "main") {
      setNewMainImage(uri);
      setImage(uri);
    } else {
      const updatedSteps = [...instructions];
      updatedSteps[index] = { ...updatedSteps[index], image: uri, isNewImage: true };
      setInstructions(updatedSteps);
    }
  };

  // =====================
  // 2. Ingredients Logic
  // =====================
  const addIngredient = () => {
    if (!newIng.name || !newIng.quantity) return Alert.alert("Error", "Required fields missing");
    setIngredients([...ingredients, { ...newIng, quantity: Number(newIng.quantity) }]);
    setNewIng({ name: "", quantity: "", unit: "Cup(s)", foodGroup: "Other" });
  };

  // =====================
  // 3. Instructions Logic
  // =====================
  const addStep = () => setInstructions([...instructions, { description: "", image: "" }]);
  
  const moveStep = (index, direction) => {
    const updated = [...instructions];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setInstructions(updated);
  };

  const updateStepText = (text, index) => {
    const updated = [...instructions];
    updated[index].description = text;
    setInstructions(updated);
  };

  // =====================
  // 4. Save Logic
  // =====================
  const saveChanges = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("foodGroup", foodGroup);
      formData.append("ingredients", JSON.stringify(ingredients));

      // Handle Main Image
      if (newMainImage) {
        formData.append("image", { uri: newMainImage, name: "main.jpg", type: "image/jpeg" });
      }

      // Handle Instructions & Step Images
      const finalInstructions = instructions.map((step, idx) => {
        if (step.isNewImage) {
          // If it's a new local image, append it to formData with a unique key
          formData.append(`stepImage_${idx}`, {
            uri: step.image,
            name: `step_${idx}.jpg`,
            type: "image/jpeg"
          });
          // Set to temporary placeholder so backend knows to look for file
          return { ...step, image: `PENDING_FILE_${idx}` };
        }
        return step;
      });
      formData.append("instructions", JSON.stringify(finalInstructions));

      const res = await apiClient.put(`/recipes/${recipe._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      // Update Local Navigation State
      const updated = res.data.data;
      updated.fullImageUrl = updated.image 
        ? `${apiClient.defaults.baseURL}/uploads/recipes/${updated.image}?t=${Date.now()}` 
        : null;

      navigation.navigate("RecipeDetails", { recipe: updated });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header Info */}
      <Text style={styles.label}>Recipe Title</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      {/* Ingredients List */}
      <Text style={styles.label}>Ingredients</Text>
      {ingredients.map((ing, i) => (
        <View key={i} style={styles.listItem}>
          <Text style={{ flex: 1 }}>{ing.quantity} {ing.unit} {ing.name}</Text>
          <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}>
            <Text style={{ color: 'red' }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.addArea}>
        <TextInput placeholder="Qty" value={newIng.quantity} onChangeText={t => setNewIng({...newIng, quantity: t})} style={[styles.input, { width: 50 }]} keyboardType="numeric" />
        <TextInput placeholder="Name" value={newIng.name} onChangeText={t => setNewIng({...newIng, name: t})} style={[styles.input, { flex: 1, marginHorizontal: 5 }]} />
        <TouchableOpacity style={styles.plusBtn} onPress={addIngredient}><Text style={styles.btnText}>+</Text></TouchableOpacity>
      </View>

      {/* Instructions List */}
      <Text style={styles.label}>Steps</Text>
      {instructions.map((step, i) => (
        <View key={i} style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>Step {i + 1}</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => moveStep(i, 'up')} style={styles.moveBtn}><Text>▲</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => moveStep(i, 'down')} style={styles.moveBtn}><Text>▼</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setInstructions(instructions.filter((_, idx) => idx !== i))} style={styles.moveBtn}><Text style={{color:'red'}}>✕</Text></TouchableOpacity>
            </View>
          </View>
          <TextInput multiline value={step.description} onChangeText={t => updateStepText(t, i)} style={[styles.input, { minHeight: 60 }]} />
          <TouchableOpacity onPress={() => pickImage("step", i)} style={styles.stepImageBtn}>
            {step.image ? <Image source={{ uri: step.image.startsWith('http') ? step.image : step.image }} style={styles.stepImg} /> : <Text>+ Add Photo</Text>}
          </TouchableOpacity>
        </View>
      ))}
      <Button title="Add Step" onPress={addStep} color="#4D693A" />

      <View style={styles.divider} />
      
      {image && <Image source={{ uri: image }} style={styles.mainPreview} />}
      <Button title="Change Main Image" onPress={() => pickImage("main")} />

      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SAVE ALL CHANGES</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2ECD5" },
  label: { fontWeight: 'bold', marginTop: 15, color: '#4D693A', fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: '#fff', marginTop: 5 },
  listItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 5, alignItems: 'center' },
  addArea: { flexDirection: 'row', marginTop: 10 },
  plusBtn: { backgroundColor: '#4D693A', padding: 15, borderRadius: 8, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  stepCard: { backgroundColor: '#E8DCC8', padding: 15, borderRadius: 10, marginTop: 15 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stepTitle: { fontWeight: 'bold' },
  row: { flexDirection: 'row' },
  moveBtn: { marginLeft: 15 },
  stepImageBtn: { height: 100, backgroundColor: '#fff', marginTop: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  stepImg: { width: '100%', height: '100%' },
  mainPreview: { width: '100%', height: 200, borderRadius: 10, marginTop: 20 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 20 },
  saveBtn: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});