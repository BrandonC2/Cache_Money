import React, { useState } from "react";
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
        navigation.navigate('KitchenHome');
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

  // START HERE!!!!!!
  
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
            Sign Up
          </Text>
          <Text style = {{fontSize: 16, fontFamily: 'alexandria_light', color: 'grey', position: 'relative',}}>
            Enter your credentials to continue
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

          {/* Email Entry */}
          <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Email"
              value = {email}
              onChangeText={setEmail}
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

          <Text style={{paddingTop: 10, fontSize: 14, fontFamily: 'alexandria_light', color: 'grey', position: 'relative',}}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>

          {/* Sign Up Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleSignUp} disabled={loading}>
              <Text style={{fontSize: 18, fontFamily: 'alexandria_light', color: 'white'}}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          
          {/* If a user already has an account */}
          <View style={styles.signUp}>
            <Text style = {{fontSize: 16, fontFamily: 'alexandria_light', color: 'black'}}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={{fontFamily: 'alexandria_light', fontSize: 16, color: "#4D693A"}}>
                Sign In
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
    marginTop: 30,
    width: '100%'
  },
  backButton: {
      //Position (higher the value further from the margin)
      marginTop: 20,
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
});

      // <ImageBackground
      //   style={styles.background}
      //   // source={require("../assets/IMG_1.jpg")}
      // >
      //   <View style={styles.logoContainer}>
      //     <Image source={require("../assets/Just_Icon.png")} style={styles.logo} />
      //     {/* <Text style={styles.title}>Cache Money Made</Text> */}
      //   </View>

      //   {/* Title text */}
      //   <View style={styles.infoContainer}>
      //             <Text style ={{fontSize: 30, color: "black", right:'32%',}}>Sign Up</Text>
      //             <Text style ={{fontSize: 15, color: "black", right:'11.5%',}}>Get started by entering your information</Text>
        
      //    {/* User Name Block */}
      //     <View style={styles.inputContainer}>
      //         <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
      //         </TextInput>
      //     </View>
      //   <View style={[styles.line]}></View>

      //    {/* Emmail Block */}
      //     <View style={styles.inputContainer}>
      //         <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
      //         </TextInput>
      //     </View>
      //     <View style={[styles.line]}></View>

      //    {/* Password Block */}
      //     <View style={styles.inputContainer}>
      //       <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}>
      //       </TextInput>
      //     </View>
      //   <View style={[styles.line]}></View>

     

      //   </View>
      //   {error ? <Text style={{color:"red", fontFamily: "sans-serif", fontSize: 20, }}>{error}</Text> : null}

      //  {/*Sign up Block */}
      //   <View style={styles.infoContainer}>
      //     <View style={styles.returnContainer}>
      //         <TouchableOpacity style={[styles.backButton,{top:'50%'}]} onPress={handleSignUp} disabled={loading}>
      //           <Text style ={{fontSize: 24, color: "white"}}>{loading ? 'Signing up...' : 'Sign-Up'}</Text>
      //         </TouchableOpacity>
      //       </View>

      //       {/* <View style={styles.returnContainer}>
      //         <TouchableOpacity style={[styles.backButton,{position:'relative', top:50}]} onPress={() => navigation.navigate("About")}>
      //           <Text style ={{fontSize: 24, color: "white"}}>Back</Text>
      //         </TouchableOpacity>
      //       </View> */}

      //      {/* Login touchable link */}
      //       <View style={styles.returnContainer}>
      //         <Text style ={{fontSize: 18, color: "#00000",top:'35%'}}>Already have an account? </Text>
      //         <TouchableOpacity onPress={() => navigation.navigate("Login")}>
      //           <Text style ={{fontSize:  18, color: "#4D693A",top:'71%'}}>Login</Text>
      //         </TouchableOpacity>
      //       </View>
            
      //     </View>

      // </ImageBackground>