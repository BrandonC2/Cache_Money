import React, {useState, useLayoutEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
} from "react-native";

/* 
  RecipeMaker functions:
  - For now a place holder for navagation bar
  - Create recipes from the current pantry 
  - Scales recipes for num servings

  Necessary:
  - Fun silly little thing 
*/

export default function RecipeMaker({navigation}) {

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  
return (

      
       <ImageBackground 
            style={styles.background}
            source={require("../assets/grid_paper.png")}
        >
        <View style = {styles.logoArea}>
          <Image source = {require('../assets/basket.png')} style = {styles.logo}/>
      </View>
      {/* <Text style={styles.title}>Recipe</Text> */}
      
      {/* <Text style={styles.description}>Cooking Crazy 4 U</Text> */}
      <View style = {styles.notificationNote}>
              <Image source = {require('../assets/stickynote_tape.png')}/>
            </View>
      <Text style = {styles.phraseText}>
          Page is currently in the works!
        </Text>
      

    </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    loginButton: {
        width: "100%",
        height: 70,
        backgroundColor: "#fc5c65"
    },
    logo: {
        width:100,
        height: 100,
        position: 'absolute',
        top: 70,
    },
    logoContainer: {
        position: 'absolute',
        top: 70,
        alignItems: "center",
    },
    registerButtonButton: {
        width: "100%",
        height: 70,
        backgroundColor: "#5c9ffcff"
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    
    phraseText: {
    fontFamily: 'alexandria_bold',
    fontSize: 30,
    color: '#785D49',
    textAlign: 'center',
    top: -300,
    // marginTop: 20,
    // marginBottom: 10,
  },
    notificationNote: {
    position: 'center',
    top: -150,
    left: 75,
    width: 300,
    height: 300,
    resizeMode: 'contain',
    transform: [{scaleX: -1}],
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    
});