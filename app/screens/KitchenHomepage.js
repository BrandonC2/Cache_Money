import React from 'react';
import {ImageBackground, StyleSheet, View} from "react-native";

function KitchenHomepage(props) {
    
    return (
        <ImageBackground 
        style={styles.background}
        source={require("../assets/.jpg")}
        >
            <View style={styles.logoContainer}></View>
            <Image source={require('../assets/logo.png')} />
            <Text>Let you Cook</Text>
            <View style={styles.loginButton}></View>
            <View style={styles.registerButton}></View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center"
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
})
export default WelcomeScreen