import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useLayoutEffect } from "react";
import { 
  ImageBackground, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text, 
  TextInput, 
  ScrollView,
  Alert,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_BASE from '../config/api';

export default function KitchenHomepage() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [password, setPassword] = useState('');
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomPassword, setEditRoomPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Hide header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Load username and visited rooms (per-user)
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
          const roomsStr = await AsyncStorage.getItem(`visitedRooms_${storedUsername}`);
          if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));
          else setVisitedRooms([]);
        }
      } catch (e) {
        Alert.alert('Error','Failed to load data: ' + e.message);
      }
    };
    loadData();
  }, []);

  // Save visited room with password
  const saveVisitedRoom = async (room, password) => {
    try {
      const currentUsername = username || (await AsyncStorage.getItem('username'));
      const key = `visitedRooms_${currentUsername}`;
      const roomsStr = await AsyncStorage.getItem(key);
      let rooms = roomsStr ? JSON.parse(roomsStr) : [];
      const existing = rooms.find(r => r.name === room);
      if (!existing) {
        rooms.push({ name: room, password });
        await AsyncStorage.setItem(key, JSON.stringify(rooms));
        setVisitedRooms(rooms);
      }
    } catch (e) {
      Alert.alert('Error','Failed to save visited room: ' + e.message);
    }
  };

  // Create room
  const createRoom = async () => {
    if (!username) {
      Alert.alert('Error', 'User not loaded. Please log in again.');
      return;
    }
    const trimmedName = kitchenName.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedPassword) {
      Alert.alert('Error', 'Please enter a room name and password');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/kitchens/create`, {
        name: trimmedName,
        password: trimmedPassword,
        createdBy: username,
      });

      Alert.alert('Success', res.data.message);

      // Save room with password
      await saveVisitedRoom(trimmedName, trimmedPassword);

      // Autofill inputs so join works immediately
      setKitchenName(trimmedName);
      setPassword(trimmedPassword);

      navigation.navigate('KitchenCollection', { roomName: trimmedName, username });
    } catch (err) {
      // console.error('Create room error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const joinRoom = async () => {
  if (!username) {
    Alert.alert('Error', 'User not loaded. Please log in again.');
    return;
  }
  if (!kitchenName || !password) {
    Alert.alert('Error', 'Please enter a room name and password');
    return;
  }

  try {
    const res = await axios.post(`${API_BASE}/api/kitchens/join`, {
      name: kitchenName.trim(),  // trim to match backend
      password: password.trim(), // trim to match backend
      username: username.trim(),
    });

    Alert.alert('Success', res.data.message);
    await saveVisitedRoom(kitchenName.trim(), password.trim());

    navigation.navigate('KitchenCollection', { roomName: kitchenName.trim(), username });
  } catch (err) {
    console.error('Join room error:', err.response?.data || err.message);
    Alert.alert('Error', err.response?.data?.message || err.message);
  }
};


  // Quick join using visited rooms
  const quickJoin = async (room) => {
    if (!room.password) {
      Alert.alert('Error', 'No password stored for this room.');
      return;
    }
    if (!username) {
      Alert.alert('Error', 'User not loaded. Please log in again.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/kitchens/join`, {
        name: room.name.trim(),
        password: room.password.trim(),
        username: username.trim(),
      });

      Alert.alert('Success', res.data.message);
      navigation.navigate('KitchenCollection', { roomName: room.name.trim(), username });
    } catch (err) {
      console.error('Quick join room error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('username');
      navigation.navigate('Login');
    } catch (error) {
      // console.error('Logout error:', error);
      Alert.alert('Error','Logout error: ' + error.message);
    }
  };

  // Edit room: open modal and load room details
  const openEditRoomModal = (index) => {
    setEditingRoomIndex(index);
    setEditRoomName(visitedRooms[index].name);
    setEditRoomPassword(visitedRooms[index].password);
    setShowEditModal(true);
  };

  // Save room edits
  const saveRoomEdits = async () => {
    if (!editRoomName.trim()) {
      Alert.alert('Error', 'Room name cannot be empty');
      return;
    }
    const currentUsername = username || (await AsyncStorage.getItem('username'));
    const key = `visitedRooms_${currentUsername}`;
    const updatedRooms = [...visitedRooms];
    updatedRooms[editingRoomIndex] = {
      name: editRoomName.trim(),
      password: editRoomPassword.trim(),
    };
    setVisitedRooms(updatedRooms);
    await AsyncStorage.setItem(key, JSON.stringify(updatedRooms));
    setShowEditModal(false);
    Alert.alert('Success', 'Room updated');
  };

  // Delete room
  const deleteRoom = (index) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${visitedRooms[index].name}"?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const currentUsername = username || (await AsyncStorage.getItem('username'));
            const key = `visitedRooms_${currentUsername}`;
            const updatedRooms = visitedRooms.filter((_, i) => i !== index);
            setVisitedRooms(updatedRooms);
            await AsyncStorage.setItem(key, JSON.stringify(updatedRooms));
            Alert.alert('Success', 'Room deleted');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ImageBackground 
        style={styles.background}
        source={require("../assets/grid_paper.png")}
    >
      {/* Settings button - Top right corner */}
      <TouchableOpacity 
        style={styles.settingsButtonTopRight} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings" size={28} color="#4D693A" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {username ? `Welcome, ${username}!` : 'Cooking Crazy 4 U'}
      </Text>
      <View style={styles.Box}>
      {/* Create/Join Room Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Room name"
          value={kitchenName}
          onChangeText={setKitchenName}
          autoCapitalize="none"
          style={styles.input}
        />
      <View style={styles.line} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          style={styles.input}
        />
      <View style={styles.line} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity style={styles.button} onPress={createRoom}>
            <Text style={styles.buttonText}>Create Room</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={joinRoom}>
            <Text style={styles.buttonText}>Join Room</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.line, {left: 1, bottom: 0}]} />
      {/* <View style={styles.separator} /> */}
      {/* Recently Visited Rooms - Larger scrollable section */}
      <View style={styles.recentlyVisitedContainer}>
        <Text style={styles.recentlyVisitedTitle}>Recently Visited Kitchens:</Text>
        {visitedRooms.length === 0 ? (
          <Text style={styles.emptyText}>No recently visited rooms yet</Text>
        ) : (
          <ScrollView 
            style={styles.roomsScrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {visitedRooms.map((room, index) => (
              <View key={index} style={styles.roomItemWrapper}>
                <TouchableOpacity
                  onPress={() => quickJoin(room)}
                  style={styles.quickJoinButton}
                >
                  <View style={styles.quickJoinContent}>
                    <Text style={styles.quickJoinText}>{room.name}</Text>
                    <Text style={styles.quickJoinSubtext}>Tap to quick join</Text>
                  </View>
                  <Text style={styles.quickJoinArrow}>→</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      </View>

      {/* Edit Room Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Room</Text>
            
            <Text style={styles.modalLabel}>Room Name</Text>
            <TextInput
              value={editRoomName}
              onChangeText={setEditRoomName}
              autoCapitalize="none"
              style={styles.modalInput}
              placeholder="Enter new room name"
            />
            
            <Text style={styles.modalLabel}>Room Password</Text>
            <TextInput
              value={editRoomPassword}
              onChangeText={setEditRoomPassword}
              autoCapitalize="none"
              style={styles.modalInput}
              placeholder="Enter new password"
              secureTextEntry
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    justifyContent: "flex-start", 
    alignItems: "center", 
    paddingTop: 60,
    paddingBottom: 20,
  },
  settingsButtonTopRight: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  title: { fontSize: 30, fontWeight: '600', color: '#333', marginBottom: 20 },
  inputContainer: { width: '100%',paddingHorizontal: 20, },
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: 'transparent'
  },
  button: {
    flex: 1,
    backgroundColor: '#4D693A',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  recentlyVisitedContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  recentlyVisitedTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  roomsScrollView: {
    flex: 1,
    width: '100%',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickJoinButton: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  quickJoinContent: {
    flex: 1,
  },
  quickJoinText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  quickJoinSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  quickJoinArrow: {
    color: '#4D693A',
    fontSize: 18,
    marginLeft: 12,
  },
  Box: {
    flex: 1, 
    width: '90%',
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderRadius: 15,
    borderColor: "black",
    paddingBottom: 5, 
    marginBottom: 10,
  },
  line: {
    width: 366,
    backgroundColor: 'black',
    right: 19,
    marginVertical: 3,
    height: 1,
  },
  roomItemWrapper: {
    marginBottom: 10,
  },
  roomActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF5252',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4D693A',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
