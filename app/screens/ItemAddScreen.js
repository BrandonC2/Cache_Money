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
  Platform,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";

export default function AddScreen({ navigation }) {
  const [itemName, setItem] = useState("");
  const [foodGroup, setFg] = useState("");
  const [expireDate, setExpire] = useState(new Date());
  const [description, setDesc] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showFoodGroupModal, setShowFoodGroupModal] = useState(false);
  const [error, setError] = useState("");

  const foodGroups = ["Protein", "Grain", "Dairy", "Fruit", "Vegetable", "Spice"];

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
    // Prefer per-user lastRoom key, fallback to global lastRoom for compatibility
    let roomName = null;
    if (username) {
      roomName = await AsyncStorage.getItem(`lastRoom_${username}`);
    }
    if (!roomName) {
      roomName = await AsyncStorage.getItem("lastRoom");
    }

    console.log(`📦 ItemAddScreen.addItem()`);
    console.log(`   username: ${username}`);
    console.log(`   roomName from AsyncStorage: "${roomName}"`);

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

    console.log(`   POST body: ${JSON.stringify(newItem)}`);

  // Use centralized apiClient which attaches the auth token and already
  // has the '/api' prefix. POST to '/inventory' which maps to backend
  // router POST '/'
  const res = await apiClient.post(`/inventory`, newItem);
  Alert.alert("Success", res.data.message || "Item added successfully!");

    // Reset form fields
    setItem("");
    setFg("");
    setDesc("");
    setExpire(new Date());

  // Return to previous screen (safer than navigating by name)
  navigation.goBack();
  } catch (err) {
    console.error("Add item error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Failed to add item.");
  }
};


  return (
    <ImageBackground style={styles.background}>
      <View style={styles.container}>
        {/* Header with Return button */}
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Add Food Item</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Form Content */}
        <FlatList
          data={[{ key: "form" }]}
          renderItem={() => (
            <View style={styles.formContainer}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/Just_Icon.png")}
                  style={styles.logo}
                />
              </View>

              {/* Error message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Item Name */}
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                placeholder="e.g., Milk, Chicken Breast"
                value={itemName}
                onChangeText={setItem}
                style={styles.input}
                placeholderTextColor="#999"
              />

              {/* Description */}
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                placeholder="e.g., Organic, Bulk buy"
                value={description}
                onChangeText={setDesc}
                style={styles.input}
                placeholderTextColor="#999"
              />

              {/* Food Group */}
              <Text style={styles.label}>Food Group *</Text>
              <TouchableOpacity
                style={styles.foodGroupButton}
                onPress={() => setShowFoodGroupModal(true)}
              >
                <Text style={styles.foodGroupButtonText}>
                  {foodGroup || "Select Food Group"}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>

              {/* Expiration Date */}
              <Text style={styles.label}>Expiration Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {expireDate.toDateString()}
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

              {/* Add Item Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={addItem}
              >
                <Text style={styles.addButtonText}>✓ Add Item</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
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
                    foodGroup === group && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setFg(group);
                    setError("");
                    setShowFoodGroupModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      foodGroup === group && styles.modalOptionTextSelected,
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
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "transparent",
    marginTop: 8,
  },
  returnButtonHeader: {
    padding: 8,
  },
  returnButtonHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
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
  },
  foodGroupButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#999",
  },
  dateButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#d81e1e",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4D693A",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionSelected: {
    backgroundColor: "#e8f0e8",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#666",
  },
  modalOptionTextSelected: {
    color: "#4D693A",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
