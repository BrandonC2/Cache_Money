import React, { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

 export default function AboutScreen({ navigation }) {
 
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );
  }, []);

  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/abtbg.jpg")}
    >
      <View style={styles.topContainer}>

      <Image
        style = {styles.logo}
        source = {require('../assets/Just_Icon.png')}
        >
      </Image>
        {/* <Animated.Image
          source={require("../assets/ye.png")}
          style={[styles.logo, animatedStyle]} // 👈 apply animation here
        /> */}
        <Image
          style = {styles.titleImage}
          source = {require("../assets/cc4u_p.png")}/>
    
        {/* <Text style={styles.title}>Cache Money Made</Text> */}
      </View>

      {/* <Text style={styles.description}>Cooking Crazy 4 U</Text> */}


      {/* Container for the bottom buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Registration")}
        >
          <Text style={styles.buttonText}>Sign-Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("KitchenHome")}
        >
          <Text style={styles.buttonText}>Homepage</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // distributes everything vertically with space between the sections
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // holds the logo and title
  topContainer: {
    alignItems: 'center',
  },
  titleImage: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    top: '15%',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    top: "38%",
  },
  buttonContainer: {
    width: "95%",
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 67,
    backgroundColor: "#53B175",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginBottom: 18,
    bottom: "15%",
    // shadow for ios users
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    // shadow for android users
    elevation: 3,
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF9FF'
  }

});
