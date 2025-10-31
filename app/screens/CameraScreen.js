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
  Camera Screen functions:
  - For now a place holder for navagation bar
  - Take a photo of a receipt
  - If photo can't be taken it will ask the user to either try again 
    or enter in information manually

  Necessary:
  - Main way of getting items (for later)
*/

export default function CameraScreen({navigation}) {

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

return (
    <ImageBackground style={styles.background}>

      <Text style={styles.title}>Camera</Text>
      
      <Text style={styles.description}>Cooking Crazy 4 U</Text>

    </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center"
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
})