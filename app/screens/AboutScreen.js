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

// export default class App extends React.Component{
//   render() {
//     return (
//       <ImageBackground 
//         style = {styles.background}
//         source = {require('../assets/abtbg.jpg')}
//       >
//         <View >
//           <Image
//             style = {styles.logo}
//             source = {require('../assets/Just_Icon.png')}
//             resizeMode="contain"
//           >
//           </Image>
//         </View>
//         <View style = {styles.logo_text}>
//           <Image
            
//             source = {require('../assets/cc4u_p.png')}
//             resizeMode="contain"
//             >
//           </Image>
//         </View>

//       </ImageBackground>
//     )
//   }
// }


// const styles = StyleSheet.create({
//   background: {
//     width: '100%',
//     height: '100%'
//   },
//     logo: {
//     width: '10%',
//     height: '10%',
//     marginLeft: '13%',
//     marginTop: '45%'
//   },
//   logo_text: {
//     width: '85%',
//     height: '85%',
//     marginLeft: '8%',
//     marginTop: '26%'
//   },

// });



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
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require("../assets/ye.png")}
          style={[styles.logo, animatedStyle]} // 👈 apply animation here
        />
        {/* <Text style={styles.title}>Cache Money Made</Text> */}
      </View>

      {/* <Text style={styles.description}>Cooking Crazy 4 U</Text> */}

      <View>
        <Image
          style = {styles.title}        
          source = {require("../assets/cc4u_p.png")}
        />
      </View>

      {/* <View >
        <Image
        style = {styles.logoContainer}
        source = {require('../assets/Just_Icon.png')}
        >
      </Image>
      </View> */}


      <View style={styles.returnContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ fontSize: 24, color: "#FFF9FF" }}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Registration")}
        >
          <Text style={{ fontSize: 24, color: "#FFF9FF" }}>Sign-Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("KitchenHome")}
        >
          <Text style={{ fontSize: 24, color: "#FFF9FF"}}>ExampleHomepage</Text>
        </TouchableOpacity>
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
    width: 380,
    height: 380,
    marginLeft: '-42%',
    marginTop: '70%',
    position: 'absolute'
  },
  description: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  logo: {
    width: 100,
    height: 100,
    right: 20,
    resizeMode: "contain",
  },
  logoContainer: {
    marginTop: '64%',
    marginLeft: '10%',
    position: 'absolute',
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
  buttons: {
    alignItems: "center",
    flexDirection: "column",
    flex: 1,
    marginVertical: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 24, 
    color: "#FFF9FF",
  },
  registerButton: {
    width: 364,
    height: 67,
    left: 20,
    marginBottom: '5%',
    backgroundColor: "#53B175",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    // fontFamily: "",
  },
  loginButton: {
    width: 364,
    height: 67,
    right: 20,
    marginTop: '120%',
    marginBottom: '5%',
    backgroundColor: "#53B175",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },
});
