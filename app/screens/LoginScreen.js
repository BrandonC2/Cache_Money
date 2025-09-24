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
  const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
  
    const validate = () => {

      // Makes sure not empty or has spaces
      const userRegex = /^[A-Za-z+0-9]+$/;
      const passwordRegex = /^[A-Za-z+0-9+(_!@<>)?]+$/;
  
      if(!userRegex.test(username) || !passwordRegex.test(password) || username.length < 4 || password.length < 4)
        setError("Please enter a valid input for each")
      
      else {
        setError("");
        alert("Valid Information, Thank you! ✅");
      }
    };
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
        {error ? <Text style={{color:"red", flex:1 }}>{error}</Text> : null}

        <View style={styles.inputContainer}>
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
            </TextInput>
        </View>

        <View style={styles.inputContainer}>
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
            </TextInput>
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

        <View style={styles.returnContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Registration")}>
            <Text style ={{fontSize: 24, color: "black"}}>Sign-Up</Text>
          </TouchableOpacity>
        </View>        
        {error ? <Text style={{color:"red"}}>{error}</Text> : null}
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
      //opacity: 0,
      width: 200,
      height: 40,
      borderRadius: 15,
      borderWidth: 3,
      backgroundColor: "#989ce3ff",
      alignItems: "center",
      justifyContent: 'center',
      borderColor: "#fff",
      color: "#161515ff",
      fontFamily: "sans-serif",
      fontSize: 20,
    },

  input: {
      height: 60,
      width: 350,
      borderRadius: 15,
      borderWidth: 3,
      textShadowColor: "#121111ff",
      marginVertical: 8,
      //paddingHorizontal: 10,
      backgroundColor: "transparent",
      borderColor: "#fff",
      color: "#161515ff",
      fontFamily: "sans-serif",
      fontSize: 24,
    },

});