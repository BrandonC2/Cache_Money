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
  Alert
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

  // Hide header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Load username and visited rooms
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const roomsStr = await AsyncStorage.getItem('visitedRooms');
        if (storedUsername) setUsername(storedUsername);
        if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  // Save room to visitedRooms
  const saveVisitedRoom = async (room) => {
    try {
      let rooms = [...visitedRooms];
      if (!rooms.includes(room)) {
        rooms.push(room);
        await AsyncStorage.setItem('visitedRooms', JSON.stringify(rooms));
        setVisitedRooms(rooms);
      }
    } catch (e) {
      console.error('Failed to save visited room', e);
    }
  };

  // Create room
  const createRoom = async () => {
    if (!kitchenName || !password) {
      Alert.alert('Error', 'Please enter a room name and password');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/kitchens/create`, {
        name: kitchenName,
        password
      });
      Alert.alert('Success', res.data.message);
      await saveVisitedRoom(kitchenName);
      navigation.navigate('KitchenCollection', { roomName: kitchenName, username });
    } catch (err) {
      console.error('Create room error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  // Join room
  const joinRoom = async () => {
    if (!kitchenName || !password) {
      Alert.alert('Error', 'Please enter a room name and password');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/kitchens/join`, {
        name: kitchenName,
        password
      });
      Alert.alert('Success', res.data.message);
      await saveVisitedRoom(kitchenName);
      navigation.navigate('KitchenCollection', { roomName: kitchenName, username });
    } catch (err) {
      console.error('Join room error:', err.response?.data || err.message);
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
      console.error('Logout error:', error);
    }
  };

  return (
    <ImageBackground style={styles.background}>
      <Text style={styles.title}>
        {username ? `Welcome, ${username}!` : 'Cooking Crazy 4 U'}
      </Text>

      {/* Create/Join Room Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Room name"
          value={kitchenName}
          onChangeText={setKitchenName}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity style={styles.button} onPress={createRoom}>
            <Text style={styles.buttonText}>Create Room</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={joinRoom}>
            <Text style={styles.buttonText}>Join Room</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recently Visited Rooms */}
      <ScrollView style={{ width: '100%', marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Recently Visited Kitchens:</Text>
        {visitedRooms.map((room, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('KitchenCollection', { roomName: room, username })}
            style={styles.quickJoinButton}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{room}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "flex-start", alignItems: "center", paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '600', color: '#333', marginBottom: 20 },
  inputContainer: { width: '90%' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  button: {
    flex: 1,
    backgroundColor: '#53B175',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  quickJoinButton: {
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  }
});
