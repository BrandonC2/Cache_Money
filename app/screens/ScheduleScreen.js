import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,  } from "react-native";
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../lib/apiClient";

export default function ScheduleView({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});
  const [allPlans, setAllPlans] = useState([]);
  const [inventory, setInventory] = useState([]); // New state for expiry items
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayItems, setDayItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Filter both meals and expiring items for the selected day
  useEffect(() => {
    const meals = allPlans.filter((p) => p.date === selectedDate);
    const dateStr = selectedDate;
    const expires = inventory.filter((i) => {
      const exp = i.expirationDate || i.expiryDate;
      if (!exp) return false;
      const d = typeof exp === 'string' ? exp.split('T')[0] : exp.toISOString?.().split('T')[0];
      return d === dateStr;
    });
    setDayItems({ meals, expires });
  }, [selectedDate, allPlans, inventory]);

  const fetchData = async () => {
    try {
      const [mealRes, invRes] = await Promise.all([
        apiClient.get('/mealplans'),
        apiClient.get('/mealplans/inventory')
      ]);

      const plans = mealRes.data || [];
      const items = invRes.data || [];
      
      setAllPlans(plans);
      setInventory(items);

      // Create the combined marking object
      const marked = {};

      // Add Meal Dots
      plans.forEach((plan) => {
        marked[plan.date] = { 
          dots: [{ key: 'meal', color: '#4D693A' }] 
        };
      });

      // Add Expiry Dots (Red)
      items.forEach((item) => {
        const date = item.expiryDate;
        if (!marked[date]) {
          marked[date] = { dots: [] };
        }
        // Avoid duplicate dots for the same category if you prefer
        if (!marked[date].dots.find(d => d.key === 'expiry')) {
          marked[date].dots.push({ key: 'expiry', color: '#D9534F' });
        }
      });

      setMarkedDates(marked);
    } catch (err) {
      if (err.response) {
        // The server responded with a status code (404, 500, etc.)
        console.error("Data:", err.response.data);
        console.error("Status:", err.response.status);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received. Check your server/network.");
      } else {
        console.error("Error setting up request:", err.message);
      }
      Alert.alert("Sync Error", "Could not load your pantry items.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        markingType={'multi-dot'} // Required for multiple dots
        markedDates={{
          ...markedDates,
          [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: '#E8F0E5', selectedTextColor: '#4D693A' }
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{ todayTextColor: '#4D693A', arrowColor: '#4D693A' }}
      />

      <View style={styles.agendaContainer}>
        <Text style={styles.agendaTitle}>Schedule for {selectedDate}</Text>
        
        {/* Render Expiring Items First as a Warning */}
        {dayItems.expires?.map(item => (
          <View key={item._id} style={[styles.mealCard, styles.expiryBorder]}>
            <Text style={styles.expiryText}>⚠️ Expiring: {item.name}</Text>
            <Text style={styles.statusText}>{item.room || 'Pantry'}</Text>
          </View>
        ))}

        <FlatList
          data={dayItems.meals}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={dayItems.expires?.length === 0 && <Text style={styles.emptyText}>Nothing scheduled.</Text>}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <View>
                <Text style={styles.mealName}>{item.recipeName}</Text>
                <Text style={styles.statusText}>Status: {item.status}</Text>
              </View>
              {item.status === 'planned' && (
                <TouchableOpacity style={styles.cookButton} onPress={() => handleMarkAsCooked(item._id)}>
                  <Text style={styles.cookButtonText}>Cooked</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  agendaContainer: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  agendaTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  mealCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2 
  },
  mealName: { fontSize: 16, fontWeight: '600' },
  statusText: { color: '#666', fontSize: 12 },
  cookButton: { backgroundColor: '#4D693A', padding: 8, borderRadius: 5 },
  cookButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  expiryBorder: {
    borderLeftWidth: 5,
    borderLeftColor: '#D9534F', // Red warning color
    backgroundColor: '#FFF5F5',
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D9534F',
  },
});