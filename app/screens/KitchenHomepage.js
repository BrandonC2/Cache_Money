import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
} from "react-native";

/* hahahahahhahahaah
  hheeeee heeeeee
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

export default function KitchenHomepage({navigation}) {
return (
    <ImageBackground style={styles.background} source={require("../assets/IMG_1.jpg")}>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/ye.png")} style={styles.logo} />
        <Text style={styles.title}>Cache Money Made</Text>
      </View>
      
      <Text style={styles.description}>Cooking Crazy 4 U</Text>

      <View style ={styles.buttons}>
        
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
          <Text style ={{fontSize: 24, color: "black"}}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Registration")}>
          <Text style ={{fontSize: 24, color: "black"}}>Sign-Up</Text>
        </TouchableOpacity>
        </View>
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