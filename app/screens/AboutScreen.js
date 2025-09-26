import React, { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withRepeat,
//   Easing,
// } from "react-native-reanimated";

export default class App extends React.Component{
  render() {
    return (
      <ImageBackground 
        style = {styles.background}
        source = {require('../assets/abtbg.jpg')}
      >
        <View>
          <Image
            source = {require('../assets/Just_Icon.png')}
            style = {styles.logo}
            resizeMode="contain"
          >
          </Image>
          <Image
            source = {require('../assets/cc4u_p.png')}
            style = {styles.logo_text}
            resizeMode="contain"
            >
          </Image>
        </View>
      </ImageBackground>
    )
  }
}


const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%'
  },
  logo_text: {
    width: '85%',
    height: '85%',
    marginLeft: '8%',
    marginTop: '26%'
  },
  logo: {
    width: '80%',
    height: '80%'
  }
});



// export default function AboutScreen({ navigation }) {
//   const rotate = useSharedValue(0);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ rotate: `${rotate.value}deg` }],
//     };
//   });

//   useEffect(() => {
//     rotate.value = withRepeat(
//       withTiming(360, {
//         duration: 2000,
//         easing: Easing.linear,
//       }),
//       -1, // infinite
//       false
//     );
//   }, []);

//   return (
//     <ImageBackground
//       style={styles.background}
//       source={require("../assets/IMG_1.jpg")}
//     >
//       <View style={styles.logoContainer}>
//         <Animated.Image
//           source={require("../assets/ye.png")}
//           style={[styles.logo, animatedStyle]} // 👈 apply animation here
//         />
//         {/* <Text style={styles.title}>Cache Money Made</Text> */}
//       </View>

//       {/* <Text style={styles.description}>Cooking Crazy 4 U</Text> */}

//       <View style = {styles.logoContainer}>
//         <Image
//           source = {require("../assets/cc4u.png")}
//           style = {styles.logo}
//         />
//       </View>


//       <View style={styles.buttons}>
//         <TouchableOpacity
//           style={styles.loginButton}
//           onPress={() => navigation.navigate("Login")}
//         >
//           <Text style={{ fontSize: 24, color: "black" }}>Login</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.registerButton}
//           onPress={() => navigation.navigate("Registration")}
//         >
//           <Text style={{ fontSize: 24, color: "black" }}>Sign-Up</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.registerButton}
//           onPress={() => navigation.navigate("KitchenHome")}
//         >
//           <Text style={{ fontSize: 24, color: "black" }}>ExampleHomepage</Text>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "white",
//   },
//   description: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "white",
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     right: 20,
//     resizeMode: "contain",
//   },
//   logoContainer: {
//     marginTop: 50,
//     position: "absolute",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   buttons: {
//     alignItems: "center",
//     flexDirection: "row",
//     flex: 1,
//     marginHorizontal: 100,
//   },
//   registerButton: {
//     width: 150,
//     height: 40,
//     left: 20,
//     backgroundColor: "#98dbe3ff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loginButton: {
//     width: 150,
//     height: 40,
//     right: 20,
//     backgroundColor: "#98dbe3ff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
