import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ImageBackground,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MealPrepScreen({ route, navigation }) {
  const { recipeId, recipeName, ingredients } = route.params;
  const [inventory, setInventory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [missingItems, setMissingItems] = useState([]);
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [scheduling, setScheduling] = useState(false);

  // Add-to-inventory modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addItem, setAddItem] = useState(null);
  const [addQuantity, setAddQuantity] = useState("");
  const [addRoom, setAddRoom] = useState("");
  const [addUnit, setAddUnit] = useState("");
  const [adding, setAdding] = useState(false);

  const insets = useSafeAreaInsets();

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const getAvailableQuantity = (items, ingredient) => {
    const ingredientName = normalize(ingredient?.name);
    const ingredientUnit = normalize(ingredient?.unit);

    return items
      .filter((inv) => normalize(inv.name) === ingredientName)
      .filter((inv) => {
        const invUnit = normalize(inv.unit);
        // If recipe/unit is unspecified, count all same-name inventory.
        if (!ingredientUnit || !invUnit) return true;
        return invUnit === ingredientUnit;
      })
      .reduce((sum, inv) => sum + (Number(inv.quantity) || 0), 0);
  };

  useEffect(() => {
    fetchInventory();
    loadVisitedRooms();
  }, []);

  const loadVisitedRooms = async () => {
    try {
      const username = await AsyncStorage.getItem("username");
      const key = `visitedRooms_${username}`;
      const roomsStr = await AsyncStorage.getItem(key);
      const rooms = roomsStr ? JSON.parse(roomsStr) : [];
      setVisitedRooms(rooms);
      if (rooms.length > 0 && !addRoom) setAddRoom(rooms[0].name);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get("/mealplans/inventory");
      setInventory(res.data);
      calculateMissing(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load inventory");
    }
  };

  const calculateMissing = (currentInventory) => {
    const missing = ingredients.filter((req) => {
      const availableQty = getAvailableQuantity(currentInventory, req);
      return availableQty < (Number(req.quantity) || 0);
    });
    setMissingItems(missing);
  };

  const openAddModal = (item) => {
    const availableQty = getAvailableQuantity(inventory, item);
    const qty = Math.max(0, (Number(item.quantity) || 0) - availableQty);
    setAddItem(item);
    setAddQuantity(String(qty));
    setAddUnit(item.unit || "");
    setAddRoom(visitedRooms[0]?.name || "");
    setShowAddModal(true);
  };

  const handleAddToInventory = async () => {
    if (!addItem || !addRoom || !addQuantity || Number(addQuantity) <= 0) {
      Alert.alert("Error", "Please enter quantity and select a room.");
      return;
    }
    try {
      setAdding(true);
      const payload = {
        name: (addItem.name || "").trim(),
        foodGroup: addItem.foodGroup || "Other",
        quantity: Number(addQuantity),
        unit: (addUnit || "").trim(),
        room: addRoom.trim(),
      };

      if (!payload.name) {
        Alert.alert("Error", "Item name is required.");
        return;
      }
      if (!payload.room) {
        Alert.alert("Error", "Room is required.");
        return;
      }

      await apiClient.post("/inventory", payload);

      Alert.alert("Success", "Item added to inventory!");
      setShowAddModal(false);
      setAddItem(null);
      setAddQuantity("");
      setAddUnit("");
      fetchInventory();
    } catch (err) {
      console.error("Add to inventory error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to add item.");
    } finally {
      setAdding(false);
    }
  };

  const handleSchedule = async () => {
    if (missingItems.length > 0) {
      Alert.alert(
        "Missing ingredients",
        "Add the missing ingredients to inventory before scheduling this meal."
      );
      return;
    }
    try {
      setScheduling(true);
      await apiClient.post("/mealplans", {
        recipeId,
        recipeName,
        date: selectedDate,
      });
      Alert.alert("Scheduled!", `${recipeName} is planned for ${selectedDate}.`);
      navigation.navigate("Schedule", { selectedDate, refreshAt: Date.now() });
    } catch (err) {
      console.error("Schedule error:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not schedule meal."
      );
    } finally {
      setScheduling(false);
    }
  };

  const renderIngredient = ({ item }) => {
    const isMissing = missingItems.some(
      (m) => (m.name || "").toLowerCase() === (item.name || "").toLowerCase()
    );
    return (
      <View style={styles.ingredientRow}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: isMissing ? "#FFCDD2" : "#C8E6C9" },
          ]}
        >
          <Text style={{ fontSize: 12 }}>{isMissing ? "❌" : "✅"}</Text>
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.name}</Text>
          <Text style={styles.ingredientQty}>
            {item.quantity} {item.unit || ""}
          </Text>
        </View>
        {isMissing ? (
          <TouchableOpacity
            style={styles.addToInvButton}
            onPress={() => openAddModal(item)}
          >
            <Text style={styles.addToInvButtonText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.neededTag}>✓</Text>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/grid_paper.jpg")}
    >
      <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Plan: {recipeName}
          </Text>
        </View>

        <View style={styles.calendarCard}>
          <Text style={styles.sectionLabel}>Select Date to Cook</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#4D693A",
                textColor: "white",
              },
            }}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#b6c1cd",
              selectedDayBackgroundColor: "#4D693A",
              todayTextColor: "#4D693A",
              dayTextColor: "#2d4150",
              arrowColor: "#4D693A",
              monthTextColor: "#4D693A",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
            }}
            style={styles.calendarComponent}
          />
        </View>

        <View style={styles.inventoryCard}>
          <Text style={styles.sectionLabel}>Inventory Check</Text>
          <FlatList
            data={ingredients}
            keyExtractor={(item, index) =>
              `${item.name}-${index}`.toString()
            }
            renderItem={renderIngredient}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (scheduling || missingItems.length > 0) && styles.confirmButtonDisabled,
          ]}
          onPress={handleSchedule}
          disabled={scheduling || missingItems.length > 0}
        >
          {scheduling ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {missingItems.length > 0
                ? "Add missing ingredients to schedule"
                : `Schedule for ${selectedDate}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Add to Inventory Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Inventory</Text>
            {addItem && (
              <ScrollView style={styles.modalForm}>
                <Text style={styles.modalLabel}>Item</Text>
                <Text style={styles.modalValue}>{addItem.name}</Text>

                <Text style={styles.modalLabel}>Quantity *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={addQuantity}
                  onChangeText={setAddQuantity}
                  keyboardType="numeric"
                  placeholder="e.g. 2"
                />

                <Text style={styles.modalLabel}>Unit</Text>
                <TextInput
                  style={styles.modalInput}
                  value={addUnit}
                  onChangeText={setAddUnit}
                  placeholder="e.g. cups, oz"
                />

                <Text style={styles.modalLabel}>Room *</Text>
                <ScrollView horizontal style={styles.roomChips}>
                  {visitedRooms.map((r) => (
                    <TouchableOpacity
                      key={r.name}
                      style={[
                        styles.roomChip,
                        addRoom === r.name && styles.roomChipSelected,
                      ]}
                      onPress={() => setAddRoom(r.name)}
                    >
                      <Text
                        style={[
                          styles.roomChipText,
                          addRoom === r.name && styles.roomChipTextSelected,
                        ]}
                      >
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {visitedRooms.length === 0 && (
                  <Text style={styles.modalHint}>
                    No kitchens yet. Add from Pantry first.
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAddButton, adding && styles.modalAddDisabled]}
                onPress={handleAddToInventory}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.modalAddText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1 },
  mainWrapper: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  calendarCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 360,
  },
  calendarComponent: { borderRadius: 10 },

  inventoryCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ingredientInfo: { flex: 1 },
  ingredientName: { fontSize: 16, fontWeight: "600", color: "#333" },
  ingredientQty: { fontSize: 13, color: "#777" },
  addToInvButton: {
    backgroundColor: "#4D693A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addToInvButtonText: { color: "white", fontWeight: "600", fontSize: 12 },
  neededTag: { fontSize: 12, color: "#4D693A", fontWeight: "bold" },

  confirmButton: {
    backgroundColor: "#4D693A",
    padding: 18,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fcfaf2",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#333" },
  modalForm: { marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: "#666", marginTop: 12, marginBottom: 4 },
  modalValue: { fontSize: 16, color: "#333", marginBottom: 4 },
  modalInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c2b9b2",
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#e8d5c460",
  },
  roomChips: { flexDirection: "row", marginTop: 8, marginBottom: 4 },
  roomChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e8d5c460",
    marginRight: 8,
  },
  roomChipSelected: { backgroundColor: "#4D693A" },
  roomChipText: { fontSize: 14, color: "#333", fontWeight: "500" },
  roomChipTextSelected: { color: "white" },
  modalHint: { fontSize: 12, color: "#999", marginTop: 4 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  modalCancelText: { color: "#666", fontWeight: "600" },
  modalAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#4D693A",
    alignItems: "center",
  },
  modalAddDisabled: { opacity: 0.7 },
  modalAddText: { color: "white", fontWeight: "600" },
});
