import {
  ImageBackground,
  StyleSheet,
  Button,
  View,
  Image,
  Text,
} from "react-native";

function RegistrationScreen(props) {
  return (
    <ImageBackground
      style={styles.background}
      source={require("./assets/IMG_1.jpg")}
    >
      <View style={styles.logoContainer}>
        <Image source={require("./assets/ye.png")} style={styles.logo} />
        <Text style={styles.title}>Let you Cook</Text>
      </View>
      <View style={styles.loginButton}>
        <Button title="Login" onPress={() => console.log("Login pressed")} />
      </View>

      <View style={styles.registerButton}>
        <Button
          title="Register"
          onPress={() => console.log("Register pressed")}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    color: "white",
  },
  loginButton: {
    width: 100,
    height: 100,
    top: 75,
    //alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoContainer: {
    //position: "absolute",
    top: 50,
    alignItems: "center",
  },
  registerButton: {
    width: 100,
    height: 100,
    top: 40,
    //backgroundColor: "#5c9ffcff",
    //alignItems: "center",
  },
});

export default RegistrationScreen;
