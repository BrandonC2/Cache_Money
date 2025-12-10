import React, { useState, useEffect } from "react";
import {
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

export default function RegistrationScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('API_BASE (Registration):', API_BASE);
  }, []);

  const handleSignUp = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("Please complete all fields");
      return;
    }

    // Simple client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (username.length < 4 || password.length < 4 || !emailRegex.test(email)) {
      setError("Please enter valid username, email, and password (min 4 chars)");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Signup request
      const signupRes = await fetch(`${API_BASE}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const signupText = await signupRes.text();
      let signupData = {};
      try { signupData = signupText ? JSON.parse(signupText) : {}; } catch (e) { signupData = { raw: signupText }; }

      if (!signupRes.ok) {
        const msg = signupData.message || signupData.error || signupData.raw || "Signup failed";
        setError(msg);
        setLoading(false);
        return;
      }

      // ✅ Signup successful — now automatically login
      const loginRes = await fetch(`${API_BASE}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginText = await loginRes.text();
      let loginData = {};
      try { loginData = loginText ? JSON.parse(loginText) : {}; } catch (e) { loginData = { raw: loginText }; }

      if (!loginRes.ok) {
        const msg = loginData.message || loginData.error || loginData.raw || "Login failed after signup";
        setError(msg);
        setLoading(false);
        return;
      }
      const { token } = data;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('username', username);
        navigation.navigate('MainNavBar');
      }
    } catch (err) {
      console.error("Signup/Login error:", err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.logoArea}>
        <Image source={require('../assets/basket.png')} style={styles.logo}/>
      </View>

      <View style={styles.informationSection}>
        <View style={styles.infoContainer}>
          {error ? <Text style={{fontFamily: 'alexandria_regular', color:'red', marginBottom: 10}}>{error}</Text> : null}

          <Text style={{fontSize: 30, fontFamily: 'alexandria_light', color: 'black'}}>Sign Up</Text>
          <Text style={{fontSize: 16, fontFamily: 'alexandria_light', color: 'grey'}}>Enter your credentials to continue</Text>

          <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, {borderColor: error ? "red" : "#ccc"}]}
            />
          </View>

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

          <Text style={{paddingTop: 10, fontSize: 14, fontFamily: 'alexandria_light', color: 'grey'}}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>

          <TouchableOpacity style={styles.backButton} onPress={handleSignUp} disabled={loading}>
            <Text style={{fontSize: 18, fontFamily: 'alexandria_light', color: 'white'}}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signUp}>
            <Text style={{fontSize: 16, fontFamily: 'alexandria_light', color: 'black'}}>Already have an account?{' '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={{fontFamily: 'alexandria_light', fontSize: 16, color: "#4D693A"}}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F2ECD5' },
  logoArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  informationSection: { flex: 2.2, alignItems: 'center', justifyContent: 'flex-start', width: '100%' },
  infoContainer: { width: '85%' },
  logo: { width: 140, height: 140, resizeMode: 'contain' },
  inputContainer: { marginTop: 30, width: '100%' },
  backButton: {
    marginTop: 20,
    width: '100%',
    height: 67,
    borderRadius: 19,
    borderWidth: 3,
    backgroundColor: "#4D693A",
    borderColor: "#4D693A",
    alignItems: "center",
    justifyContent: 'center',
    fontFamily: "alexandria_light",
    fontSize: 20,
    ...Platform.select({
      ios: { shadowColor: 'black', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  input: { backgroundColor: "transparent", fontFamily: "alexandria_light", fontSize: 18, borderBottomColor: '#E2D8AC', borderBottomWidth: 1, paddingVertical: 10, width: '100%' },
  signUp: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 25, width: '100%' },
});
