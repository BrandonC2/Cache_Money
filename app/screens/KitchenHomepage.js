import React, { useState,useEffect } from "react";
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
  const [name, setName] = useState("");
  const [expire, setExpire] = useState("");
  const [desc, setDesc] = useState("");
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);

  // Dropdown state for DropDownPicker
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [ingredients, setIngredients] = useState([
    { label: 'Tomato', value: 'tomato' },
    { label: 'Onion', value: 'onion' },
  ]);

  // simple icons list for demo
  const icons = ["ios-restaurant", "ios-egg", "ios-apple"];

  const fetchItems = async () => {
    try {
  const res = await apiClient.get('/api/inventory');
      setItems(res.data || []);
      console.log('Fetched items:', res.data);
    } catch (err) {
      console.error('fetchItems error:', err.message || err);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const saveItem = async () => {
    if (!name) return;
    try {
      if (editId) {
  await apiClient.put(`/api/inventory/${editId}`, { name, description: desc });
        setEditId(null);
      } else {
  await apiClient.post('/api/inventory', { name, description: desc });
      }
      setName("");
      setDesc("");
      fetchItems();
    } catch (err) {
      console.error('saveItem error:', err.message || err);
    }
  };

  const removeItem = async (id) => {
    try {
  await apiClient.delete(`/api/inventory/${id}`);
      fetchItems();
    } catch (err) {
      console.error('removeItem error:', err.message || err);
    }
  };
  
  const startEdit = (item) => {
    setName(item.name);
    setDesc(item.description);
    setEditId(item._id);
  };

  const handleSelect = (val) => {
    console.log('Selected:', val);
    setValue(val);
  };

  const handleRemove = (iconName) => {
    console.log('Remove icon tapped:', iconName);
  };

  return (
    <ImageBackground style={styles.background}>
      <DropDownPicker
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
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/Just_Icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Cache Money Made</Text>
      </View>

      <Text
        style={[styles.description, { position: "relative", top: -30 }]}
      >
        Cooking Crazy 4 U
      </Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ fontSize: 24, color: "black" }}>Login</Text>
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
