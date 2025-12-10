import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";

/**
 * SettingsScreen: User account management
 * - Change username
 * - Change password
 * - Delete account
 * - Logout
 */
export default function SettingsScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(null); // 'changeUsername', 'changePassword', 'deleteAccount', null
  const [formData, setFormData] = useState({
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [processing, setProcessing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Settings",
      headerLeft: () => (
        <CustomBackButton onPress={() => navigation.goBack()} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem("username");
      if (savedUsername) setUsername(savedUsername);
    } catch (err) {
      console.error("Error loading username:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!formData.newUsername.trim()) {
      Alert.alert("Error", "Please enter a new username");
      return;
    }

    setProcessing(true);
    try {
      const response = await apiClient.put("/users/profile/username", {
        newUsername: formData.newUsername,
      });

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
      const response = await apiClient.put("/users/profile/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

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

  const handleDeleteAccount = async () => {
    if (!formData.currentPassword) {
      Alert.alert("Error", "Please enter your password to confirm deletion");
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setProcessing(true);
            try {
              const response = await apiClient.post("/users/profile/delete", {
                password: formData.currentPassword,
              });

              if (response.data.ok) {
                // Clear storage and navigate to login
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
          style: "destructive",
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
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
        style: "destructive",
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
          <Ionicons name="person-circle" size={64} color="#4D693A" />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userLabel}>Current User</Text>
          </View>
        </View>
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        {/* Change Username */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setModalVisible("changeUsername")}
        >
          <View style={styles.settingContent}>
            <Ionicons name="person" size={24} color="#4D693A" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Change Username</Text>
              <Text style={styles.settingDescription}>
                Update your username
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setModalVisible("changePassword")}
        >
          <View style={styles.settingContent}>
            <Ionicons name="key" size={24} color="#4D693A" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDescription}>
                Update your password
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setModalVisible("deleteAccount")}
        >
          <View style={styles.settingContent}>
            <Ionicons name="trash" size={24} color="#ff6b6b" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Delete Account</Text>
              <Text style={styles.settingDescription}>
                Permanently delete your account
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Change Username Modal */}
      {modalVisible === "changeUsername" && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Change Username</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="New username"
              placeholderTextColor="#999"
              value={formData.newUsername}
              onChangeText={(text) =>
                setFormData({ ...formData, newUsername: text })
              }
              editable={!processing}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(null)}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleChangeUsername}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Change Password Modal */}
      {modalVisible === "changePassword" && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Current password"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.currentPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, currentPassword: text })
              }
              editable={!processing}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="New password"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.newPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, newPassword: text })
              }
              editable={!processing}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              editable={!processing}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(null)}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleChangePassword}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Delete Account Modal */}
      {modalVisible === "deleteAccount" && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalWarning}>
              This action cannot be undone. All your data will be permanently
              deleted.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter your password to confirm"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.currentPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, currentPassword: text })
              }
              editable={!processing}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(null)}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#ff6b6b" }]}
                onPress={handleDeleteAccount}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2ECD5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
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
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  userLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
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
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  settingDescription: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
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
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: "#E8DCC8",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  modalWarning: {
    fontSize: 14,
    color: "#ff6b6b",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4D693A",
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
