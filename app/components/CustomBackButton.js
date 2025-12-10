import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomBackButton({ onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={onPress}
    >
      <Ionicons name="chevron-back" size={20} color="#3D2817" />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8D5C4',
    borderWidth: 1.5,
    borderColor: '#3D2817',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D2817',
    letterSpacing: 0.3,
  },
});
