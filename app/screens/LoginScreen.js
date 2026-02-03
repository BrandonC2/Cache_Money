import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
  Platform,
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
  // Auto-login
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const savedUsername = await AsyncStorage.getItem("username");
        const savedProfile = await AsyncStorage.getItem("profilePath");

        if (token && savedUsername) {
          navigation.replace("MainNavBar", {
            username: savedUsername,
            profile: savedProfile ? `${API_BASE}${savedProfile}?t=${Date.now()}` : null,
          });
        }
      } catch (err) {
        console.error("Auto-login error:", err);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!username || !password) return setError("Provide username and password");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      const { token, user } = data;

      if (token) {
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("username", user?.username || username);

        const actualId = user?.id || user?._id || user?.data?.id; 
        if (actualId) {
          await AsyncStorage.setItem("userId", String(actualId));
          console.log("UserID saved:", actualId); // Debugging line
        } else {
          console.error("Login successful but no ID found in user object");
        }

        if (user?.profile) {
          await AsyncStorage.setItem("profilePath", user.profile); // <-- consistent key
        }

        navigation.replace("MainNavBar", {
          username: user?.username || username,
          profile: user?.profile ? `${API_BASE}${user.profile}?t=${Date.now()}` : null,
        });
      } else {
        setError("No token received");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style = {styles.mainContainer}>
      <View style = {styles.logoArea}>
        <Image source = {require('../assets/basket.png')} style = {styles.logo}/>
      </View>
      <View style = {styles.informationSection}>
        <View style = {styles.infoContainer}>

          {/* Error Handling */}
          {error ? <Text style={{fontFamily: 'alexandria_regular', color:'red', marginBottom: 10}}>{error}</Text> : null}

          {/* Title Text */}
          <Text style = {{fontSize: 30, fontFamily: 'alexandria_light', color: 'black', position: 'relative',}}>
            Log In
          </Text>
          <Text style = {{fontSize: 16, fontFamily: 'alexandria_light', color: 'grey', position: 'relative',}}>
            Enter your username and password
          </Text>

          {/* Username Entry */}
          <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Username"
              value = {username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}

            />
          </View>

          {/* Password Entry */}
          <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Password"
              value = {password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry={true}
              style={[styles.input, {borderColor: error ? "red" : "#ccc",}]}
              underlineColorAndroid='transparent'
            />
          </View>

          {/* Forgot Password */}
          <View style={styles.returnContainer}>
            <TouchableOpacity onPress={() => alert("Does Nothing for now")}>
                <Text style ={{fontFamily: 'alexandria_regular', fontSize: 16, color: "#4D693A"}}>
                  Forgot Password?
                </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleLogin} disabled={loading}>
              <Text style={{fontSize: 18, fontFamily: 'alexandria_light', color: 'white'}}>
                {loading ? 'Logging In...' : 'Login'}
              </Text>
            </TouchableOpacity>
          
          {/* If a user doesn't have an account */}
          <View style={styles.signUp}>
            <Text style = {{fontSize: 16, fontFamily: 'alexandria_light', color: 'black'}}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
              <Text style={{fontFamily: 'alexandria_light', fontSize: 16, color: "#4D693A"}}>
                Sign Up
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F2ECD5',
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  informationSection: {
    flex: 2.2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  infoContainer: {
    width: '85%'
  },
  title: {
    fontSize: 24,
    marginVertical: 20,
    fontWeight: "bold",
    color: "white",
    right: 20,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  returnContainer: {
    paddingTop: 15,
    alignItems: 'flex-end',
    width: '100%'
  },
  signUp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 25,
    width: '100%'
  },
  inputContainer: {
    marginTop: 40,
    width: '100%'
  },
  backButton: {
      //Position (higher the value further from the margin)
      marginTop: 30,
      //Button dimensions
      width: '100%',
      height: 67,
      borderRadius: 19,
      borderWidth: 3,
      //colors
      backgroundColor: "#4D693A",
      borderColor: "#4D693A",
      color: "#161515ff",
      //text settings
      alignItems: "center",
      justifyContent: 'center',
      fontFamily: "alexandria_light",
      fontSize: 20,
      //shadow settings
    ...Platform.select({
          ios: {
            // shadow for ios users
            shadowColor: 'black',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.25,
            shadowRadius: 3,
          },
          android: {
            elevation: 3,
          },
        }),
    },
  input: {
      backgroundColor: "transparent",
      fontFamily: "alexandria_light",
      fontSize: 18,
      borderBottomColor: '#E2D8AC',
      borderBottomWidth: 1,
      paddingVertical: 10,
      width: '100%'
    },
  sillyBlueberry: {
    top: 245,
    left: -15,
    width: 125,
    height: 125,
    position: 'absolute',
    resizeMode: 'contain',
    transform: [{scaleX: -1}],
  },
});
