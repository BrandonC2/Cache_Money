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
  Modal,
  Pressable,
  Platform,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import apiClient from "../lib/apiClient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomBackButton from "../components/CustomBackButton";

/**
 * ReceiptReviewScreen: Review and edit receipt items before importing to inventory
 * - Display extracted items from OCR
 * - Allow user to edit item names, quantities, and categories
 * - Users can add/remove items
 * - Clicking save uploads to backend and imports to inventory
 */
export default function ReceiptReviewScreen({ route, navigation }) {
  const { photoUri, rawText } = route.params || {};
  const [roomNameState, setRoomNameState] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [availableKitchens, setAvailableKitchens] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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
      headerLeft: () => (
        <CustomBackButton onPress={() => navigation.goBack()} />
      ),
    });
  }, [navigation]);

  // Load available kitchens from AsyncStorage
  useEffect(() => {
    const loadKitchens = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        if (username) {
          const roomsStr = await AsyncStorage.getItem(`visitedRooms_${username}`);
          if (roomsStr) {
            const rooms = JSON.parse(roomsStr);
            const kitchenNames = rooms.map(r => r.name);
            setAvailableKitchens(kitchenNames);
          }
        }
      } catch (e) {
        console.error('Error loading kitchens:', e);
      }
    };
    loadKitchens();
  }, []);

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
      notes: item.notes || "",
      expirationDate: item.expirationDate || new Date().toISOString().split('T')[0],
    });
  };

  const handleEditSave = (index) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      name: editValues.name,
      quantity: parseInt(editValues.quantity) || 1,
      category: editValues.category,
      notes: editValues.notes || "",
      expirationDate: editValues.expirationDate,
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
      notes: "",
      expirationDate: new Date().toISOString().split('T')[0],
      originalText: "Manual entry",
    };
    setItems([...items, newItem]);
  };

  const handleSaveReceipt = async () => {
    if (items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    // Check if any items are still "New Item" (not edited)
    const hasIncompleteItems = items.some(item => 
      !item.name || !item.name.trim() || item.name.trim() === "New Item"
    );

    if (hasIncompleteItems) {
      Alert.alert(
        "Incomplete Items",
        "You have items labeled 'New Item'. Please edit them to change the name, or delete them before saving.",
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ]
      );
      return;
    }

    // If no kitchen is selected, show the selection modal
    if (!roomNameState || !roomNameState.trim()) {
      setShowKitchenModal(true);
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

  const handleSelectKitchen = async (kitchen) => {
    setRoomNameState(kitchen);
    setShowKitchenModal(false);
    
    // Save as last room for next time
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        await AsyncStorage.setItem(`lastRoom_${username}`, kitchen);
      }
    } catch (e) {
      console.error('Error saving last room:', e);
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
    <ImageBackground
      style={styles.backgroundImage}
      source={require("../assets/grid_paper.jpg")}
    >
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
                  <Text style={styles.editFormLabel}>Item Name *</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder="e.g., Milk, Chicken Breast"
                    value={editValues.name}
                    onChangeText={(text) =>
                      setEditValues({ ...editValues, name: text })
                    }
                  />

                  <Text style={styles.editFormLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.editInput, { minHeight: 80 }]}
                    placeholder="e.g., Organic, Bulk buy"
                    value={editValues.notes}
                    onChangeText={(text) =>
                      setEditValues({ ...editValues, notes: text })
                    }
                    multiline
                  />

                  <Text style={styles.editFormLabel}>Food Group *</Text>
                  <TouchableOpacity
                    style={styles.categoryPickerInput}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    <Text style={styles.categoryPickerText}>
                      {editValues.category}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#999" />
                  </TouchableOpacity>

                  <Text style={styles.editFormLabel}>Expiration Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar" size={20} color="#53B175" />
                    <Text style={styles.datePickerText}>
                      {editValues.expirationDate ? new Date(editValues.expirationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && editingIndex === index && (
                    <DateTimePicker
                      value={new Date(editValues.expirationDate || new Date())}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setEditValues({
                            ...editValues,
                            expirationDate: selectedDate.toISOString().split('T')[0],
                          });
                        }
                        setShowDatePicker(false);
                      }}
                    />
                  )}

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
                <>
                  {item.name && item.name.trim() && item.name.trim() !== "New Item" ? (
                    <View style={styles.itemDisplay}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                          </View>
                        </View>
                        {item.notes && item.notes.trim() && (
                          <Text style={styles.itemNotes}>{item.notes}</Text>
                        )}
                        {item.expirationDate && (
                          <Text style={styles.itemExpiration}>
                            Expires: {new Date(item.expirationDate).toLocaleDateString()}
                          </Text>
                        )}
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
                  ) : (
                    <View style={styles.itemIncompleteContainer}>
                      <Ionicons name="alert-circle" size={48} color="#ccc" />
                      <Text style={styles.itemIncompleteName}>{item.name || "New Item"}</Text>
                      <TouchableOpacity
                        onPress={() => handleEditStart(index, item)}
                        style={styles.editIncompleteButton}
                      >
                        <Text style={styles.editIncompleteButtonText}>Edit Item</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
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
        {/* Kitchen selection button */}
        <TouchableOpacity
          style={[styles.kitchenSelectorButton, roomNameState && styles.kitchenSelectorButtonSelected]}
          onPress={() => setShowKitchenModal(true)}
        >
          <Ionicons 
            name="home-outline" 
            size={20} 
            color={roomNameState ? "#53B175" : "#999"} 
            style={styles.kitchenSelectorIcon}
          />
          <Text style={[styles.kitchenSelectorText, roomNameState && styles.kitchenSelectorTextSelected]}>
            {roomNameState ? `Kitchen: ${roomNameState}` : "Select Kitchen"}
          </Text>
        </TouchableOpacity>

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

      {/* Kitchen Selection Modal */}
      <Modal
        visible={showKitchenModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKitchenModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowKitchenModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Kitchen</Text>
            <Text style={styles.modalSubtitle}>
              Choose which kitchen to store these items in:
            </Text>

            <View style={styles.kitchenList}>
              {availableKitchens.length > 0 ? (
                availableKitchens.map((kitchen, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.kitchenOption}
                    onPress={() => handleSelectKitchen(kitchen)}
                  >
                    <View style={styles.kitchenOptionContent}>
                      <Ionicons
                        name="home-outline"
                        size={24}
                        color="#53B175"
                        style={styles.kitchenIcon}
                      />
                      <Text style={styles.kitchenName}>{kitchen}</Text>
                      {roomNameState === kitchen && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#53B175"
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noKitchensText}>
                  No kitchens available. Please create or join a kitchen first.
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowKitchenModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.categoryModalCenterContent}>
            <Text style={styles.categoryModalCenterTitle}>Select Food Group</Text>

            <ScrollView style={styles.categoryListCenter} showsVerticalScrollIndicator={false}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryOptionCenter}
                  onPress={() => {
                    setEditValues({ ...editValues, category });
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryOptionCenterText}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.categoryModalCenterCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.categoryModalCenterCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F2ECD5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2ECD5",
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
    backgroundColor: "#E8DCC8",
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
  itemNotes: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  itemExpiration: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  itemIncompleteContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  itemIncompleteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  editIncompleteButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f9f4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#53B175",
  },
  editIncompleteButtonText: {
    color: "#53B175",
    fontWeight: "600",
    fontSize: 13,
  },
  editForm: {
    gap: 12,
    padding: 12,
  },
  editFormLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  categoryPickerInput: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  categoryPickerText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  datePickerInput: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9f9f9",
  },
  datePickerText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
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
    marginTop: 8,
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
    flexDirection: "column",
    padding: 16,
    gap: 12,
    backgroundColor: "#E8DCC8",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#53B175",
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#53B175",
    fontWeight: "600",
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 14,
    backgroundColor: "#53B175",
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#E8DCC8",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  kitchenList: {
    marginBottom: 16,
  },
  kitchenOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  kitchenOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kitchenIcon: {
    marginRight: 12,
  },
  kitchenName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
  },
  noKitchensText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  kitchenSelectorButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  kitchenSelectorButtonSelected: {
    borderColor: "#53B175",
    backgroundColor: "#f0f9f4",
  },
  kitchenSelectorIcon: {
    marginRight: 12,
  },
  kitchenSelectorText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999",
  },
  kitchenSelectorTextSelected: {
    color: "#53B175",
  },
  categoryModalContent: {
    backgroundColor: "#E8DCC8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "85%",
    marginTop: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryList: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  categoryOptionSimple: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  categoryOptionSimpleText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  categoryModalCloseButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryModalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  categoryModalCenterContent: {
    backgroundColor: "#E8DCC8",
    borderRadius: 16,
    width: "75%",
    maxHeight: "60%",
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  categoryModalCenterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    paddingBottom: 16,
    textAlign: "center",
  },
  categoryListCenter: {
    paddingHorizontal: 0,
    marginBottom: 16,
    maxHeight: 300,
  },
  categoryOptionCenter: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  categoryOptionCenterText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  categoryModalCenterCloseButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  categoryModalCenterCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
