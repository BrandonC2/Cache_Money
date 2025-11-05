import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import axios from "axios";
import API_BASE from '../config/api';

export default function KitchenRoster({ navigation }) {
  const [kitchens, setKitchens] = useState([]);
  const [kitchenName, setKitchenName] = useState("");
  const [password, setPassword] = useState("");

  const createKitchen = async () => {
    try {
      await axios.post(`${API_BASE}/kitchens/create`, { name: kitchenName, password });
      alert("Room created!");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };
 const joinKitchen = async () => {
    try {
      await axios.post(`${API_BASE}/kitchens/join`, { name: kitchenName, password });
      navigation.navigate("Kitchen", { roomName: kitchenName });
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Create / Join Chat Room</Text>
      <TextInput placeholder="Room name" value={kitchenName} onChangeText={setKitchenName} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={createKitchen}><Text>Create Room</Text></TouchableOpacity>
      <TouchableOpacity onPress={joinKitchen}><Text>Join Room</Text></TouchableOpacity>
    </View>
  );
}