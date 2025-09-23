import {
  ImageBackground,
  StyleSheet,
  Button,
  View,
  Image,
  Text,
  TextInput,
  StatusBar,
} from "react-native";

export default function RegistrationScreen({ navigation }) {
  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/IMG_1.jpg")}
    >
      <View style={styles.logoContainer}>
        <Image source={require("../assets/ye.png")} style={styles.logo} />
      </View>

      <View style={styles.backButton}>
        <Button
          title="Back"
          onPress={() => navigation.navigate("About")}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.title}>Username</Text>
        <TextInput style={styles.input}></TextInput>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.title}>Password</Text>
        <TextInput style={styles.input}></TextInput>
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginVertical: 36,
    fontWeight: "bold",
    color: "white",
  },

  logo: {
    width: 100,
    height: 100,
    marginTop: 50,
  },
  logoContainer: {
    alignItems: "center",
  },
  inputContainer:{
    //flex: 1,
    //backgroundColor: "#fff",
    //paddingTop: StatusBar.currentHeight,
  },

  backButton: {
    width: 100,
    height: 100,
    marginTop: 50,
  },
  input: {
    height: 40,
    width: 250,
    borderColor: "#ccc",
    borderWidth: 1,
    //marginVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    //borderRadius: 5,
  },
});

