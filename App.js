import { StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './app/screens/WelcomeScreen';
import RegistrationScreen from './app/screens/RegistrationScreen';
import AboutScreen from './app/screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // Basic Default Navigator
  return(
  <NavigationContainer>
    <Stack.Navigator initialRouteName="About">
      <Stack.Screen name = "Login" component ={WelcomeScreen} />
      <Stack.Screen name = "Registration" component ={RegistrationScreen} />
      <Stack.Screen name = "About" component ={AboutScreen} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
