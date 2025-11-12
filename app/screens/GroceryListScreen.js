import React, {useState, useLayoutEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
} from "react-native";

/* 
  Grocery List Screen functions:
  - For now a place holder for navagation bar
  - Have a shopping check list
  - For now manual, add element of creating a list based on soon to expire items later

  Necessary:
  - Fun silly little thing 
*/

export default function GroceryListScreen({navigation}) {

    useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

return (
    <ImageBackground style={styles.background}>

      <Text style={styles.title}>Groceries</Text>
      
      <Text style={styles.description}>Cooking Crazy 4 U</Text>

    </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    loginButton: {
        width: "100%",
        height: 70,
        backgroundColor: "#fc5c65"
    },
    logo: {
        width:100,
        height: 100,
        position: 'absolute',
        top: 70,
    },
    logoContainer: {
        position: 'absolute',
        top: 70,
        alignItems: "center",
    },
    registerButtonButton: {
        width: "100%",
        height: 70,
        backgroundColor: "#5c9ffcff"
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
});