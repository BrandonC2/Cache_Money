import React from "react";
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
  Welcome Screen functions:
  - Username: Provide a valid username (rules will need to be established)
  - Password: same as Username
  - Eventually will need to leverage .match() with database to login

  Necessary:
  - Text description of what constitutes a valid Username/Password
  - Message sent detailing an invalid input (alert possibly)
  - CRUD to save valid inputs
*/
export default function LoginScreen({navigation}) {
  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/IMG_1.jpg")}
    >
      <View style={styles.logoContainer}>
        <Image source={require("../assets/ye.png")} style={styles.logo} />
        <Text style={styles.title}>Cache Money Made</Text>
      </View>

      <View style={styles.infoContainer}>

        <View style={styles.inputContainer}>
            <Text style={styles.title}>Username</Text>
            <TextInput style={styles.input}></TextInput>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Password</Text>
          <TextInput style={styles.input}></TextInput>
        </View>

         <View style={styles.returnContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => alert("Does Nothing for now")}>
            <Text style ={{fontSize: 24, color: "black"}}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.returnContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("About")}>
            <Text style ={{fontSize: 24, color: "black"}}>Return</Text>
          </TouchableOpacity>
        </View>
        
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
    alignItems: "center",
  },

  infoContainer: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    marginVertical: 20,
    fontWeight: "bold",
    color: "white",
    right: 20,
  },

  logo: {
    width: 100,
    height: 100,
    right: 20
    //marginTop: 100,
    
  },
   logoContainer: {
    marginTop: 50,
    //flex: 1,
    //marginHorizontal: 60,
    //position: "absolute",
    alignItems: "center",
    flexDirection: "row",
  },

  returnContainer: {
    marginTop: 50,
    alignItems: "center",
    flexWrap: "wrap",
    //flex: 1,
    //marginHorizontal: 100,
  },

  inputContainer: {
    //marginTop: 50,
    alignItems: "center",
    flexDirection: "row",
  },

  backButton: {
    opacity: 10,
    width: 200,
    height: 40,
    backgroundColor: "#98dbe3ff",
    alignItems: "center",
    justifyContent: 'center',
  },

  input: {
    height: 40,
    width: 200,
    borderColor: "#ccc",
    borderWidth: 2,
    textShadowColor: "#121111ff",
    //marginVertical: 4,
    //paddingHorizontal: 10,
    backgroundColor: "#fff",
    //borderRadius: 5,
  },

});