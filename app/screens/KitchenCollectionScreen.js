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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";
import { useIngredientSuggestions } from '../hooks/useIngredientSuggestion';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const OLIVE = "#5d5f4a";
const OLIVE_MUTED = "#6b6d56";
const CREAM = "#e8e4db";
const INK = "#2d2e26";
const BG = "#dcd8cc";
const AMBER_BORDER = "rgba(217,119,6,0.2)";
const AMBER_BG = "rgba(254,243,199,0.75)";

const FOOD_GROUP_CARD_BG = {
  Protein: "#f5e6e6",
  Grain: "#ead5c8",
  Dairy: "#eee0d4",
  Fruit: "#fce4dc",
  Vegetable: "#d4e5c3",
  Spice: "#ece8dc",
  Other: "rgba(255,255,255,0.88)",
};

const FOOD_GROUP_OPTIONS = ["Protein", "Grain", "Dairy", "Fruit", "Vegetable", "Spice", "Other"];

/** Days until expiry; null if no date (aligned with UpcomingScreen thresholds). */
const getDaysUntilExpiry = (dateString) => {
  if (!dateString) return null;
  const today = new Date();
  const expDate = new Date(dateString);
  const diffTime = expDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getItemCardBackground = (item) => {
  const d = getDaysUntilExpiry(item.expirationDate);
  if (d !== null && d <= 3) return "#f5e6e6";
  const g = item.foodGroup || "Other";
  return FOOD_GROUP_CARD_BG[g] || FOOD_GROUP_CARD_BG.Other;
};

export default function KitchenCollection({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  /** all | expiringSoon (≤3 days, matches yellow/red urgency) | latest (newest first) */
  const [sortFilter, setSortFilter] = useState("all");
  const [foodGroupFilter, setFoodGroupFilter] = useState("all");

  // --- INTEGRATED SEARCH HOOK ---
  const suggestions = useIngredientSuggestions(editItemName);
  const filteredRoomItems = useMemo(() => {
    let list = [...roomItems];

    if (foodGroupFilter !== "all") {
      const target = foodGroupFilter.toLowerCase();
      list = list.filter(
        (item) => (item.foodGroup || "Other").toLowerCase() === target
      );
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((item) => item.name?.toLowerCase().includes(query));
    }

    if (sortFilter === "expiringSoon") {
      list = list.filter((item) => {
        const d = getDaysUntilExpiry(item.expirationDate);
        return d !== null && d <= 3;
      });
      list.sort((a, b) => {
        const ta = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
        const tb = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
        return ta - tb;
      });
    } else if (sortFilter === "latest") {
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    }

    return list;
  }, [roomItems, searchQuery, foodGroupFilter, sortFilter]);

  // Open edit modal for an item
  const openEditItemModal = (item) => {
    const index = roomItems.findIndex((i) => i._id === item._id);
    if (index === -1) return;
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

  const foodGroups = FOOD_GROUP_OPTIONS.filter((g) => g !== "Other");

  const saveRoomEdits = async () => {
    if (!editRoomName.trim()) {
      Alert.alert("Error", "Room name is required");
      return;
    }
    if (!username) {
      Alert.alert("Error", "User session not loaded");
      return;
    }
    try {
      const key = `visitedRooms_${username}`;
      const visitedRoomsStr = await AsyncStorage.getItem(key);
      const rooms = visitedRoomsStr ? JSON.parse(visitedRoomsStr) : [];
      const roomIndex = rooms.findIndex((r) => r.name === editingRoomName);
      if (roomIndex !== -1) {
        rooms[roomIndex].name = editRoomName.trim();
        if (editRoomPassword.trim()) rooms[roomIndex].password = editRoomPassword.trim();
        await AsyncStorage.setItem(key, JSON.stringify(rooms));
        setVisitedRooms(rooms);
        setSelectedRoom(editRoomName.trim());
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

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    foodGroupFilter !== "all" ||
    sortFilter !== "all";

  const roomEmptyMessage =
    roomItems.length === 0
      ? "No items in this kitchen yet."
      : hasActiveFilters
        ? "No items match your search or filters."
        : "No items match your search.";

  if (selectedRoom) {
    const expiringSoon = (it) => {
      const d = getDaysUntilExpiry(it.expirationDate);
      return d !== null && d <= 3;
    };

    return (
      <SafeAreaView style={styles.safeRoot} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          <View style={styles.invHeaderRow}>
            <TouchableOpacity
              style={styles.backPill}
              onPress={handleBack}
              activeOpacity={0.9}
            >
              <Ionicons name="chevron-back" size={18} color={CREAM} style={{ marginRight: 4 }} />
              <Text style={styles.backPillText}>Back</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.kitchenTitle}>{selectedRoom}</Text>

          <TextInput
            style={styles.roomSearchInput}
            placeholder="Search items in this room"
            placeholderTextColor={`${OLIVE}66`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sortPillsScroll}
            contentContainerStyle={styles.sortPillsContent}
          >
            {[
              { key: "all", label: "All" },
              { key: "expiringSoon", label: "Expiring soon" },
              { key: "latest", label: "Latest" },
            ].map(({ key, label }) => {
              const selected = sortFilter === key;
              const isExpiringChip = key === "expiringSoon";
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sortPill,
                    isExpiringChip && selected && styles.sortPillAmber,
                    (!isExpiringChip || !selected) && selected && styles.sortPillSelected,
                    !selected && styles.sortPillIdle,
                  ]}
                  onPress={() => setSortFilter(key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      selected && styles.sortPillTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.filterSectionLabel}>Food group</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                foodGroupFilter === "all" && styles.categoryChipSelected,
              ]}
              onPress={() => setFoodGroupFilter("all")}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  foodGroupFilter === "all" && styles.categoryChipTextSelected,
                ]}
              >
                All groups
              </Text>
            </TouchableOpacity>
            {FOOD_GROUP_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.categoryChip,
                  foodGroupFilter === g && styles.categoryChipSelected,
                ]}
                onPress={() => setFoodGroupFilter(g)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    foodGroupFilter === g && styles.categoryChipTextSelected,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={OLIVE} />
            </View>
          ) : filteredRoomItems.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>{roomEmptyMessage}</Text>
            </View>
          ) : (
            <FlatList
              key={"grid_layout"}
              style={{ flex: 1 }}
              numColumns={3}
              data={filteredRoomItems}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => (
                <View style={styles.gridCell}>
                  <TouchableOpacity
                    style={[
                      styles.gridCard,
                      { backgroundColor: getItemCardBackground(item) },
                    ]}
                    onPress={() => openEditItemModal(item)}
                    activeOpacity={0.92}
                  >
                    <Image source={icon_search(item.name)} style={styles.gridIcon} />
                    <Text style={styles.gridItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {expiringSoon(item) ? (
                      <Text style={styles.expiringBadge}>Expiring soon</Text>
                    ) : null}
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={[styles.addButton, { bottom: Math.max(insets.bottom, 12) + 8 }]}
            onPress={() => navigation.navigate("ManualAdd", { roomName: selectedRoom })}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={22} color={CREAM} style={{ marginRight: 8 }} />
            <Text style={styles.addText}>Add Item</Text>
          </TouchableOpacity>

          {/* Edit Item Options Modal */}
          <Modal visible={showItemEditModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{roomItems[editingItemIndex]?.name || "Item"}</Text>
                <TouchableOpacity style={styles.optionButton} onPress={openEditForm}>
                  <Ionicons name="create" size={20} color={OLIVE} />
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
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton, styles.modalBtnHalf]} onPress={() => setShowItemEditForm(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.saveButton, styles.modalBtnHalf]} onPress={saveItemEdits}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeRoot} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.roomListRoot}>
        <View style={styles.invHeaderRow}>
          <TouchableOpacity
            style={styles.backPill}
            onPress={() => navigation.navigate("MainNavBar")}
            activeOpacity={0.9}
          >
            <Ionicons name="chevron-back" size={18} color={CREAM} style={{ marginRight: 4 }} />
            <Text style={styles.backPillText}>Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.kitchenTitle}>Your Rooms</Text>
        {visitedRooms.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No rooms yet.</Text>
          </View>
        ) : (
          <FlatList
            data={visitedRooms}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedRoom(item.name)}
                style={styles.roomCardNew}
                activeOpacity={0.9}
              >
                <View style={styles.roomCardContent}>
                  <Text style={styles.roomCardTitleNew}>{item.name}</Text>
                  <Text style={styles.roomCardSubtitleNew}>Tap to view items</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={OLIVE} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContentNew}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 24 },
  roomListRoot: { flex: 1, paddingHorizontal: 24 },
  invHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  backPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: OLIVE,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  backPillText: { color: CREAM, fontSize: 14, fontWeight: "600" },
  kitchenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: INK,
    marginBottom: 12,
    marginTop: 4,
  },
  roomSearchInput: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.2)",
    borderRadius: 10,
    fontSize: 15,
    color: INK,
    marginBottom: 12,
  },
  sortPillsScroll: { maxHeight: 40, marginBottom: 8 },
  sortPillsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  sortPillIdle: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderColor: "rgba(93,95,74,0.2)",
  },
  sortPillSelected: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderColor: "rgba(93,95,74,0.35)",
  },
  sortPillAmber: {
    backgroundColor: AMBER_BG,
    borderColor: AMBER_BORDER,
  },
  sortPillText: { fontSize: 12, color: `${INK}b3` },
  sortPillTextSelected: { color: INK, fontWeight: "600" },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: `${INK}99`,
    marginBottom: 8,
    marginTop: 4,
  },
  categoryScroll: { maxHeight: 48, marginBottom: 12 },
  categoryScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.2)",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipSelected: {
    backgroundColor: "rgba(232,239,227,0.95)",
    borderColor: OLIVE,
  },
  categoryChipText: { fontSize: 14, color: INK },
  categoryChipTextSelected: { fontWeight: "700", color: OLIVE },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 24 },
  emptyText: { color: `${INK}99`, fontSize: 16, textAlign: "center", paddingHorizontal: 20 },
  gridContainer: { paddingBottom: 120, paddingTop: 8 },
  gridRow: { justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 0 },
  gridCell: { width: "31%", maxWidth: "31%" },
  gridCard: {
    aspectRatio: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  gridIcon: { width: 44, height: 44, resizeMode: "contain", marginBottom: 6 },
  gridItemName: {
    fontSize: 11,
    fontWeight: "600",
    color: INK,
    textAlign: "center",
    width: "100%",
  },
  expiringBadge: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "700",
    color: "#d97706",
  },
  addButton: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OLIVE,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  addText: { color: CREAM, fontSize: 16, fontWeight: "700" },
  listContentNew: { paddingBottom: 24, paddingTop: 8 },
  roomCardNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.2)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  roomCardContent: { flex: 1 },
  roomCardTitleNew: { fontSize: 17, fontWeight: "700", color: INK },
  roomCardSubtitleNew: { fontSize: 13, color: `${INK}88`, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: CREAM,
    borderRadius: 20,
    padding: 20,
    width: "88%",
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.15)",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: INK,
    marginBottom: 14,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: INK,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.22)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    color: INK,
  },
  foodGroupButton: {
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.22)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  foodGroupButtonText: { fontSize: 15, color: INK },
  modalButtonRow: { flexDirection: "row", marginTop: 20, justifyContent: "space-between" },
  modalBtnHalf: { width: "48%" },
  modalButton: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  cancelButton: { backgroundColor: OLIVE_MUTED },
  saveButton: { backgroundColor: OLIVE },
  modalButtonText: { fontSize: 15, fontWeight: "600", color: CREAM },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(93,95,74,0.12)",
  },
  optionButtonText: { fontSize: 16, color: OLIVE, marginLeft: 12, fontWeight: "600" },
  cancelOptionButton: { paddingVertical: 14, alignItems: "center" },
  cancelOptionButtonText: { fontSize: 16, color: `${INK}99`, fontWeight: "600" },
  suggestionDropdown: {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(93,95,74,0.2)",
    maxHeight: 150,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    zIndex: 10000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  suggestionText: { fontSize: 14, color: INK },
  globalLabel: {
    fontSize: 10,
    color: OLIVE,
    fontWeight: "700",
    backgroundColor: "#eef2eb",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
});