import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function CookModeScreen({ route, navigation }) {
  const { recipe } = route.params;
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const instructions = recipe.instructions || [];
  const currentStep = instructions[currentIndex];
  const totalSteps = instructions.length;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  const nextStep = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack(); // Or a "Finished" screen
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (totalSteps === 0) return <Text>No instructions found.</Text>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.exitText}>Exit Cook Mode</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>
          Step {currentIndex + 1} of {totalSteps}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Step Image */}
        <View style={styles.imageWrapper}>
          {currentStep.imageUri ? (
            <Image source={{ uri: currentStep.imageUri }} style={styles.stepImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No photo for this step</Text>
            </View>
          )}
        </View>

        {/* Instruction Text */}
        <View style={styles.textWrapper}>
          <Text style={styles.instructionText}>
            {currentStep.description}
          </Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={[styles.footer, { marginBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]} 
          onPress={prevStep}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
          <Text style={styles.nextBtnText}>
            {currentIndex === totalSteps - 1 ? "Finish" : "Next Step"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  progressContainer: { height: 6, backgroundColor: "#EEE", width: "100%" },
  progressBar: { height: "100%", backgroundColor: "#4D693A" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 20, 
    alignItems: "center" 
  },
  exitText: { color: "#888", fontWeight: "600" },
  stepCounter: { fontWeight: "bold", color: "#4D693A" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 20 },
  imageWrapper: { 
    width: width - 40, 
    height: 300, 
    borderRadius: 20, 
    overflow: "hidden", 
    backgroundColor: "#F5F5F5",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 30
  },
  stepImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#AAA", fontStyle: "italic" },
  textWrapper: { width: "100%" },
  instructionText: { 
    fontSize: 22, 
    lineHeight: 32, 
    color: "#333", 
    textAlign: "center",
    fontWeight: "500"
  },
  footer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 20 
  },
  navBtn: { 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 15, 
    backgroundColor: "#F0F0F0" 
  },
  nextBtn: { 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 15, 
    backgroundColor: "#4D693A" 
  },
  navBtnText: { color: "#666", fontWeight: "bold", fontSize: 16 },
  nextBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  disabledBtn: { opacity: 0.3 },
});