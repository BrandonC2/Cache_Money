import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, ImageBackground, } from "react-native";
import { Calendar } from 'react-native-calendars';
import apiClient from "../lib/apiClient";
import CustomBackButton from "../components/CustomBackButton";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MealPrepScreen({ route, navigation }) {
  const { recipeId, recipeName, ingredients } = route.params;
  const [inventory, setInventory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [missingItems, setMissingItems] = useState([]);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get('/inventory');
      setInventory(res.data);
      calculateMissing(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load inventory");
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

  const renderIngredient = ({ item }) => {
    const isMissing = missingItems.some(m => m.name === item.name);
    return (
      <View style={styles.ingredientRow}>
        <View style={[styles.statusIndicator, { backgroundColor: isMissing ? '#FFCDD2' : '#C8E6C9' }]}>
          <Text style={{ fontSize: 12 }}>{isMissing ? "❌" : "✅"}</Text>
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.name}</Text>
          <Text style={styles.ingredientQty}>{item.quantity} {item.unit}</Text>
        </View>
        {isMissing && <Text style={styles.neededTag}>Missing</Text>}
      </View>
    );
  };

  return (
    <ImageBackground style={styles.background} source={require("../assets/grid_paper.jpg")}>
      <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
        
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          {/* This text will now sit perfectly below the camera */}
          <Text style={styles.headerTitle}>Plan: {recipeName}</Text>
        </View>
        {/* Header - Fixed */}
        <View style={styles.headerBar}>
          <CustomBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle} numberOfLines={1}>Plan: {recipeName}</Text>
        </View>

        {/* 1. Calendar Section - Fixed height */}
        <View style={styles.calendarCard}>
          <Text style={styles.sectionLabel}>Select Date to Cook</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{ 
                [selectedDate]: { selected: true, selectedColor: '#4D693A', textColor: 'white' } 
            }}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#4D693A',
              todayTextColor: '#4D693A',
              dayTextColor: '#2d4150',
              arrowColor: '#4D693A',
              monthTextColor: '#4D693A',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
            }}
            style={styles.calendarComponent}
          />
        </View>

        {/* 2. Inventory Section - Scrollable within bounds */}
        <View style={styles.inventoryCard}>
          <Text style={styles.sectionLabel}>Inventory Check</Text>
          <FlatList
            data={ingredients}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderIngredient}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>

        {/* 3. Confirm Button - Fixed at bottom */}
        <TouchableOpacity style={styles.confirmButton} onPress={() => {/* your handler */}}>
          <Text style={styles.confirmButtonText}>Schedule for {selectedDate}</Text>
        </TouchableOpacity> 
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1 },
  headerBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    marginTop: 40 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#333', flex: 1 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8, textTransform: 'uppercase' },
  
  calendarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // Give calendar a defined footprint
    height: 360, 
  },
  calendarComponent: { borderRadius: 10 },

  inventoryCard: {
    flex: 1, // This takes up the remaining space
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  ingredientRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  statusIndicator: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  ingredientInfo: { flex: 1 },
  ingredientName: { fontSize: 16, fontWeight: '600', color: '#333' },
  ingredientQty: { fontSize: 13, color: '#777' },
  neededTag: { fontSize: 11, color: '#d32f2f', fontWeight: 'bold', backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  confirmButton: { 
    backgroundColor: '#4D693A', 
    padding: 18, 
    marginHorizontal: 15, 
    marginBottom: 20, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});