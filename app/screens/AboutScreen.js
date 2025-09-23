import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Button,
  View,
  Image,
  Text,
} from "react-native";


export default function AboutScreen({ navigation }) {
  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/IMG_1.jpg")}
    >
      <View style={styles.logoContainer}>
        <Image source={require("../assets/ye.png")} style={styles.logo} />
        <Text style={styles.title}>Let you Cook</Text>
      </View>
      <View style={styles.loginButton}>
        <Button
          title="Login"
          onPress={() => navigation.navigate("Login")}
        />
      </View>

      <View style={styles.registerButton}>
        <Button
          title="Register"
          onPress={() => navigation.navigate("Registration")}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    //justifyContent: "flex-end",
    //alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginVertical: 36,
    fontWeight: "bold",
    color: "white",
  },

  logo: {
    width: 200,
    height: 200,
    marginTop: 100,
  },
  logoContainer: {
    //position: "absolute",
    alignItems: "center",
  },
  registerButton: {
    width: 100,
    height: 100,
  },
  loginButton: {
    width: 100,
    height: 100,
  },
});

