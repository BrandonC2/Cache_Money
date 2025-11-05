import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import io from "socket.io-client";
import API_BASE from "../config/api"; // ✅ Uses the same backend base

export default function KitchenRoom({ route }) {
  const { roomName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // ✅ Connect to your server
    const newSocket = io(API_BASE, {
      transports: ["websocket"], // ensure it works on React Native
    });
    setSocket(newSocket);

    // ✅ Join the room
    newSocket.emit("joinRoom", { roomName, username: "User" });

    // ✅ Listen for new messages
    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // ✅ Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [roomName]);

  // ✅ Send message to room
  const sendMessage = () => {
    if (!text.trim() || !socket) return;
    socket.emit("chatMessage", { roomName, sender: "User", text });
    setText("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 5 }}>
            <Text style={{ fontWeight: "bold" }}>{item.sender}: </Text>
            {item.text}
          </Text>
        )}
      />

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            marginRight: 10,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#007bff",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}