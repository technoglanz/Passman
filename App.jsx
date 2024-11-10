// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screen components
import Home from './Screens/Home';
import Welcome from './Screens/Welcome';
import Save from './Screens/Save';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={
        {
          headerShown : false
        }
      }>
        <Stack.Screen name="Welcome" component={Welcome} options={{ title: 'Welcome' }} />
        <Stack.Screen name="Home" component={Home} options={{ title: 'Home' }} />
        <Stack.Screen name="Save" component={Save} options={{ title: 'Save Credential' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
