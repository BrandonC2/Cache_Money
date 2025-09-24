import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";

/*
  About Screen (for now) serves as start up screen
  - Note: likely will move to login screen to default
  - Touchable opacity for buttons
*/
export default function AboutScreen({ navigation }) {
  
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
    //justifyContent: "flex-end",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  description: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  logo: {
    width: 100,
    height: 100,
    right: 20
    //marginTop: 100,
  },
  logoContainer: {
    marginTop: 50,
    //marginHorizontal: 60,
    position: "absolute",
    alignItems: "center",
    flexDirection: "row",
  },
  buttons: {
    //position: "absolute",
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    marginHorizontal: 100,
  },
  registerButton: {
    width: 150,
    height: 40,
    left: 20,
    //marginVertical: 30,
    backgroundColor: "#98dbe3ff",
    alignItems: "center",
    justifyContent: 'center',
    //borderColor: "black",
  },
  loginButton: {
    width: 150,
    height: 40,
    right: 20,
    //marginVertical: 30,
    backgroundColor: "#98dbe3ff",
    alignItems: "center",
    justifyContent: 'center',
  },
});

