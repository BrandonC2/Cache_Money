import React, { useRef, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * CameraScreen: Capture receipt photos
 * - iPhone-like camera interface
 * - After capture, navigates to ReceiptReviewScreen for item editing
 * - User can retake or proceed with manual OCR text entry
 */
export default function CameraScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Request camera permission if not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#53B175" />
        <Text style={styles.loadingText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.description}>We need camera access to scan receipts</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (isProcessing || !cameraRef.current) return;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo || !photo.uri) {
        Alert.alert("Error", "Failed to capture photo");
        setIsProcessing(false);
        return;
      }

      // Get the room name from AsyncStorage
      const roomName = await AsyncStorage.getItem("lastRoom");

      // NOTE: Real OCR integration is pending. Instead of showing a mock
      // auto-generated list, we pass the captured photo URI to the review
      // screen and leave rawText empty so the user can enter or trigger OCR
      // from the backend in a future integration.
      navigation.navigate("ReceiptReview", {
        photoUri: photo.uri,
        rawText: "",
        roomName: roomName || "",
      });
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Failed to process photo: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualEntry = async () => {
    // Get the room name from AsyncStorage for manual entry too
    const roomName = await AsyncStorage.getItem("lastRoom");
    navigation.navigate("ReceiptReview", {
      photoUri: null,
      rawText: "",
      roomName: roomName || "",
    });
  };

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />

      {/* Crosshair overlay for receipt framing */}
      <View style={styles.crosshairContainer}>
        <View style={styles.crosshair} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Position receipt within frame
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleTakePhoto}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={handleManualEntry}
        >
          <Text style={styles.manualEntryText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#53B175",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  crosshairContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -150 }],
  },
  crosshair: {
    width: 200,
    height: 300,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
  },
  instructionsContainer: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#53B175",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  manualEntryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "white",
  },
  manualEntryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
