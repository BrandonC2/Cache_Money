import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import io from "socket.io-client";
import API_BASE from "../config/api";

export default function KitchenRoom({ route, navigation }) {
  const { roomName, username } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinRoom", { roomName, username});

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Optionally listen for message deletion
    socket.on("deleteMessage", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    return () => socket.disconnect();
  }, [roomName]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;
    const msgObj = { roomName, sender: username, text };
    socketRef.current.emit("chatMessage", msgObj);
    setText("");
  };

  const deleteMessage = (index) => {
    // Local delete
    setMessages((prev) => prev.filter((_, i) => i !== index));
    // Optionally: emit to server
    // socketRef.current.emit("deleteMessage", { roomName, index });
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender === username;
    return (
      <TouchableOpacity
        onLongPress={() => deleteMessage(index)}
        style={[styles.messageItem, isMe ? styles.myMessage : styles.otherMessage]}
      >
        {!isMe && <Text style={styles.sender}>{item.sender}: </Text>}
        <Text style={[styles.messageText, !isMe && { color: "#000" }]}>{item.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('KitchenCollection')} style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 25, color: "#007bff" }}>← Return</Text>
      </TouchableOpacity>

      <Text style={styles.roomTitle}>{roomName}</Text>

      <View style={styles.messagesBox}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessage}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  roomTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  messagesBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  messageItem: {
    maxWidth: "75%",
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e2e2",
  },
  sender: { fontWeight: "bold", color: "#333" },
  messageText: { color: "#fff", flexShrink: 1 },
  inputContainer: { flexDirection: "row", marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "bold" },
});
