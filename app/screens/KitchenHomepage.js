import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import apiClient from '../lib/apiClient';
import API_BASE from '../config/api';
/*
import axios from "axios";
const API = "server url"
*/

/* 
  Home Screen functions:
  - Showcases items in grid form
  - search bar to query an item
  - icon taps to add/remove items
  - "bar" to sort items to query

  Necessary:
  - Text description of what constitutes a valid Username/Password
  - Message sent detailing an invalid input (alert possibly)
  - CRUD to save valid inputs
*/


export default function KitchenHomepage({ navigation }) {

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [name, setName] = useState("");
  const [expire, setExpire] = useState("");
  const [desc, setDesc] = useState("");
  const [editId, setEditId] = useState(null);
  
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
        console.log('Loaded username from AsyncStorage:', storedUsername);
      } catch (error) {
        console.error('Failed to load username:', error);
      }
    };
    loadUser();
  }, []);
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('username');
      console.log('✅ Logged out successfully');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <ImageBackground style={styles.background}>
      {/* <DropDownPicker
        open={open}
        value={value}
        items={ingredients}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setIngredients}
        onChangeValue={handleSelect} // ✅ triggered when user picks an item
        placeholder="Select an icon"
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 20,
          justifyContent: "center",
        }}
      >
        {icons.map((iconName, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleRemove(iconName)} // ✅ tap icon to remove
            style={{ margin: 5, alignItems: "center" }}
          >
            <Ionicons name={iconName} size={50} color="blue" />
            <Text>{iconName}</Text>
            {
            //<Text style={{ fontSize: 12, color: "red" }}>(tap to remove)</Text>
            }
          </TouchableOpacity>
        ))}
      </View> */}

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/Just_Icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Cache Money Made</Text>
      </View>

      <Text style={[styles.description, { position: "relative", top: -30 }]}>
        {username ? `Welcome, ${username}!` : 'Cooking Crazy 4 U Yay'}
      </Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogout}
        >
          <Text style={{ fontSize: 24, color: "black" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  loginButton: {
    width: 100,
    height: 67,
    backgroundColor: "#53B175",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    marginBottom: 18,
    bottom: "15%",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  registerButton: {
    width: 100,
    height: 67,
    backgroundColor: "#5c9ffcff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    marginBottom: 18,
    bottom: "15%",
  },
  logo: {
    width: 200,
    height: 200,
    position: "absolute",
    top: 70,
  },
  logoContainer: {
    position: "absolute",
    top: 70,
    alignItems: "center",
  },
});
