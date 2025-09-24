import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './app/screens/LoginScreen';
import RegistrationScreen from './app/screens/RegistrationScreen';
import AboutScreen from './app/screens/AboutScreen';
import KitchenHomepage from './app/screens/KitchenHomepage';

const Stack = createNativeStackNavigator();

export default function App() {
  /*
  Initial Homepage provides options for the following:
  - Registration: User can Sign up for an account (CRUD implementation for storage still needed)
  - Login: User can Sign in to their account (CRUD implementation for storage still needed)
  */
  return(
  <NavigationContainer>

    <Stack.Navigator initialRouteName="About">

      <Stack.Screen name = "Login" component ={LoginScreen} />
      <Stack.Screen name = "Registration" component ={RegistrationScreen} />
      <Stack.Screen name = "About" component ={AboutScreen} />
      <Stack.Screen name = "KitchenHome" component ={KitchenHomepage} />


    </Stack.Navigator>

  </NavigationContainer>
  );
}
