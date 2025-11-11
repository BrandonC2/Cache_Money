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
        if (storedUsername) setUsername(storedUsername);
        const roomsStr = await AsyncStorage.getItem('visitedRooms');
        if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));
      } catch (e) {
        // console.error('Failed to load data', e);
        Alert.alert('Error','Failed to load data: ' + e.message);
        
      }
    };
    loadData();
  }, []);

  // Save visited room with password
  const saveVisitedRoom = async (room, password) => {
    try {
      const roomsStr = await AsyncStorage.getItem('visitedRooms');
      let rooms = roomsStr ? JSON.parse(roomsStr) : [];

      const existing = rooms.find(r => r.name === room);
      if (!existing) {
        rooms.push({ name: room, password });
        await AsyncStorage.setItem('visitedRooms', JSON.stringify(rooms));
        setVisitedRooms(rooms);
      }
    } catch (e) {
      // console.error('Failed to save visited room', e);
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
    setKitchenName(room.name);
    setPassword(room.password);
    joinRoom();
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

  return (
    <ImageBackground 
        style={styles.background}
        source={require("../assets/grid_paper.png")}
    >
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
          style={styles.input}
        />
      <View style={styles.line} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
      {/* Recently Visited Rooms */}
      <ScrollView style={{ width: '100%', marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Recently Visited Kitchens:</Text>
        {visitedRooms.map((room, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => quickJoin(room)}
            style={styles.quickJoinButton}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{room.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>
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
  quickJoinButton: {
    padding: 12,
    backgroundColor: 'transparent',
    borderRadius: 5,
    borderWidth: 1, 
    borderColor: 'black',
    marginBottom: 10,
    alignItems: 'center'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  Box: {
    flex: 1, 
    width: '90%',
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderRadius: 15,
    borderColor: "black",
    paddingBottom: 5, 
    
  },
  line: {
    
    width: 366,
    backgroundColor: 'black',
    right: 19,
    marginVertical: 3,
    height: 1,
    

  }
  

});
