import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../lib/apiClient";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ReceiptReviewScreen: Review and edit receipt items before importing to inventory
 * - Display extracted items from OCR
 * - Allow user to edit item names, quantities, and categories
 * - Users can add/remove items
 * - Clicking save uploads to backend and imports to inventory
 */
export default function ReceiptReviewScreen({ route, navigation }) {
  const { photoUri, rawText } = route.params || {};
  // roomName may be passed from Camera or Kitchen screens; if not, read from AsyncStorage (per-user lastRoom)
  const passedRoomName = route.params?.roomName;
  const [roomNameState, setRoomNameState] = useState(passedRoomName || null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({});

  const categories = [
    "Other",
    "Produce",
    "Dairy",
    "Meat",
    "Bakery",
    "Beverages",
    "Pantry",
    "Frozen",
    "Snacks",
  ];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Review Receipt",
      headerBackTitle: "Back",
    });
  }, [navigation]);

  // Resolve room name: prefer route param, then per-user lastRoom, then global lastRoom
  useEffect(() => {
    const resolveRoom = async () => {
      if (passedRoomName && passedRoomName.trim()) {
        setRoomNameState(passedRoomName.trim());
        return;
      }
      try {
        const username = await AsyncStorage.getItem('username');
        let rn = null;
        if (username) rn = await AsyncStorage.getItem(`lastRoom_${username}`);
        if (!rn) rn = await AsyncStorage.getItem('lastRoom');
        if (rn) setRoomNameState(rn);
      } catch (e) {
        console.error('Error resolving roomName in ReceiptReview:', e);
      }
    };
    resolveRoom();
  }, [passedRoomName]);

  // Upload receipt to backend
  useEffect(() => {
    const uploadReceipt = async () => {
      try {
        setLoading(true);
        const response = await apiClient.post("/receipts/upload", {
          imageUri: photoUri || "manual-entry",
          rawText,
        });

        if (response.data.ok) {
          setReceiptId(response.data.receiptId);
          setItems(response.data.items || []);
        }
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Error", "Failed to process receipt: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    uploadReceipt();
  }, [photoUri, rawText]);

  const handleEditStart = (index, item) => {
    setEditingIndex(index);
    setEditValues({
      name: item.name,
      quantity: item.quantity.toString(),
      category: item.category,
    });
  };

  const handleEditSave = (index) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      name: editValues.name,
      quantity: parseInt(editValues.quantity) || 1,
      category: editValues.category,
    };
    setItems(updated);
    setEditingIndex(null);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem = {
      name: "New Item",
      quantity: 1,
      category: "Other",
      originalText: "Manual entry",
    };
    setItems([...items, newItem]);
  };

  const handleSaveReceipt = async () => {
    if (items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    setSaving(true);
    try {
      // Update receipt with edited items (add room name to each item)
      const itemsWithRoom = items.map(item => ({
        ...item,
        room: roomNameState || "Default"
      }));
      
      await apiClient.put(`/receipts/${receiptId}`, { items: itemsWithRoom });

      // Import to inventory
      const importResponse = await apiClient.post(`/receipts/${receiptId}/import`, {
        room: roomNameState || "Default"
      });

      if (importResponse.data.ok) {
        Alert.alert("Success", importResponse.data.message, [
          {
            text: "View Inventory",
            onPress: () => {
              // Navigate to MainNavBar (the tab navigator), which will show Pantry by default
              navigation.navigate("MainNavBar");
            },
          },
        ]);
      }
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Failed to save receipt: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#53B175" />
        <Text style={styles.loadingText}>Processing receipt...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Photo preview */}
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
      )}

      {/* Items list */}
      <ScrollView style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>
          Items Found: {items.length}
        </Text>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              Add items manually or adjust receipt
            </Text>
          </View>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              {editingIndex === index ? (
                // Edit mode
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.editInput}
                    placeholder="Item name"
                    value={editValues.name}
                    onChangeText={(text) =>
                      setEditValues({ ...editValues, name: text })
                    }
                  />
                  <View style={styles.editRow}>
                    <TextInput
                      style={[styles.editInput, { flex: 0.3 }]}
                      placeholder="Qty"
                      keyboardType="number-pad"
                      value={editValues.quantity}
                      onChangeText={(text) =>
                        setEditValues({ ...editValues, quantity: text })
                      }
                    />
                    <View style={styles.categoryPicker}>
                      <Text style={styles.categoryLabel}>
                        {editValues.category}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={[styles.editButton, styles.saveButton]}
                      onPress={() => handleEditSave(index)}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editButton, styles.cancelButton]}
                      onPress={() => setEditingIndex(null)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Display mode
                <View style={styles.itemDisplay}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => handleEditStart(index, item)}
                      style={styles.editIcon}
                    >
                      <Ionicons name="pencil" size={20} color="#53B175" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(index)}
                      style={styles.deleteIcon}
                    >
                      <Ionicons name="trash" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}

        {/* Add item button */}
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={handleAddItem}
        >
          <Ionicons name="add-circle-outline" size={24} color="#53B175" />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveReceipt}
          disabled={saving || items.length === 0}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Save to Inventory</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#999",
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemQty: {
    fontSize: 12,
    color: "#666",
  },
  categoryBadge: {
    backgroundColor: "#e8f0e8ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    color: "#53B175",
    fontWeight: "600",
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
  },
  editIcon: {
    padding: 4,
  },
  deleteIcon: {
    padding: 4,
  },
  editForm: {
    gap: 10,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  categoryPicker: {
    flex: 0.7,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 14,
    color: "#53B175",
    fontWeight: "600",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#53B175",
  },
  cancelButton: {
    backgroundColor: "#ddd",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#53B175",
    borderRadius: 8,
    marginVertical: 16,
    gap: 8,
  },
  addItemText: {
    color: "#53B175",
    fontWeight: "600",
    fontSize: 14,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#53B175",
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#53B175",
    fontWeight: "600",
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#53B175",
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
