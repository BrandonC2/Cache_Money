import React, { useState, useLayoutEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";

export default function RecipeMaker({ navigation }) {
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const scaleRecipe = (factor) => {
    if (!selectedRecipe) return;

    const scaled = {
      ...selectedRecipe,
      servings: selectedRecipe.servings * factor,
    };
    setSelectedRecipe(scaled);
  };

  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/grid_paper.jpg")}
    >
      
      {/* top basket logo */}
      <View style={styles.logoArea}>
        <Image
          source={require("../assets/basket.png")}
          style={styles.logo}
        />
      </View>

      <Text style={styles.pageTitle}>Your Recipes</Text>

      {/* GRID LIST OF RECIPES */}
      <FlatList
        numColumns={3}
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => openRecipeModal(item)}
          >
            <Image source={item.image} style={styles.recipeIcon} />
            <Text style={styles.recipeName} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* RECIPE MODAL */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>{selectedRecipe?.name}</Text>
            <Text style={styles.modalSubtitle}>
              Servings: {selectedRecipe?.servings}
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.sectionHeader}>Ingredients</Text>
              {selectedRecipe?.ingredients.map((i, idx) => (
                <Text key={idx} style={styles.sectionItem}>
                  • {i.name}: {i.qty}
                </Text>
              ))}

              <Text style={styles.sectionHeader}>Steps</Text>
              {selectedRecipe?.steps.map((s, idx) => (
                <Text key={idx} style={styles.sectionItem}>
                  {idx + 1}. {s}
                </Text>
              ))}
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.scaleButton}
                onPress={() => scaleRecipe(0.5)}
              >
                <Text style={styles.scaleText}>½ Servings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scaleButton}
                onPress={() => scaleRecipe(2)}
              >
                <Text style={styles.scaleText}>×2 Servings</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

/* ------- SAMPLE DATA (you can replace with API fetch later) ------- */
const sampleRecipes = [
  {
    id: "1",
    name: "Chicken Stir Fry",
    image: require("../assets/ye.png"),
    servings: 2,
    ingredients: [
      { name: "Chicken Breast"},
      { name: "Bell Pepper"},
      //{ name: "Soy Sauce", qty: "2 tbsp" },
    ],
    steps: [
      "Slice chicken and vegetables.",
      "Heat pan and stir fry ingredients.",
      "Add soy sauce and simmer.",
    ],
  },
];

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  logoArea: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  pageTitle: {
    fontFamily: "alexandria_bold",
    fontSize: 32,
    color: "#785D49",
    marginTop: 30,
    marginBottom: 20,
  },
  gridContainer: {
    paddingHorizontal: 10,
  },
  gridItem: {
    width: 300,
    height: 100,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  recipeIcon: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionItem: {
    fontSize: 15,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  scaleButton: {
    backgroundColor: "#E6D7C6",
    padding: 10,
    borderRadius: 8,
  },
  scaleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 12,
    backgroundColor: "#785D49",
    borderRadius: 10,
  },
  closeText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
