import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE from "../config/api";

export default function KitchenCollection({ navigation }) {
  const [username, setUsername] = useState("");
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomItems, setRoomItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    if (selectedRoom) loadRoomItems(selectedRoom);
  });
  return unsubscribe;
}, [navigation, selectedRoom]);
  // Load user data and visited rooms
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        const roomsStr = await AsyncStorage.getItem("visitedRooms");
        if (storedUsername) setUsername(storedUsername);
        if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
  }, []);

  // Fetch items in the selected room
  const loadRoomItems = async (roomName) => {
    setSelectedRoom(roomName);
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/inventory/room/${roomName}`);
      setRoomItems(res.data);
    } catch (err) {
      console.error("Error loading items:", err.response?.data || err.message);
    }
    setLoading(false);
  };

  // Go back to list of rooms
  const handleBack = () => {
    setSelectedRoom(null);
    setRoomItems([]);
  };

  // --- If user has selected a room, show its items ---
  if (selectedRoom) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backText}>← Back to Kitchens</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Items in {selectedRoom}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4D693A" />
        ) : roomItems.length === 0 ? (
          <Text style={styles.emptyText}>No items in this kitchen yet.</Text>
        ) : (
          <FlatList
            data={roomItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemInfo}>🍽 {item.foodGroup}</Text>
                {item.expirationDate && (
                  <Text style={styles.itemInfo}>
                    ⏰ {new Date(item.expirationDate).toDateString()}
                  </Text>
                )}
                {item.description ? (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                ) : null}
              </View>
            )}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("ManualAdd", { roomName: selectedRoom })}
        >
          <Text style={styles.addText}>➕ Add Item</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Otherwise, show list of kitchens ---
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("KitchenHome")}>
        <Text style={styles.backText}>← Return</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Kitchens</Text>

      <FlatList
        data={visitedRooms}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => loadRoomItems(item)}
            style={styles.roomButton}
          >
            <Text style={styles.roomText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  header: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  backText: { fontSize: 16, color: "#007bff", marginBottom: 10 },
  roomButton: {
    padding: 14,
    backgroundColor: "#4D693A",
    borderRadius: 10,
    marginVertical: 6,
  },
  roomText: { color: "white", fontSize: 18, fontWeight: "bold" },
  itemCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  itemName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  itemInfo: { fontSize: 15, color: "#555" },
  itemDesc: { fontStyle: "italic", color: "#666", marginTop: 4 },
  addButton: {
    backgroundColor: "#4D693A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addText: { color: "white", fontSize: 16, fontWeight: "bold" },
  emptyText: { color: "#777", fontSize: 16, marginTop: 20 },
});
