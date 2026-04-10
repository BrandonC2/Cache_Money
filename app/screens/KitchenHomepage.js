import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import API_BASE from '../config/api';
import apiClient from '../lib/apiClient';

const OLIVE = "#5d5f4a";
const OLIVE_DARK = "#4a4c3a";
const OLIVE_MUTED = "#6b6d56";
const OLIVE_MUTED_DARK = "#5a5c48";
const CREAM = "#e8e4db";
const INK = "#2d2e26";
const BG = "#dcd8cc";

export default function KitchenHomepage() {
  const navigation = useNavigation();

  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [password, setPassword] = useState('');
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomPassword, setEditRoomPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const loadAllData = async () => {
        try {
          const storedUsername = await AsyncStorage.getItem('username');
          const localPic = await AsyncStorage.getItem('profilePicture');

          if (storedUsername) {
            setUsername(storedUsername);
            if (localPic) setProfilePic(localPic);
            const roomsStr = await AsyncStorage.getItem(`visitedRooms_${storedUsername}`);
            if (roomsStr) setVisitedRooms(JSON.parse(roomsStr));

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
    if (!username || !kitchenName.trim() || !password.trim()) {
      return Alert.alert('Error', 'Missing info');
    }
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE}/api/kitchens/create`, {
        name: kitchenName.trim(),
        password: password.trim(),
        createdBy: username,
      }, headers);
      await saveVisitedRoom(kitchenName.trim(), password.trim());
      navigation.navigate('KitchenCollection', { roomName: kitchenName.trim(), username });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const joinRoom = async () => {
    if (!kitchenName.trim() || !password.trim()) {
      return Alert.alert('Error', 'Enter room name and password');
    }
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE}/api/kitchens/join`, {
        name: kitchenName.trim(),
        password: password.trim(),
        username: username.trim(),
      }, headers);
      await saveVisitedRoom(kitchenName.trim(), password.trim());
      navigation.navigate('KitchenCollection', { roomName: kitchenName.trim(), username });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const quickJoin = async (room) => {
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE}/api/kitchens/join`, {
        name: room.name.trim(),
        password: room.password.trim(),
        username: username.trim(),
      }, headers);
      await saveVisitedRoom(room.name.trim(), room.password.trim());
      navigation.navigate('KitchenCollection', { roomName: room.name.trim(), username });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.85}
          >
            {profilePic ? (
              <Image
                source={{ uri: `${profilePic}?t=${Date.now()}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={24} color={CREAM} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={12}>
            <Ionicons name="settings-outline" size={28} color={OLIVE} />
          </TouchableOpacity>
        </View>

        <View style={styles.basketWrap}>
          <Image source={require('../assets/basket.png')} style={styles.basket} resizeMode="contain" />
        </View>

        <View style={styles.formBlock}>
          <TextInput
            placeholder="Room Name"
            placeholderTextColor={`${OLIVE}66`}
            value={kitchenName}
            onChangeText={setKitchenName}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={`${OLIVE}66`}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            style={styles.input}
          />
          <View style={styles.createJoinRow}>
            <TouchableOpacity style={[styles.btnCreate, styles.btnCreateFlex]} onPress={createRoom} activeOpacity={0.9}>
              <Text style={styles.btnCreateText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnJoin, styles.btnJoinFlex]} onPress={joinRoom} activeOpacity={0.9}>
              <Text style={styles.btnJoinText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recently Visited Kitchens:</Text>
          {visitedRooms.length === 0 ? (
            <Text style={styles.emptyText}>No recently visited rooms yet</Text>
          ) : (
            <ScrollView
              style={styles.roomsScroll}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {visitedRooms.map((room, index) => (
                <TouchableOpacity
                  key={`${room.name}-${index}`}
                  onPress={() => quickJoin(room)}
                  style={styles.roomPill}
                  activeOpacity={0.9}
                >
                  <Text style={styles.roomPillText}>{room.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <Text style={styles.usernameFooter}>
          {username ? username : 'Cooking Crazy 4 U'}
        </Text>
      </View>

      <Modal
        visible={showEditModal}
        transparent
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
                style={[styles.modalButton, styles.modalCancel, styles.modalBtnHalf]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSave, styles.modalBtnHalf]} onPress={saveRoomEdits}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, paddingHorizontal: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: OLIVE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  basketWrap: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  basket: { width: 100, height: 80 },
  formBlock: { marginBottom: 24 },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(93,95,74,0.2)',
    borderRadius: 10,
    fontSize: 16,
    color: INK,
  },
  createJoinRow: { flexDirection: 'row' },
  btnCreateFlex: { flex: 1, marginRight: 6 },
  btnJoinFlex: { flex: 1, marginLeft: 6 },
  btnCreate: {
    paddingVertical: 14,
    backgroundColor: OLIVE,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  btnCreateText: { color: CREAM, fontSize: 16, fontWeight: '600' },
  btnJoin: {
    paddingVertical: 14,
    backgroundColor: OLIVE_MUTED,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  btnJoinText: { color: CREAM, fontSize: 16, fontWeight: '600' },
  recentSection: { flex: 1, minHeight: 120 },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    marginBottom: 12,
  },
  roomsScroll: { flex: 1 },
  emptyText: { color: `${INK}99`, fontSize: 14, fontStyle: 'italic' },
  roomPill: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(93,95,74,0.2)',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  roomPillText: { fontSize: 16, fontWeight: '600', color: INK },
  usernameFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: `${INK}99`,
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CREAM,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: INK, marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: INK, marginBottom: 8, marginTop: 8 },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(93,95,74,0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: INK,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  modalButtonRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' },
  modalBtnHalf: { width: '48%' },
  modalButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalSave: { backgroundColor: OLIVE },
  modalCancel: { backgroundColor: 'rgba(93,95,74,0.15)' },
  modalButtonText: { color: CREAM, fontWeight: '600', fontSize: 15 },
  modalButtonTextDark: { color: OLIVE, fontWeight: '600', fontSize: 15 },
});
