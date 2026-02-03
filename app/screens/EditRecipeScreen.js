import React, { useState } from "react";
import { View, TextInput, Button, Image, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;

  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [image, setImage] = useState(recipe.fullImageUrl || null); // current image
  const [newImage, setNewImage] = useState(null); // local picked image

  // =====================
  // Pick image from library
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

      // iOS fix: ph:// URIs
      if (localUri.startsWith("ph://")) {
        const assetInfo = await FileSystem.getInfoAsync(localUri);
        const tempUri = `${FileSystem.cacheDirectory}recipe_${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: localUri, to: tempUri });
        localUri = tempUri;
      }

      setNewImage(localUri);
      setImage(localUri);
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // =====================
  // Save recipe changes
  // =====================
  const saveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return Alert.alert("Not authorized");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("ingredients", JSON.stringify(recipe.ingredients));

      // Only append if a new image was picked
      if (newImage) {
        const uriParts = newImage.split("/");
        const fileName = uriParts[uriParts.length - 1];
        formData.append("image", {
          uri: newImage,
          name: `recipe_${Date.now()}_${fileName}`,
          type: "image/jpeg",
        });
      }

      const res = await apiClient.put(`/recipes/${recipe._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Update response:", res.data);

      // Build full public URL
      const updatedRecipe = res.data.data;
      updatedRecipe.fullImageUrl = updatedRecipe.image
        ? `${apiClient.defaults.baseURL}/uploads/recipes/${updatedRecipe.image}?t=${Date.now()}`
        : null;

      // Navigate back to details screen with updated recipe
      navigation.navigate("RecipeDetails", { recipe: updatedRecipe });
    } catch (err) {
      console.error("Failed to update recipe:", err);
      Alert.alert("Error", "Failed to save recipe changes");
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
      <Button title="Change Image" onPress={handlePickImage} />

      <Button title="Save Changes" onPress={saveChanges} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F2ECD5" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 12,
    borderRadius: 10,
  },
});
