import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  GestureResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";

export default function KitchenCollection({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(
    route.params?.roomName || null
  );
  const [roomItems, setRoomItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("");
  const [showItemEditModal, setShowItemEditModal] = useState(false);
  const [showItemEditForm, setShowItemEditForm] = useState(false);
  const [editingRoomName, setEditingRoomName] = useState("");
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomPassword, setEditRoomPassword] = useState("");
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);

  // Open edit modal for an item
  const openEditItemModal = (index) => {
    const item = roomItems[index];
    setEditingItemIndex(index);
    setEditItemName(item.name);
    setEditItemQuantity(item.quantity?.toString() || "");
    setEditItemCategory(item.foodGroup);
    setShowItemEditModal(true); // Show options menu
  };

  // Open the edit form (from the options menu)
  const openEditForm = () => {
    setShowItemEditModal(false);
    setShowItemEditForm(true);
  };

  // Save item edits
  const saveItemEdits = async () => {
    if (!editItemName.trim()) {
      Alert.alert("Error", "Item name is required");
      return;
    }
    
    try {
      const item = roomItems[editingItemIndex];
      const updatedItem = {
        ...item,
        name: editItemName,
        quantity: editItemQuantity ? parseInt(editItemQuantity) : item.quantity,
        foodGroup: editItemCategory,
      };
      
      // Update item on backend
      await apiClient.put(`/inventory/${item._id}`, updatedItem);
      
      // Update local state
      const updatedItems = [...roomItems];
      updatedItems[editingItemIndex] = updatedItem;
      setRoomItems(updatedItems);
      
      setShowItemEditForm(false);
      Alert.alert("Success", "Item updated successfully");
    } catch (err) {
      console.error("Error updating item:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update item");
    }
  };

  // Delete item with confirmation
  const deleteItem = (index) => {
    const item = roomItems[index];
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/inventory/${item._id}`);
              const updatedItems = roomItems.filter((_, i) => i !== index);
              setRoomItems(updatedItems);
              Alert.alert("Success", "Item deleted successfully");
            } catch (err) {
              console.error("Error deleting item:", err.response?.data || err.message);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  // Food groups for category selector
  const foodGroups = ["Protein", "Grain", "Dairy", "Fruit", "Vegetable", "Spice"];

  // Open edit modal for the room
  const openEditRoomModal = () => {
    if (!selectedRoom) return;
    // Prompt for password verification
    Alert.prompt(
      "Verify Room Password",
      "Enter the room password to edit:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Verify",
          onPress: (password) => {
            // Check if password matches the saved room password
            const visitedRoomsStr = AsyncStorage.getItem("visitedRooms");
            visitedRoomsStr
              .then((roomsStr) => {
                const visitedRooms = roomsStr ? JSON.parse(roomsStr) : [];
                const room = visitedRooms.find((r) => r.name === selectedRoom);
                if (room && room.password === password) {
                  setEditingRoomName(selectedRoom);
                  setEditRoomName(selectedRoom);
                  setEditRoomPassword("");
                  setShowRoomEditModal(true);
                } else {
                  Alert.alert("Error", "Incorrect password");
                }
              })
              .catch((err) => console.error("Error verifying password:", err));
          },
        },
      ],
      "secure-text"
    );
  };

  // Save room edits
  const saveRoomEdits = async () => {
    if (!editRoomName.trim()) {
      Alert.alert("Error", "Room name is required");
      return;
    }

    try {
      const visitedRoomsStr = await AsyncStorage.getItem("visitedRooms");
      const visitedRooms = visitedRoomsStr ? JSON.parse(visitedRoomsStr) : [];

      const roomIndex = visitedRooms.findIndex((r) => r.name === editingRoomName);
      if (roomIndex !== -1) {
        visitedRooms[roomIndex].name = editRoomName;
        if (editRoomPassword.trim()) {
          visitedRooms[roomIndex].password = editRoomPassword;
        }
        await AsyncStorage.setItem("visitedRooms", JSON.stringify(visitedRooms));
        setSelectedRoom(editRoomName);
        setEditingRoomName(editRoomName);
        setShowRoomEditModal(false);
        Alert.alert("Success", "Room updated successfully");
      }
    } catch (err) {
      console.error("Error updating room:", err);
      Alert.alert("Error", "Failed to update room");
    }
  };

  // Reload items when screen gains focus
  useEffect(() => {
    console.log(`📱 Focus listener registered for selectedRoom: "${selectedRoom}"`);
    const unsubscribe = navigation.addListener("focus", () => {
      console.log(`👁️ Screen gained focus, selectedRoom: "${selectedRoom}"`);
      if (selectedRoom) {
        console.log(`🔄 Focus listener calling loadRoomItems("${selectedRoom}")`);
        loadRoomItems(selectedRoom);
      }
    });
    return unsubscribe;
  }, [navigation, selectedRoom]);

  // Load items when selectedRoom changes (initial load or switch rooms)
  useEffect(() => {
    console.log(`⚙️ useEffect triggered: selectedRoom changed to "${selectedRoom}"`);
    if (selectedRoom && selectedRoom.length > 0) {
      console.log(`✨ Calling loadRoomItems("${selectedRoom}")`);
      loadRoomItems(selectedRoom);
    }
  }, [selectedRoom]);

  // Load username and visited rooms (per-user)
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
          const roomsStr = await AsyncStorage.getItem(`visitedRooms_${storedUsername}`);
          if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
  }, []);

  // Fetch items for the authenticated user (room-scoped)
  const loadRoomItems = async (roomName) => {
    console.log(`🔄 loadRoomItems called with roomName: "${roomName}"`);
    setLoading(true);
    try {
      // Save lastRoom to AsyncStorage for ItemAddScreen (per-user + global fallback)
      try {
        if (username) {
          await AsyncStorage.setItem(`lastRoom_${username}`, roomName);
          console.log(`📝 Saved lastRoom_${username} to AsyncStorage: "${roomName}"`);
        }
        // Also write global key for backward compatibility
        await AsyncStorage.setItem('lastRoom', roomName);
        console.log(`📝 Saved lastRoom (global) to AsyncStorage: "${roomName}"`);
      } catch (e) {
        console.error('Error saving lastRoom to AsyncStorage:', e);
      }
      // Backend now returns user's inventory items scoped by room
      const url = `/inventory?room=${encodeURIComponent(roomName)}`;
      console.log(`🌐 Fetching from: ${url}`);
      const res = await apiClient.get(url);
      console.log(`✅ Received ${res.data.length} items for room "${roomName}"`);
      setRoomItems(res.data);
    } catch (err) {
      console.error("❌ Error loading items:", err.response?.data || err.message);
    }
    setLoading(false);
  };

  // Effect to load items whenever selectedRoom changes
  useEffect(() => {
    if (selectedRoom && selectedRoom.length > 0) {
      loadRoomItems(selectedRoom);
    }
  }, [selectedRoom]);

  // Go back to list of rooms
  const handleBack = () => {
    setSelectedRoom(null);
    setRoomItems([]);
  };

  // --- If user has selected a room, show its items ---
  if (selectedRoom) {
    return (
      <View style={styles.container}>
        {/* Fixed header bar with Return button */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.returnButtonHeader}
            onPress={() => handleBack()}
          >
            <Text style={styles.returnButtonHeaderText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>{selectedRoom}</Text>
          <TouchableOpacity
            style={styles.settingsButtonHeader}
            onPress={openEditRoomModal}
          >
            <Ionicons name="settings" size={24} color="#4D693A" />
          </TouchableOpacity>
        </View>

        {/* Items list */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#4D693A" />
          </View>
        ) : roomItems.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No items in this kitchen yet.</Text>
          </View>
        ) : (
          <FlatList
            data={roomItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => openEditItemModal(index)}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemInfo}>{item.foodGroup}</Text>
                {item.expirationDate && (
                  <Text
                    style={[
                      styles.itemInfo,
                      {
                        color:
                          new Date(item.expirationDate) < new Date()
                            ? "#d81e1e"
                            : "#000",
                      },
                    ]}
                  >
                    {new Date(item.expirationDate).toDateString()}
                  </Text>
                )}
                {item.description && (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Add Button - Fixed at bottom */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("ManualAdd", { roomName: selectedRoom })
          }
        >
          <Text style={styles.addText}>➕ Add Item</Text>
        </TouchableOpacity>

        {/* Edit Item Modal - shows edit/delete options */}
        <Modal
          visible={showItemEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowItemEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {roomItems[editingItemIndex]?.name || "Item"}
              </Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  openEditForm();
                }}
              >
                <Ionicons name="create" size={20} color="#2196F3" />
                <Text style={styles.optionButtonText}>Edit Item</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  setShowItemEditModal(false);
                  deleteItem(editingItemIndex);
                }}
              >
                <Ionicons name="trash" size={20} color="#FF5252" />
                <Text style={[styles.optionButtonText, { color: "#FF5252" }]}>
                  Delete Item
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelOptionButton}
                onPress={() => setShowItemEditModal(false)}
              >
                <Text style={styles.cancelOptionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Edit Item Form Modal */}
        <Modal
          visible={showItemEditForm}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowItemEditForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Item</Text>

              <Text style={styles.modalLabel}>Item Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter item name"
                value={editItemName}
                onChangeText={setEditItemName}
              />

              <Text style={styles.modalLabel}>Quantity</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter quantity"
                value={editItemQuantity}
                onChangeText={setEditItemQuantity}
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Food Group</Text>
              <TouchableOpacity
                style={styles.foodGroupButton}
                onPress={() => {
                  Alert.alert(
                    "Select Food Group",
                    "",
                    foodGroups.map((group) => ({
                      text: group,
                      onPress: () => setEditItemCategory(group),
                    })).concat({ text: "Cancel", style: "cancel" })
                  );
                }}
              >
                <Text style={styles.foodGroupButtonText}>
                  {editItemCategory || "Select category"}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowItemEditForm(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveItemEdits}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Room Modal */}
        <Modal
          visible={showRoomEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRoomEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Room</Text>

              <Text style={styles.modalLabel}>Room Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter room name"
                value={editRoomName}
                onChangeText={setEditRoomName}
              />

              <Text style={styles.modalLabel}>Password (optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new password"
                value={editRoomPassword}
                onChangeText={setEditRoomPassword}
                secureTextEntry={true}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowRoomEditModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveRoomEdits}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // --- Otherwise, show list of recently visited rooms ---
  return (
    <View style={styles.container}>
      {/* Fixed header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.returnButtonHeader}
          onPress={() => navigation.navigate("MainNavBar")}
        >
          <Text style={styles.returnButtonHeaderText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Your Rooms</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Rooms list */}
      {visitedRooms.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No rooms yet.</Text>
          <Text style={styles.emptySubText}>
            Join a room to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={visitedRooms}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedRoom(item.name)}
              style={styles.roomCard}
            >
              <View style={styles.roomCardContent}>
                <Text style={styles.roomCardTitle}>{item.name}</Text>
                <Text style={styles.roomCardSubtitle}>Tap to view items</Text>
              </View>
              <Text style={styles.roomCardArrow}>→</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
  /*
  // --- Otherwise, show list of kitchens ---
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("KitchenHome")}>
        <Text style={styles.backText}>← Return</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Kitchens</Text>

      <FlatList
        data={visitedRooms}
        keyExtractor={(item) => item.name} // Each item is {name, password}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedRoom(item.name)} // Always pass string
            style={styles.roomButton}
          >
            <Text style={styles.roomText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
  */
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 40,
  },
  returnButtonHeader: {
    padding: 8,
  },
  returnButtonHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
  },
  settingsButtonHeader: {
    padding: 8,
  },
  headerBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  // Room card styles
  roomCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  roomCardContent: {
    flex: 1,
  },
  roomCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  roomCardSubtitle: {
    fontSize: 13,
    color: "#999",
  },
  roomCardArrow: {
    fontSize: 20,
    color: "#4D693A",
    marginLeft: 12,
  },
  // Item card styles
  itemCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemInfo: {
    fontSize: 15,
    color: "#555",
  },
  itemDesc: {
    fontStyle: "italic",
    color: "#666",
    marginTop: 4,
  },
  itemHint: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 6,
    fontStyle: "italic",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4D693A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#777",
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubText: {
    color: "#bbb",
    fontSize: 14,
  },
  // Item action buttons
  itemWrapper: {
    marginVertical: 8,
  },
  itemActionButtons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FF5252",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  foodGroupButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    marginTop: 6,
  },
  foodGroupButtonText: {
    fontSize: 14,
    color: "#333",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#4D693A",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  // Option button styles for action menu
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionButtonText: {
    fontSize: 16,
    color: "#2196F3",
    marginLeft: 12,
    fontWeight: "600",
  },
  cancelOptionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  cancelOptionButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
