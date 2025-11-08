import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';
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
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          console.log('User already logged in, navigating to KitchenHome');
          navigation.replace('KitchenHome'); // replace so user can’t go “back” to login
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
  }, []);

  React.useEffect(() => {
    console.log('API_BASE (Login):', API_BASE);
  }, []);
  
  const handleLogin = async () => {
    setError("");
    // basic client-side validation
    if (!username || !password) {
      setError('Please provide username and password');
      return;
    }

    setLoading(true);
    try {
      // Use API_BASE from config
      const res = await fetch(`${API_BASE}/api/users/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password }),


      });
        // safe JSON parse: backend might return empty body or non-JSON on error
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
      if (!res.ok) {
          const serverMsg = data.message || data.error || data.raw || 'Login failed';
          console.error('Login failed:', res.status, serverMsg);
          setError(serverMsg);
        setLoading(false);
        return;
      }
      const { token, username: returnedUsername, user } = data;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        const nameToSave = user?.username || username;
        if (nameToSave) {
          await AsyncStorage.setItem('username', nameToSave);
          console.log('Saved username:', nameToSave);
        }
          navigation.navigate('KitchenHome');
        } else {
          setError('No token received from server');
        }
    } catch (err) {
        console.error('Network/login error:', err);
        setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }
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
        <Text style ={{fontSize: 15, color: "black", position:'relative', right:71.6,}}>Enter your email and password</Text>

         {/* User Name Block */}
    <View style={styles.inputContainer}>
      <TextInput 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername} 
        autoCapitalize="none"
        style={ [styles.input, {borderColor: error ? "red" : "#ccc",position:'relative', top:-30}]} 
      />
    </View>
    <View style={[styles.line,{top: 33}]}></View>
        {/* Password Block */}
        <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Password" 
              value={password} 
              onChangeText={setPassword}
              autoCapitalize="none" 
              secureTextEntry={true}
              style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}
            />
        </View>
        <View style={[styles.line,{top: 63}]}></View>

      {/* Forgot password block */}
      <View style={styles.returnContainer}>
          <TouchableOpacity onPress={() => alert("Does Nothing for now")}>
            <Text style ={{fontSize: 18, color: "black", position: 'relative', top: 15, left: 110}}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Block */}
         <View style={styles.returnContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleLogin} disabled={loading}>
            <Text style ={{fontSize: 18, color: "white"}}>{loading ? 'Logging in...' : 'Login'}</Text>
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
          <Text style ={{fontSize: 18, color: "#00000",position:'relative', top:10}}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
            <Text style ={{fontSize: 18, color: "#4D693A", position:'relative', top:10}}>Sign-Up</Text>
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
    top: 80,
    alignItems: "center",
    flexDirection: "row",
  },

  backButton: {
      //opacity: 0,
      //Position (higher the value further from the margin)
      position: 'relative',
      top: 20,
      //Button dimensions
      width: 364,
      height: 67,
      borderRadius: 10,
      borderWidth: 3,
      //colors
      backgroundColor: "#4D693A",
      borderColor: "#4D693A",
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
      borderWidth: 0,
      textShadowColor: "#121111ff",
      marginVertical: 8,
      //paddingHorizontal: 10,
      backgroundColor: "transparent",
      borderColor: "#fff",
      color: "#161515ff",
      fontFamily: "sans-serif",
      fontSize: 24,
    },
  line: {
    position: 'relative',
    top: 55,
    width: 364,
    height: 1.5,
    backgroundColor: '#E2E2E2',
    // marginLeft: 5,
    // margineRight: 10,
    marginVertical: 8,
  }
  

});