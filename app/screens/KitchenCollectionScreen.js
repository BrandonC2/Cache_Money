import React, { useEffect, useState, useMemo } from "react";
import { icon_search } from './IconLookupFunction';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";
import { useIngredientSuggestions } from '../hooks/useIngredientSuggestions';

export default function KitchenCollection({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(
    route.params?.roomName || null
  );
  const [roomItems, setRoomItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit Item States
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("");
  const [showItemEditModal, setShowItemEditModal] = useState(false);
  const [showItemEditForm, setShowItemEditForm] = useState(false);

  // Room Edit States
  const [editingRoomName, setEditingRoomName] = useState("");
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomPassword, setEditRoomPassword] = useState("");
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);

  // --- INTEGRATED SEARCH HOOK ---
  const suggestions = useIngredientSuggestions(editItemName);

  // Open edit modal for an item
  const openEditItemModal = (index) => {
    const item = roomItems[index];
    setEditingItemIndex(index);
    setEditItemName(item.name);
    setEditItemQuantity(item.quantity?.toString() || "");
    setEditItemCategory(item.foodGroup);
    setShowItemEditModal(true); 
  };

  const openEditForm = () => {
    setShowItemEditModal(false);
    setShowItemEditForm(true);
  };

  // Handle selecting a suggestion
  const handleSuggestionSelect = (item) => {
    setEditItemName(item.name);
    if (item.foodGroup) {
      setEditItemCategory(item.foodGroup);
    }
  };

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
      await apiClient.put(`/inventory/${item._id}`, updatedItem);
      const updatedItems = [...roomItems];
      updatedItems[editingItemIndex] = updatedItem;
      setRoomItems(updatedItems);
      setShowItemEditForm(false);
    } catch (err) {
      console.error("Error updating item:", err.message);
      Alert.alert("Error", "Failed to update item");
    }
  };

  const deleteItem = (index) => {
    const item = roomItems[index];
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/inventory/${item._id}`);
              const updatedItems = roomItems.filter((_, i) => i !== index);
              setRoomItems(updatedItems);
            } catch (err) {
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  const foodGroups = ["Protein", "Grain", "Dairy", "Fruit", "Vegetable", "Spice"];

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
        if (editRoomPassword.trim()) visitedRooms[roomIndex].password = editRoomPassword;
        await AsyncStorage.setItem("visitedRooms", JSON.stringify(visitedRooms));
        setSelectedRoom(editRoomName);
        setShowRoomEditModal(false);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update room");
    }
  };

  // Data Loading
  const loadRoomItems = async (roomName) => {
    setLoading(true);
    try {
      if (username) await AsyncStorage.setItem(`lastRoom_${username}`, roomName);
      await AsyncStorage.setItem('lastRoom', roomName);
      const res = await apiClient.get(`/inventory?room=${encodeURIComponent(roomName)}`);
      setRoomItems(res.data);
    } catch (err) {
      console.error("❌ Error loading items:", err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (selectedRoom) loadRoomItems(selectedRoom);
    });
    return unsubscribe;
  }, [navigation, selectedRoom]);

  useEffect(() => {
    if (selectedRoom) loadRoomItems(selectedRoom);
  }, [selectedRoom]);

  useEffect(() => {
    const loadData = async () => {
      const storedUsername = await AsyncStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
        const roomsStr = await AsyncStorage.getItem(`visitedRooms_${storedUsername}`);
        if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));
      }
    };
    loadData();
  }, []);

  const handleBack = () => navigation.goBack();

  if (selectedRoom) {
    return (
      <ImageBackground 
        style={styles.background}
        source={require("../assets/grid_paper.jpg")}
      >
        <View style={styles.container}>
          <View style={styles.headerBarContainer}>
            <CustomBackButton onPress={() => handleBack()} />
            <Text style={styles.headerBarTitle}>{selectedRoom}</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <View style={styles.Box}>
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
                key={'grid_layout'}
                numColumns={3}
                data={roomItems}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.gridItemContainer}
                    onPress={() => openEditItemModal(index)}
                  >
                    <Image source={icon_search(item.name)} style={styles.gridIcon} />
                    <Text style={styles.gridItemName} numberOfLines={1}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("ManualAdd", { roomName: selectedRoom })}
          >
            <Text style={styles.addText}>➕ Add Item</Text>
          </TouchableOpacity>

          {/* Edit Item Options Modal */}
          <Modal visible={showItemEditModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{roomItems[editingItemIndex]?.name || "Item"}</Text>
                <TouchableOpacity style={styles.optionButton} onPress={openEditForm}>
                  <Ionicons name="create" size={20} color="#4D693A" />
                  <Text style={styles.optionButtonText}>Edit Item</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={() => { setShowItemEditModal(false); deleteItem(editingItemIndex); }}>
                  <Ionicons name="trash" size={20} color="#FF5252" />
                  <Text style={[styles.optionButtonText, { color: "#FF5252" }]}>Delete Item</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelOptionButton} onPress={() => setShowItemEditModal(false)}>
                  <Text style={styles.cancelOptionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Edit Item Form Modal with Autocomplete */}
          <Modal visible={showItemEditForm} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Item</Text>

                <Text style={styles.modalLabel}>Item Name</Text>
                <View style={{ zIndex: 5000 }}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter item name"
                    value={editItemName}
                    onChangeText={setEditItemName}
                  />
                  {editItemName.length > 2 && suggestions.length > 0 && (
                    <View style={styles.suggestionDropdown}>
                      <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        keyboardShouldPersistTaps="always"
                        renderItem={({ item }) => (
                          <TouchableOpacity 
                            style={styles.suggestionItem}
                            onPress={() => handleSuggestionSelect(item)}
                          >
                            <Text style={styles.suggestionText}>{item.name}</Text>
                            {item.isGlobal && <Text style={styles.globalLabel}>New</Text>}
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}
                </View>

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
                    Alert.alert("Select Food Group", "", 
                      foodGroups.map((group) => ({
                        text: group,
                        onPress: () => setEditItemCategory(group),
                      })).concat({ text: "Cancel", style: "cancel" })
                    );
                  }}
                >
                  <Text style={styles.foodGroupButtonText}>{editItemCategory || "Select category"}</Text>
                </TouchableOpacity>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowItemEditForm(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveItemEdits}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.returnButtonHeader} onPress={() => navigation.navigate("MainNavBar")}>
          <Text style={styles.returnButtonHeaderText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Your Rooms</Text>
        <View style={{ width: 80 }} />
      </View>
      {visitedRooms.length === 0 ? (
        <View style={styles.centerContent}><Text style={styles.emptyText}>No rooms yet.</Text></View>
      ) : (
        <FlatList
          data={visitedRooms}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedRoom(item.name)} style={styles.roomCard}>
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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#f8f8f8", borderBottomWidth: 1, borderBottomColor: "#ddd", marginTop: 40 },
  headerBarContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "transparent", marginTop: 8 },
  returnButtonHeaderText: { fontSize: 16, fontWeight: "600", color: "#007bff" },
  headerBarTitle: { fontSize: 18, fontWeight: "bold", color: "#333", textAlign: "center" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 20 },
  roomCard: { backgroundColor: "white", padding: 16, borderRadius: 10, marginVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 3 },
  roomCardContent: { flex: 1 },
  roomCardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  roomCardSubtitle: { fontSize: 13, color: "#999" },
  roomCardArrow: { fontSize: 20, color: "#4D693A", marginLeft: 12 },
  addButton: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "#4D693A", padding: 14, borderRadius: 10, alignItems: "center" },
  addText: { color: "white", fontSize: 16, fontWeight: "bold" },
  emptyText: { color: "#777", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fcfaf2ff", borderColor: "#94938eff", borderRadius: 30, padding: 20, width: "85%", maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 16, textAlign: "center" },
  modalLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 12 },
  modalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: "#f1e9e2ff" },
  foodGroupButton: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#f1e9e2ff", marginTop: 6 },
  foodGroupButtonText: { fontSize: 14, color: "#333" },
  modalButtonRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#4D693A" },
  saveButton: { backgroundColor: "#4D693A" },
  modalButtonText: { fontSize: 14, fontWeight: "600", color: "white" },
  optionButton: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionButtonText: { fontSize: 16, color: "#4D693A", marginLeft: 12, fontWeight: "600" },
  cancelOptionButton: { paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  cancelOptionButtonText: { fontSize: 16, color: "#666", fontWeight: "600" },
  gridItemName: { fontSize: 12, fontWeight: '500', color: '#333', textAlign: 'center', width: '100%' },
  gridIcon: { width: 90, height: 90, resizeMode: 'contain', marginBottom: 5 },
  gridItemContainer: { flex: 1, maxWidth: '33.33%', alignItems: 'center', marginBottom: 20 },
  gridContainer: { paddingHorizontal: 10, paddingTop: 20, paddingBottom: 100 },
  background: { flex: 1, paddingTop: 60, paddingBottom: 20 },
  Box: { width: '90%', height: '80%', alignSelf: 'center', borderWidth: 1.5, borderColor: '#4A3B32', overflow: 'hidden', marginBottom: 150, marginTop: -10 },
  
  // --- NEW SEARCH DROPDOWN STYLES ---
  suggestionDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    zIndex: 10000, 
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  suggestionText: { fontSize: 14, color: '#333' },
  globalLabel: { fontSize: 10, color: '#4D693A', fontWeight: 'bold', backgroundColor: '#eef2eb', paddingHorizontal: 5, borderRadius: 4 },
});