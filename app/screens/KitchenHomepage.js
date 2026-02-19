import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback, useLayoutEffect } from "react";
import { 
  Image,
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
import { useFonts } from 'expo-font';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import API_BASE from '../config/api';
import apiClient from '../lib/apiClient';
export default function KitchenHomepage() {
const navigation = useNavigation();
  
  // 1. ALL STATES AT THE TOP
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [password, setPassword] = useState('');
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomPassword, setEditRoomPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  
  // 2. ALL HOOKS BEFORE ANY "RETURN"
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Combined Focus Hook: Refreshes everything whenever screen is shown
  useFocusEffect(
    useCallback(() => {
      const loadAllData = async () => {
        try {
          const storedUsername = await AsyncStorage.getItem('username');
          const localPic = await AsyncStorage.getItem('profilePicture'); 
          
          if (storedUsername) {
            setUsername(storedUsername);
            if (localPic) setProfilePic(localPic); 

            // Sync with backend
            const res = await apiClient.get(`/users/me/${storedUsername}`);
            if (res.data?.profilePicture) {
              setProfilePic(res.data.profilePicture);
              await AsyncStorage.setItem('profilePicture', res.data.profilePicture);
            }
          }
        } catch (e) {
          console.log("Sync error:", e.message);
        }
      };
      loadAllData();
    }, [])
  );

  const [fontsLoaded] = useFonts({
    'alexandria_bold': require('../assets/fonts/alexandria_bold.ttf'),
    'alexandria_regular': require('../assets/fonts/alexandria_regular.ttf'),
    'alexandria_light': require('../assets/fonts/alexandria_light.ttf'),
  });

  // 3. THE CONDITIONAL RETURN (Nothing below this can be a hook!)
  if (!fontsLoaded) return null;

  // --- Functions ---
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const saveVisitedRoom = async (room, pass) => {
    const key = `visitedRooms_${username}`;
    const roomsStr = await AsyncStorage.getItem(key);
    let rooms = roomsStr ? JSON.parse(roomsStr) : [];
    if (!rooms.find(r => r.name === room)) {
      rooms.push({ name: room, password: pass });
      await AsyncStorage.setItem(key, JSON.stringify(rooms));
      setVisitedRooms(rooms);
    }
  };

  const createRoom = async () => {
    if (!username || !kitchenName || !password) return Alert.alert('Error', 'Missing info');
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE}/api/kitchens/create`, {
        name: kitchenName.trim(),
        password: password.trim(),
        createdBy: username,
      }, headers);
      await saveVisitedRoom(kitchenName.trim(), password.trim());
      navigation.navigate('KitchenCollection', { roomName: kitchenName.trim(), username });
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const joinRoom = async () => {
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE}/api/kitchens/join`, {
        name: kitchenName.trim(),
        password: password.trim(),
        username: username.trim(),
      }, headers);
      await saveVisitedRoom(kitchenName.trim(), password.trim());
      navigation.navigate('KitchenCollection', { roomName: kitchenName.trim(), username });
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const quickJoin = async (room) => {
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE}/api/kitchens/join`, {
        name: room.name.trim(),
        password: room.password.trim(),
        username: username.trim(),
      }, headers);
      navigation.navigate('KitchenCollection', { roomName: room.name.trim(), username });
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const saveRoomEdits = async () => {
    const key = `visitedRooms_${username}`;
    const updated = [...visitedRooms];
    updated[editingRoomIndex] = { name: editRoomName.trim(), password: editRoomPassword.trim() };
    setVisitedRooms(updated);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    setShowEditModal(false);
  };

return (
    <ImageBackground 
        style={styles.background}
        source={require("../assets/grid_paper.jpg")}
    >
      <View style = {styles.logoArea}>
        <Image source = {require('../assets/basket.png')} style = {styles.logo}/>
      </View>
      <TouchableOpacity 
        style={styles.profileButtonTopLeft} 
        onPress={() => navigation.navigate('Settings')}
      >
        {profilePic ? (
          <Image 
            key={profilePic} // Forces refresh when URL changes
            source={{ 
              uri: `${profilePic}?t=${new Date().getTime()}` // Fixed variable name to profilePic
            }} 
            style={styles.profileImage} 
          />
      ) : (
        <Ionicons name="person-circle" size={64} color="#4D693A" />
      )}
      </TouchableOpacity>
      {/* Profile Picture / User Icon - Top Left */}
      {/*
      <TouchableOpacity 
        style={styles.profileButtonTopLeft} 
        onPress={() => navigation.navigate('Settings')} // Or a dedicated Profile screen
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle" size={40} color="#4D693A" />
        )}
      </TouchableOpacity>
      */}
      {/* Settings button - Top right corner */}
      <TouchableOpacity 
        style={styles.settingsButtonTopRight} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings" size={28} color="#4D693A" />
      </TouchableOpacity>
    
      
      <View style={styles.Box}>
      {/* Create/Join Room Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Room Name"
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', margin: 3 }}>
          {/* <View style={styles.buttonContainer}> */}
          <TouchableOpacity style={styles.button} onPress={createRoom}>
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={joinRoom}>
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
          {/* </View> */}
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
                    {/* <Text style={styles.quickJoinSubtext}>Tap to quick join</Text> */}
                  </View>
                  {/* <Text style={styles.quickJoinArrow}>→</Text> */}
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
      <Text style={styles.usernamePrint}>
        {username ? `${username}` : 'Cooking Crazy 4 U'}
      </Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
background: { flex: 1, justifyContent: "flex-start", alignItems: "center", paddingTop: 60 },
  
  // NEW STYLES
  profileButtonTopLeft: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#4D693A',
  },
  settingsButtonTopRight: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  Box: { flex: 1, width: '90%', borderWidth: 1.5, borderColor: '#4A3B32', overflow: 'hidden' },
  settingsButtonTopRight: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  title: { fontSize: 30, fontWeight: '600', color: '#333', marginBottom: 20 },
  usernamePrint:  { fontFamily: "alexandria_regular", fontSize: 10, fontWeight: '600', color: '#333', marginBottom:0.1 },
  inputContainer: { width: '100%', paddingHorizontal: 20, },
  input: {
    fontFamily: "alexandria_regular",
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    // marginBottom: 10,
    backgroundColor: 'transparent'
  },
  button: {
    width: 101,   
    height: 32,  
    backgroundColor: '#4D693A',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',

  },
  buttonText: { color: 'white', fontFamily: "alexandria_bold"},
  recentlyVisitedContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  recentlyVisitedTitle: {
    fontFamily: "alexandria_bold",
    fontSize: 18,
    marginBottom: 10,
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
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A3B32',
  
  },
  quickJoinContent: {
    flex: 1,
  },
  quickJoinText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    alignItems: 'center',
    fontFamily: "alexandria_regular",
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
  profileButtonTopLeft: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular image
    borderWidth: 1,
    borderColor: '#4D693A',
  },
  Box: {
    flex: 1, 
  width: '90%',
  borderWidth: 1.5,
  borderColor: '#4A3B32',
  overflow: 'hidden', 
    
  },
  line: {
    width: '115%',
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
  logo: {
    width: 100,
    height: 100,
    position: 'absolute',
    resizeMode: 'contain',
  },
  logoArea: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});