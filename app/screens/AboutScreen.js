import React, { useEffect } from "react";
import { useFonts } from 'expo-font';
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";

// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withRepeat,
//   Easing,
// } from "react-native-reanimated";

export default function AboutScreen({ navigation }) {
// Load the font and give it a name to use in your styles
  const [fontsLoaded] = useFonts({
    'alexandria_bold': require('../assets/fonts/alexandria_bold.ttf'),
    'alexandria_regular': require('../assets/fonts/alexandria_regular.ttf'),
    'alexandria_light': require('../assets/fonts/alexandria_light.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style = {styles.mainContainer}>

      <View style = {styles.logoArea}>

        <Image source = {require('../assets/cloud.png')} style = {styles.logoBase}/>
        <Image source = {require('../assets/basket.png')} style = {styles.logoOverlay}/>

      </View>
      <View style = {styles.bottomContainer}>

        <Image source={require('../assets/crossiant.png')} style = {styles.sillyCrossaint}/>
        <Image source={require('../assets/orange.png')} style = {styles.sillyOrange}/>

        <Text style = {styles.phraseText}>
          Your easy way to keep{'\n'}track of groceries!
        </Text>

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
          onPress={() => navigation.navigate("MainNavBar")}
        >
          <Text style={styles.buttonText}>Homepage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#E2D8AC',
  },
  // top half of the screen, where logo will be
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBase: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  logoOverlay: {
    position: 'absolute',
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  // bottom half of the screen, where buttons and text will be
  bottomContainer: {
    flex: 1.2,
    backgroundColor: '#F2ECD5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 30,
    width: '100%',
        ...Platform.select({
      ios: {
        // shadow for ios users
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sillyOrange: {
    position: 'absolute',
    top: -65,
    right: 5,
    width: 130,
    height: 130,
    resizeMode: 'contain',
    transform: [{scaleX: -1}],
  },
  sillyCrossaint: {
    position: 'absolute',
    top: -50,
    left: 20,
    width: 125,
    height: 125,
    resizeMode: 'contain',
    transform: [{rotate: '-15deg'}],
  },
  button: {
    width: '90%',
    height: 67,
    backgroundColor: "#4D693A",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginBottom: 10,
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
  buttonText: {
    fontFamily: 'alexandria_light',
    fontSize: 20,
    color: '#FFF9FF'
  },
  phraseText: {
    fontFamily: 'alexandria_bold',
    fontSize: 30,
    color: '#785D49',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
})
