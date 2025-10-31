// SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';
import { Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          console.log('Valid token found, redirecting to KitchenHome');
          navigation.replace('KitchenHome');
        } else {
          console.log('No token found, redirecting to Login');
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking login:', error);
        navigation.replace('Login');
      }
    };
    Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  }).start();
    // Simulate small delay for UX polish (optional)
    const timeout = setTimeout(checkLoginStatus, 1000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
    <Image source={require('../assets/Just_Icon.png')} style={styles.logo} />
    <Text style={styles.text}>Cache Money Made</Text>
    </Animated.View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
});
