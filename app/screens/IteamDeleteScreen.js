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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE from "../config/api";

export default function AddScreen({ navigation }) {
  const [itemName, setItem] = useState("");
  const [foodGroup, setFg] = useState("");
  const [expireDate, setExpire] = useState(new Date());
  const [description, setDesc] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");

  // Show Date Picker
  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setExpire(selectedDate);
  };

  // Add item function
  const addItem = async () => {
  if (!itemName || !foodGroup) {
    setError("Please fill in all required fields.");
    return;
  }

  try {
    const username = await AsyncStorage.getItem("username");
    const roomName = await AsyncStorage.getItem("lastRoom");

    if (!username || !roomName) {
      Alert.alert("Error", "Missing username or room context.");
      return;
    }

    const newItem = {
      name: itemName,
      description,
      foodGroup,
      expirationDate: expireDate,
      room: roomName,     // ✅ include room
      addedBy: username,  // ✅ include user
    };

    const res = await axios.post(`${API_BASE}/api/inventory/add`, newItem);
    Alert.alert("Success", res.data.message || "Item added successfully!");

    // Reset form fields
    setItem("");
    setFg("");
    setDesc("");
    setExpire(new Date());

    // Return to Kitchen page
    navigation.navigate("KitchenCollection", { roomName, username });
  } catch (err) {
    console.error("Add item error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Failed to add item.");
  }
};


  return (
    <ImageBackground style={styles.background}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/Just_Icon.png")} style={styles.logo} />
      </View>

      <View style={styles.infoContainer}>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

        <TextInput
          placeholder="Item Name"
          value={itemName}
          onChangeText={setItem}
          style={styles.input}
        />

        <TextInput
          placeholder="Notes (Optional)"
          value={description}
          onChangeText={setDesc}
          style={styles.input}
        />

        <Text style={{ marginBottom: 10, fontSize: 18 }}>Choose a Food Group:</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}>
                  <View style={{ 
          borderWidth: 1, 
          borderColor: "#ccc", 
          borderRadius: 8, 
          width: 350, 
          marginTop: 10,
          backgroundColor: "white", 
          overflow: "visible", // 👈 important
        }}>
          <Picker
            style={{ height: 60 }} // 👈 ensures visible dropdown area
            selectedValue={foodGroup}
            onValueChange={(itemValue) => {
              setFg(itemValue);
              setError(""); // clear error when user picks
            }}
          >
            <Picker.Item label="Select Food Group" value="" color="#999" />
            <Picker.Item label="Protein" value="Protein" />
            <Picker.Item label="Grain" value="Grain" />
            <Picker.Item label="Dairy" value="Dairy" />
            <Picker.Item label="Fruit" value="Fruit" />
            <Picker.Item label="Vegetable" value="Vegetable" />
            <Picker.Item label="Spice" value="Spice" />
          </Picker>
        </View>

        </View>

        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={{ fontSize: 16, marginTop: 20 }}>
            Expiration Date: {expireDate.toDateString()}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={expireDate}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={{ fontSize: 18, color: "white" }}>Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("KitchenCollection")}
        >
          <Text style={{ fontSize: 18, color: "white" }}>Return</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, alignItems: "center" },
  logoContainer: { marginTop: 10, alignItems: "center" },
  logo: { width: 200, height: 200 },
  infoContainer: { alignItems: "center", marginTop: 10 },
  input: {
    height: 60,
    width: 350,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#4D693A",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    width: 200,
  },
  backButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    width: 200,
  },
});
