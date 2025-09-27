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
      // source={require("../assets/IMG_1.jpg")}
    >
      <View style={styles.logoContainer}>
        <Image source={require("../assets/Just_Icon.png")} style={styles.logo} />
        {/* <Text style={styles.title}>Cache Money Made</Text> */}
      </View>

      <View style={styles.infoContainer}>
        {error ? <Text style={{color:"red", flex:1 }}>{error}</Text> : null}
        
        {/* Title text */}
        <Text style ={{fontSize: 30, color: "black", position:'relative', right:140,}}>Login</Text>

         {/* User Name Block */}
        <View style={styles.inputContainer}>
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
            </TextInput>
        </View>

        {/* Password Block */}
        <View style={styles.inputContainer}>
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
            </TextInput>
        </View>

        {/* Login Block */}
         <View style={styles.returnContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => alert("Does Nothing for now")}>
            <Text style ={{fontSize: 18, color: "white"}}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Return Block */}
        <View style={styles.returnContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("About")}>
            <Text style ={{fontSize: 18, color: "white"}}>Return</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up Link */}
        <View style={styles.returnContainer}>
          <Text style ={{fontSize: 18, color: "#00000",position:'relative', top:100}}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
            <Text style ={{fontSize: 18, color: "#53B175", position:'relative', top:100}}>Sign-Up</Text>
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
    color: "white",
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
    width: 200,
    height: 200,
    right: 10,
    // marginTop: 100,
    
  },
   logoContainer: {

    marginTop: 10,
   
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
    position: 'relative',
    top: 100,
    alignItems: "center",
    flexDirection: "row",
  },

  backButton: {
      //opacity: 0,
      //Position (higher the value further from the margin)
      position: 'relative',
      top: 130,
      //Button dimensions
      width: 364,
      height: 67,
      borderRadius: 10,
      borderWidth: 3,
      //colors
      backgroundColor: "#53B175",
      borderColor: "#53B175",
      color: "#161515ff",
      //text settings
      alignItems: "center",
      justifyContent: 'center',
      fontFamily: "sans-serif",
      fontSize: 20,
      //shadow settings
      shadowColor: '#070707ff',
      shadowOffset: {width: 3, height:4},
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 8,
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