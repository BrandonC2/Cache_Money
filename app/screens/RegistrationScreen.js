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
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';

/*
import axios from "axios";
const API = "server url"
*/

/*
import axios from "axios";
const API = "server url"
*/

/*
  Registration Screen functions:
  - Username: Provide a valid username (rules will need to be established)
  - Password: same as Username

  Current Checks:
  Username: must be longer than 4 characters
  Email: accepts common email (x@x.com)
  Password: must be longer than 4 characters

  Necessary:
  - Text description of what constitutes a valid Username/Password
  - Message sent detailing an invalid input (Done)
  - CRUD to save valid inputs
  - Prevent an input of an existing Email and/or username
*/
export default function RegistrationScreen({ navigation }) {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  React.useEffect(() => {
    console.log('API_BASE (Registration):', API_BASE);
  }, []);
  

  const handleSignUp = async () => {
    setError('');
    if (!username || !email || !password) {
      setError('Please complete all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
      if (!res.ok) {
        const serverMsg = data.message || data.error || data.raw || 'Signup failed';
        console.error('Signup failed:', res.status, serverMsg);
        setError(serverMsg);
        setLoading(false);
        return;
      }
      const { token } = data;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        navigation.navigate('KitchenHomepage');
      }
    } catch (err) {
      console.error('Network/signup error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  const validate = async () => {
    // simple regex for emailS
    //const emailRegex = /\S+@\S+\.\S+/;
    const emailRegex = /^[A-Za-z+0-9+(_!)?]+@\S+\.\S+$/

    // Makes sure not empty or has spaces
    const userRegex = /^[A-Za-z+0-9+(_)]+$/;
    const passwordRegex = /^[A-Za-z+0-9+(_!@<>)?]+$/;

    if(
      !emailRegex.test(email) || 
      !userRegex.test(username) || 
      !passwordRegex.test(password) || 
      username.length < 4 || 
      password.length < 4
    ){
      setError("Please enter a valid input for each")
      return;
    }
    try {
      setError("");
      const response = await axios.post(API, { username, email, password });
      alert("Registration Successful ✅");
      navigation.navigate("Login");
    } 
    
    catch (err) {
      const msg = err.response?.data?.error || "Error registering user";
    setError(msg);
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

        {/* Title text */}
        <View style={styles.infoContainer}>
                  <Text style ={{fontSize: 30, color: "black", right:'32%',}}>Sign Up</Text>
                  <Text style ={{fontSize: 15, color: "black", right:'11.5%',}}>Get started by entering your information</Text>
        
         {/* User Name Block */}
          <View style={styles.inputContainer}>
              <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
              </TextInput>
          </View>
        <View style={[styles.line]}></View>

         {/* Emmail Block */}
          <View style={styles.inputContainer}>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
              </TextInput>
          </View>
          <View style={[styles.line]}></View>

         {/* Password Block */}
          <View style={styles.inputContainer}>
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
            </TextInput>
          </View>
        <View style={[styles.line]}></View>

     

        </View>
        {error ? <Text style={{color:"red", fontFamily: "sans-serif", fontSize: 20, }}>{error}</Text> : null}

       {/*Sign up Block */}
        <View style={styles.infoContainer}>
          <View style={styles.returnContainer}>
              <TouchableOpacity style={[styles.backButton,{top:'50%'}]} onPress={handleSignUp} disabled={loading}>
                <Text style ={{fontSize: 24, color: "white"}}>{loading ? 'Signing up...' : 'Sign-Up'}</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.returnContainer}>
              <TouchableOpacity style={[styles.backButton,{position:'relative', top:50}]} onPress={() => navigation.navigate("About")}>
                <Text style ={{fontSize: 24, color: "white"}}>Back</Text>
              </TouchableOpacity>
            </View> */}

           {/* Login touchable link */}
            <View style={styles.returnContainer}>
              <Text style ={{fontSize: 18, color: "#00000",top:'35%'}}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style ={{fontSize:  18, color: "#53B175",top:'71%'}}>Login</Text>
              </TouchableOpacity>
            </View>
            
          </View>

      </ImageBackground>
    );
  }
  
//   const styles = StyleSheet.create({
//     background: {
//       flex: 1,
//       alignItems: "center",
//     },
//     infoContainer: {
//       flex: 1,
//       alignItems: "center",
//       marginBottom: 50,
//     },
//     title: {
//       fontSize: 24,
//       marginVertical: 20,
//       fontWeight: "bold",
//       color: "black",
//       right: 20,
//     },
  
//     logo: {
//       width: 100,
//       height: 100,
//       right: 20
//       //marginTop: 100,
//     },
//     icons: {
//       width: 50,
//       height: 30,
//       right: 20
//       //marginTop: 100,
//     },
//      logoContainer: {
//       flex: 1,
//       //marginHorizontal: 60,
//       //position: "absolute",
//       alignItems: "center",
//       flexDirection: "row",
//     },
  
//     returnContainer: {
//       marginTop: 20,
//       alignItems: "center",
//       flexWrap: "wrap",
//       //flex: 1,
//       //marginHorizontal: 100,
//     },
  
//     inputContainer: {
//       //marginTop: 50,
//       alignItems: "center",
//       flexDirection: "row",
//       justifyContent: 'center',
//     },
  
//     backButton: {
//       //opacity: 0,
//       width: 200,
//       height: 40,
//       borderRadius: 15,
//       borderWidth: 3,
//       backgroundColor: "#989ce3ff",
//       alignItems: "center",
//       justifyContent: 'center',
//       borderColor: "#fff",
//       color: "#161515ff",
//       fontFamily: "sans-serif",
//       fontSize: 20,
//     },
//    input: {
//       height: 60,
//       width: 350,
//       borderRadius: 15,
//       borderWidth: 3,
//       textShadowColor: "#121111ff",
//       marginVertical: 8,
//       //paddingHorizontal: 10,
//       backgroundColor: "transparent",
//       borderColor: "#fff",
//       color: "#161515ff",
//       fontFamily: "sans-serif",
//       fontSize: 24,
//     },
// });


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
    top: '20%',
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
      shadowColor: '#2e2d2dff',
      shadowOffset: {width: 3, height:4},
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },

  input: {
      //Button dimensions
      height: 60,
      width: 350,
      borderRadius: 15,
      borderWidth: 0,
      textShadowColor: "#121111ff",
      marginVertical: 8,
      //paddingHorizontal: 10,
      //colors
      backgroundColor: "transparent",
      borderColor: "#fff",
      color: "#161515ff",
      fontFamily: "sans-serif",
      fontSize: 24,
    },
  line: {
    position: 'relative',
    //Dimensions
    top: '14%',
    width: 364,
    height: 1.5,
    //color
    backgroundColor: '#E2E2E2',
    // marginLeft: 5,
    // margineRight: 10,
    marginVertical: 8,
  }
  

});
