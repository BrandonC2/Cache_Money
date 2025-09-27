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
    <ImageBackground style={styles.background}>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/Just_Icon.png")} style={styles.logo} />
        <Text style={styles.title}>Cache Money Made</Text>
      </View>
      
      <Text style={[styles.description,{position: 'relative', top:-30}]}>Cooking Crazy 4 U</Text>

      <View style ={styles.buttons}>
        
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
          <Text style ={{fontSize: 24, color: "black"}}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Registration")}>
          <Text style ={{fontSize: 24, color: "black",position: 'relative', bottom: 20, left: 15}}>Sign-Up</Text>
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
        width: 100,
        height: 67,
        backgroundColor: "#53B175",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 19,
        marginBottom: 18,
        bottom: "15%",
        // shadow for ios users
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 3,
        // shadow for android users
        elevation: 3,
    },
    logo: {
        // width: 100,
        // height: 100,
        width: 200,
        height: 200,
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