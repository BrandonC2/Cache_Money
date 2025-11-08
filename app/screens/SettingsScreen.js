import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
/*
Used to test Notification system for following:
Expirations: User set X days reminder to use or remove expiring items (looks through item dates through database)
Reminders: Reminders to replenish low quantity items (implemented later with added serving values)

Eventually will include:
Change Username: (not needed yet)
Change Password: (prev)
Change E-mail: (prev)
Organization tools (modify sorts, etc.)

*/
export default function SettingsScreen({ navigation }) {
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (event, selectedDate) => {
        if (event.type === "set" && selectedDate){
            setDate(currentDate);
        }
        setShowPicker(false);

    }
    
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Pick Time" onPress={() => setShowPicker(true)} />

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onChange}
        />
      )}
        <TouchableOpacity style={styles.loginButton} onPress={() => setShowPicker(true)}>
            <Text style={{ fontSize: 24, color: "black" }}>Reminder Setting</Text>
        </TouchableOpacity>
    </View>
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  loginButton: {
    width: 100,
    height: 67,
    backgroundColor: "#4D693A",
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
