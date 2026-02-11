import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const IngredientStatus = ({ comparison, onAddMissing }) => {
  if (!comparison) return null;

  const missingItems = comparison.ingredientsStatus.filter(i => i.isMissing);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingredient Check</Text>
      
      {comparison.ingredientsStatus.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.name, item.isMissing ? styles.missingText : styles.haveText]}>
            {item.name} ({item.current}/{item.required} {item.unit})
          </Text>
          {item.isMissing && <Text style={styles.warningTag}>Missing {item.missingAmount}</Text>}
        </View>
      ))}

      {missingItems.length > 0 && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onAddMissing(missingItems)}
        >
          <Text style={styles.buttonText}>Add {missingItems.length} items to Grocery List</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#fff', borderRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  missingText: { color: '#d9534f', fontWeight: 'bold' },
  haveText: { color: '#5cb85c' },
  addButton: { backgroundColor: '#0275d8', padding: 12, borderRadius: 5, marginTop: 15 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' }
});