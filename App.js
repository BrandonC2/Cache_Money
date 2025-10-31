import React from 'react';
import {
  View,
  Image,
} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LoginScreen from './app/screens/LoginScreen';
import RegistrationScreen from './app/screens/RegistrationScreen';
import AboutScreen from './app/screens/AboutScreen';
import KitchenHomepage from './app/screens/KitchenHomepage';
import SplashScreen from './app/screens/TransitionScreen';

//Currently not the main thing we are focusing on, 
// I just them here to get the nav bar working
import UpcomingScreen from './app/screens/UpcomingScreen';
import RecipeMaker from './app/screens/RecipeMakerScreen';
import GroceryListScreen from './app/screens/GroceryListScreen';
import CameraScreen from './app/screens/CameraScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function NavigationBar() {
  return(

    <Tab.Navigator
      screenOptions ={{
        
        tabBarStyle: {
            height: 80,
        
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            position: 'absolute',
            backgroundColor: '#e8f0e8ff',
            // bottom: 20, 
        },
        tabBarActiveTintColor: '#16e716ff',
        tabBarInactiveTintColor: '#000000ff',  
      }}
      >
      <Tab.Screen name ='Pantry' component = {KitchenHomepage} options={{
        
        
      
        tabBarIcon:({focused}) => (
          <View>
            <Image 
              source ={require('./app/assets/Pantry_B_Icon.png')}
              style={{
                width:25,
                height:25,
              }}
            />

          </View>
        ),
      }}/>
      <Tab.Screen name = 'Upcoming' component = {UpcomingScreen} options={{
        tabBarIcon:({focused}) => (
          <View>
            <Image 
              source ={require('./app/assets/Glass_Icon.png')}
          
              style={{
                width:25,
                height:25,
              }}
            />

          </View>
        ),
      }}
      
      />
      <Tab.Screen name = 'Camera' component = {CameraScreen} options={{
        tabBarIcon:({focused}) => (
          <View>
            <Image 
              source ={require('./app/assets/Camera_Icon.png')}
             
              style={{
                width:65,
                height:35,
              }}
            />

          </View>
        ),
      }} 
      
      />
      <Tab.Screen name = 'Grocery' component = {GroceryListScreen}options={{
        tabBarIcon:({focused}) => (
          <View>
            <Image 
              source ={require('./app/assets/Grocery_Icon.png')}
             
              style={{
                width:20,
                height:25,
                
              }}
            />

          </View>
        ),
      }}
      
      />
      <Tab.Screen name = 'Recipe' component = {RecipeMaker} options={{
       
        tabBarIcon:({focused}) => (
          <View>
            <Image 
              source ={require('./app/assets/Recipe_Icon.png')}
              
              style={{
                width:25,
                height:25,
              }}
            />

          </View>
        ),
      }}
      
      />
    </Tab.Navigator>
  )
}

export default function App() {
  /*
  Initial Homepage provides options for the following:
  - Registration: User can Sign up for an account (CRUD implementation for storage still needed)
  - Login: User can Sign in to their account (CRUD implementation for storage still needed)
  */
  return(
  <NavigationContainer>

    {/* chnage to "About when fixed */}
    <Stack.Navigator initialRouteName="About">
      <Stack.Screen name = "SplashScreen" component ={SplashScreen} options={{ headerShown: false }}/>
      <Stack.Screen name = "Login" component ={LoginScreen} options={{ headerShown: false }}/>
      <Stack.Screen name = "Registration" component ={RegistrationScreen} options={{ headerShown: false }}/>
      {/*   uncomment when about is fixed*/}
      <Stack.Screen name = "About" component ={AboutScreen} options={{ headerShown: false }}/>

      {/*NO LONGER NEEDED (maybe, keep just in case)}*/}
      <Stack.Screen name = "KitchenHome" component ={KitchenHomepage} options={{ headerShown: false }}/>
      <Stack.Screen name = "MainNavBar" component ={NavigationBar} options={{ headerShown: false }}/>


    </Stack.Navigator>

  </NavigationContainer>
  );
}
