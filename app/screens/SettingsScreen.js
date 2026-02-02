import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";

export default function SettingsScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(""); // Profile picture URL
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(null); // 'changeUsername', 'changePassword', 'deleteAccount', null
  const [formData, setFormData] = useState({
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [processing, setProcessing] = useState(false);

  // Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Settings",
      headerTitleAlign: "center",
      headerLeft: () => <CustomBackButton onPress={() => navigation.goBack()} />,
    });
  }, [navigation]);

  // Load user profile (username + pfp)
const loadProfile = async () => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("authToken");

    const res = await apiClient.get("/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsername(res.data.username);

    if (res.data.profile) {
      setProfile(
        `${apiClient.defaults.baseURL}/uploads/profile/${res.data.profile}`
      );
    } else {
      setProfile("");
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
    Alert.alert("Error", "Failed to load profile");
  } finally {
    setLoading(false); 
  }
};
  useEffect(() => {
    loadProfile();
  }, []);

  // ------------------------
  // Pick & upload profile image
  // ------------------------
const handlePickImage = async () => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert("Permission required", "Please allow access to your photo library");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || !result.assets[0]) return;

    const imageUri = result.assets[0].uri;
    setProcessing(true);

    const data = new FormData();
    data.append("image", {
      uri: imageUri.startsWith("file://") ? imageUri : "file://" + imageUri,
      name: `profile_${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    const token = await AsyncStorage.getItem("authToken");

    const res = await apiClient.put("/users/profile/picture", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (f) => f,
    });

    if (res.data.ok) {
      // Reload image from MongoDB route
      const userId = res.data.userId || await AsyncStorage.getItem("userId");
      const newUri = `${apiClient.defaults.baseURL}/users/profile/picture/${userId}?t=${Date.now()}`;
      setProfile(newUri);
      Alert.alert("Success", "Profile picture updated!");
    } else {
      Alert.alert("Error", "Failed to update profile picture");
    }

  } catch (err) {
    console.error("Profile image upload error:", err);
    Alert.alert("Error", err.response?.data?.message || "Failed to update profile picture");
  } finally {
    setProcessing(false);
  }
};



  // Change username
  const handleChangeUsername = async () => {
    if (!formData.newUsername.trim()) {
      Alert.alert("Error", "Please enter a new username");
      return;
    }

    setProcessing(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.put(
        "/users/profile/username",
        { newUsername: formData.newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        await AsyncStorage.setItem("username", formData.newUsername);
        setUsername(formData.newUsername);
        Alert.alert("Success", "Username changed successfully");
        setModalVisible(null);
        setFormData({ ...formData, newUsername: "" });
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setProcessing(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await apiClient.put(
        "/users/profile/password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        Alert.alert("Success", "Password changed successfully");
        setModalVisible(null);
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!formData.currentPassword) {
      Alert.alert("Error", "Please enter your password to confirm deletion");
      return;
    }

    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setProcessing(true);
            try {
              const token = await AsyncStorage.getItem("authToken");
              const response = await apiClient.post(
                "/users/profile/delete",
                { password: formData.currentPassword },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (response.data.ok) {
                await AsyncStorage.removeItem("authToken");
                await AsyncStorage.removeItem("username");
                Alert.alert("Account Deleted", "Your account has been deleted");
                navigation.replace("Login");
              }
            } catch (err) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to delete account"
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("username");
            navigation.replace("Login");
          } catch (err) {
            console.error("Logout error:", err);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D693A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.section}>
        <View style={styles.userCard}>
          <TouchableOpacity onPress={handlePickImage} disabled={processing}>
            {profile ? (
              <Image source={{ uri: profile }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle" size={64} color="#4D693A" />
            )}
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userLabel}>Current User</Text>
            <Text style={{ color: "#4D693A", marginTop: 4 }}>Tap image to change</Text>
          </View>
        </View>
      </View>

      {/* Account Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <SettingItem
          icon="person"
          label="Change Username"
          description="Update your username"
          onPress={() => setModalVisible("changeUsername")}
        />

        <SettingItem
          icon="key"
          label="Change Password"
          description="Update your password"
          onPress={() => setModalVisible("changePassword")}
        />

        <SettingItem
          icon="trash"
          label="Delete Account"
          description="Permanently delete your account"
          iconColor="#ff6b6b"
          onPress={() => setModalVisible("deleteAccount")}
        />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {modalVisible === "changeUsername" && (
        <ChangeUsernameModal
          formData={formData}
          setFormData={setFormData}
          processing={processing}
          onClose={() => setModalVisible(null)}
          onSubmit={handleChangeUsername}
        />
      )}

      {modalVisible === "changePassword" && (
        <ChangePasswordModal
          formData={formData}
          setFormData={setFormData}
          processing={processing}
          onClose={() => setModalVisible(null)}
          onSubmit={handleChangePassword}
        />
      )}

      {modalVisible === "deleteAccount" && (
        <DeleteAccountModal
          formData={formData}
          setFormData={setFormData}
          processing={processing}
          onClose={() => setModalVisible(null)}
          onSubmit={handleDeleteAccount}
        />
      )}
    </ScrollView>
  );
}

// ------------------------
// Reusable components (same as before)
const SettingItem = ({ icon, label, description, iconColor = "#4D693A", onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingContent}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

// ------------------------
// Modals
// ------------------------
const ChangeUsernameModal = ({ formData, setFormData, processing, onClose, onSubmit }) => (
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Change Username</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="New username"
        placeholderTextColor="#999"
        value={formData.newUsername}
        onChangeText={(text) => setFormData({ ...formData, newUsername: text })}
        editable={!processing}
      />
      <ModalButtons onClose={onClose} onSubmit={onSubmit} processing={processing} submitText="Save" />
    </View>
  </View>
);

const ChangePasswordModal = ({ formData, setFormData, processing, onClose, onSubmit }) => (
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Change Password</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="Current password"
        placeholderTextColor="#999"
        secureTextEntry
        value={formData.currentPassword}
        onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
        editable={!processing}
      />
      <TextInput
        style={styles.modalInput}
        placeholder="New password"
        placeholderTextColor="#999"
        secureTextEntry
        value={formData.newPassword}
        onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
        editable={!processing}
      />
      <TextInput
        style={styles.modalInput}
        placeholder="Confirm new password"
        placeholderTextColor="#999"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        editable={!processing}
      />
      <ModalButtons onClose={onClose} onSubmit={onSubmit} processing={processing} submitText="Save" />
    </View>
  </View>
);

const DeleteAccountModal = ({ formData, setFormData, processing, onClose, onSubmit }) => (
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Delete Account</Text>
      <Text style={styles.modalWarning}>This action cannot be undone. All your data will be permanently deleted.</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="Enter your password to confirm"
        placeholderTextColor="#999"
        secureTextEntry
        value={formData.currentPassword}
        onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
        editable={!processing}
      />
      <ModalButtons onClose={onClose} onSubmit={onSubmit} processing={processing} submitText="Delete" danger />
    </View>
  </View>
);

const ModalButtons = ({ onClose, onSubmit, processing, submitText, danger = false }) => (
  <View style={styles.modalButtons}>
    <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={processing}>
      <Text style={styles.cancelButtonText}>Cancel</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.submitButton, danger ? { backgroundColor: "#ff6b6b" } : {}]}
      onPress={onSubmit}
      disabled={processing}
    >
      {processing ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.submitButtonText}>{submitText}</Text>}
    </TouchableOpacity>
  </View>
);

// ------------------------
// Styles (same as your previous)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2ECD5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 12 },
  userCard: {
    backgroundColor: "#E8DCC8",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileImage: { width: 64, height: 64, borderRadius: 32 },
  userInfo: { marginLeft: 16 },
  username: { fontSize: 20, fontWeight: "700", color: "#333" },
  userLabel: { fontSize: 14, color: "#666", marginTop: 4 },
  settingItem: {
    backgroundColor: "#E8DCC8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  settingText: { marginLeft: 16, flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  settingDescription: { fontSize: 13, color: "#999", marginTop: 4 },
  logoutButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  modal: { backgroundColor: "#E8DCC8", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 16 },
  modalWarning: { fontSize: 14, color: "#ff6b6b", marginBottom: 16, lineHeight: 20 },
  modalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14, color: "#333" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, alignItems: "center" },
  cancelButtonText: { color: "#333", fontWeight: "600", fontSize: 14 },
  submitButton: { flex: 1, paddingVertical: 12, backgroundColor: "#4D693A", borderRadius: 8, alignItems: "center" },
  submitButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
});