import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground } from "react-native";
import { Calendar } from 'react-native-calendars';
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";

/* Will do the following:
    - allocate items from kitchen to create a meal/recipe
    - add items to grocery list if flagged by user
    - Provide a date/range for when to cook
    - Screen design should be an interactive calender*/
    
export default function MealPrepScreen({ route, navigation }) {
  const { recipeId, recipeName, ingredients } = route.params; // Passed from Recipe Detail
  const [inventory, setInventory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [missingItems, setMissingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get('/inventory'); // Get all user items
      setInventory(res.data);
      calculateMissing(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load inventory");
    } finally {
      setLoading(false);
    }
  };

  const calculateMissing = (currentInventory) => {
    const missing = ingredients.filter(req => {
      const invItem = currentInventory.find(inv => 
        inv.name.toLowerCase() === req.name.toLowerCase()
      );
      return !invItem || invItem.quantity < req.quantity;
    });
    setMissingItems(missing);
  };

  const handleConfirmPlan = async () => {
    try {
      // 1. Add missing items to Grocery List if they exist
      if (missingItems.length > 0) {
        await apiClient.post('/grocery/add-missing', { items: missingItems });
      }

      // 2. Save the Meal Plan (The Calendar Entry)
      await apiClient.post('/mealplans', {
        recipeId,
        date: selectedDate,
        recipeName
      });

      Alert.alert("Success", "Meal scheduled! Missing items added to shopping list.");
      navigation.navigate("CalendarView"); // Navigate to your main calendar
    } catch (err) {
      Alert.alert("Error", "Failed to save meal plan.");
    }
  };

  return (
    <ImageBackground style={styles.background} source={require("../assets/grid_paper.jpg")}>
      <ScrollView style={styles.container}>
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Plan: {recipeName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>1. Select Date to Cook</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: '#4D693A' } }}
            theme={{ todayTextColor: '#4D693A', arrowColor: '#4D693A' }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>2. Inventory Check</Text>
          {ingredients.map((item, index) => {
            const isMissing = missingItems.some(m => m.name === item.name);
            return (
              <View key={index} style={styles.ingredientRow}>
                <Text style={isMissing ? styles.missingText : styles.haveText}>
                  {isMissing ? "❌" : "✅"} {item.name} ({item.quantity} {item.unit})
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPlan}>
          <Text style={styles.confirmButtonText}>Confirm Meal Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  section: { padding: 20, backgroundColor: '#ffffff90', margin: 10, borderRadius: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  ingredientRow: { paddingVertical: 5 },
  missingText: { color: '#d32f2f' },
  haveText: { color: '#388e3c' },
  confirmButton: { backgroundColor: '#4D693A', padding: 15, margin: 20, borderRadius: 8, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});
