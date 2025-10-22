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
  Upcoming functions:
  - For now a place holder for navagation bar
  - Show iteams that are about to expire for that week

  Necessary:
  - Users can see what foods are going to expire sooner than others 
*/

export default function UpcomingScreen({navigation}) {
  
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  
return (
    <ImageBackground style={styles.background}>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/ye.png")} style={styles.logo} />
        <Text style={styles.title}>Upcoming</Text>
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