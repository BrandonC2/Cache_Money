import React, { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

export default function AboutScreen({ navigation }) {

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

{/* <View style={styles.rectangle}>
          <Text style = {styles.phraseText}>Your easy way to keep track of groceries!</Text>
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
              onPress={() => navigation.navigate("MainNavBar")}
            >
              <Text style={styles.buttonText}>Homepage</Text>
            </TouchableOpacity>
          </View>
        </View> */}

  // const rotate = useSharedValue(0);

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ rotate: `${rotate.value}deg` }],
  //   };
  // });

  // useEffect(() => {
  //   rotate.value = withRepeat(
  //     withTiming(360, {
  //       duration: 2000,
  //       easing: Easing.linear,
  //     }),
  //     -1, // infinite
  //     false
  //   );
  // }, []);

//   return (
//     <ImageBackground
//       style={styles.background}
//       source={require("../assets/fridge_image.jpg")}
//     >
//       <View style={styles.topContainer}>

//       <Image
//         style = {styles.logo}
//         source = {require('../assets/Just_Icon.png')}
//         >
//       </Image>
//         {/* <Animated.Image
//           source={require("../assets/ye.png")}
//           style={[styles.logo, animatedStyle]} // 👈 apply animation here
//         /> */}
//         <Image
//           style = {styles.titleImage}
//           source = {require("../assets/cooking_crazy_4u_p.png")}/>
    
//         {/* <Text style={styles.title}>Cache Money Made</Text> */}
//       </View>

//       {/* <Text style={styles.description}>Cooking Crazy 4 U</Text> */}


//       {/* Container for the bottom buttons */}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => navigation.navigate("Login")}
//         >
//           <Text style={styles.buttonText}>Login</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => navigation.navigate("Registration")}
//         >
//           <Text style={styles.buttonText}>Sign-Up</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => navigation.navigate("MainNavBar")}
//         >
//           <Text style={styles.buttonText}>Homepage</Text>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// }

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
    top: -60,
    right: 20,
    width: 115,
    height: 115,
    resizeMode: 'contain',
    transform: [{scaleX: -1}],
    // doesnt work for images ig :/
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
  sillyCrossaint: {
    position: 'absolute',
    top: -50,
    left: 20,
    width: 115,
    height: 115,
    resizeMode: 'contain',
    transform: [{rotate: '-15deg'}],
    // doesnt work for images ig :/
    ...Platform.select({
      ios: {
        // shadow for ios users
        shadowColor: 'black',
        shadowOffset: {width: 9, height: 4},
        shadowOpacity: 0.8,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  button: {
    width: '90%',
    height: 67,
    backgroundColor: "#4D693A",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginBottom: 18,
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
    fontSize: 20,
    color: '#FFF9FF'
  },
  phraseText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#785D49',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
})
