import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Calendar } from 'react-native-calendars';
import apiClient from "../lib/apiClient";

export default function ScheduleView({ navigation }) {
  const [mealPlans, setMealPlans] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayItems, setDayItems] = useState([]);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const res = await apiClient.get('/mealplans'); 
      // Convert array to object for Calendar marking: { '2023-10-01': { marked: true } }
      const marked = {};
      res.data.forEach(plan => {
        marked[plan.date] = { marked: true, dotColor: '#4D693A' };
      });
      setMealPlans(marked);
      
      // Filter items for initial selected date
      setDayItems(res.data.filter(p => p.date === selectedDate));
    } catch (err) {
      console.error("Error fetching plans", err);
    }
  };

  const handleMarkAsCooked = async (planId) => {
    try {
      await apiClient.patch(`/mealplans/complete/${planId}`);
      Alert.alert("Enjoy your meal!", "Inventory has been updated.");
      fetchMealPlans(); // Refresh the list
    } catch (err) {
      Alert.alert("Error", "Could not update inventory.");
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={{
          ...mealPlans,
          [selectedDate]: { ...mealPlans[selectedDate], selected: true, selectedColor: '#4D693A' }
        }}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          // In a real app, you'd filter the fetched mealPlans state here
        }}
        theme={{
          todayTextColor: '#4D693A',
          arrowColor: '#4D693A',
        }}
      />

      <View style={styles.agendaContainer}>
        <Text style={styles.agendaTitle}>Meals for {selectedDate}</Text>
        <FlatList
          data={dayItems}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No meals planned for this day.</Text>}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <View>
                <Text style={styles.mealName}>{item.recipeName}</Text>
                <Text style={styles.statusText}>Status: {item.status}</Text>
              </View>
              {item.status === 'planned' && (
                <TouchableOpacity 
                  style={styles.cookButton} 
                  onPress={() => handleMarkAsCooked(item._id)}
                >
                  <Text style={styles.cookButtonText}>Cooked</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
    </View>
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
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});