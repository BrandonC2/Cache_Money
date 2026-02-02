import React, { useState } from "react";
import { View, TextInput, Button, Image, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import apiClient from "../lib/apiClient";

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;

  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [image, setImage] = useState(recipe.fullImageUrl); // initial URL
  const [newImage, setNewImage] = useState(null); // local picked image
  useEffect(() => {
  const fetchRecipe = async () => {
    const res = await apiClient.get(`/recipes/${recipe._id}`);
    setRecipe(res.data);
  };
  fetchRecipe();
}, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
      setImage(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("ingredients", JSON.stringify(recipe.ingredients));

    // Only append if a new image was picked
    if (newImage) {
      let uriParts = newImage.split("/");
      let fileName = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: newImage,
        name: `recipe_${Date.now()}_${fileName}`,
        type: "image/jpeg",
      });
    }

    try {
      const res = await apiClient.put(`/recipes/${recipe._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Construct full URL for the updated image
      const updatedRecipe = res.data.data;
      updatedRecipe.fullImageUrl = updatedRecipe.image
        ? `${apiClient.defaults.baseURL}/uploads/recipes/${updatedRecipe.image}`
        : null;

      // Pass updated recipe back to details screen
      navigation.navigate("RecipeDetails", { recipe: updatedRecipe });
    } catch (err) {
      console.error("Failed to update recipe:", err);
      Alert.alert("Error", "Failed to save recipe changes.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Recipe Name"
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        style={[styles.input, { height: 100 }]}
      />

      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Change Image" onPress={pickImage} />

      <Button title="Save Changes" onPress={saveChanges} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2ECD5" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 12, borderRadius: 8 },
  image: { width: "100%", height: 200, marginBottom: 12, borderRadius: 10 },
});
