import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { View, Text } from 'react-native'
import React from 'react'
import WelcomeVideoScreen from '../screens/WelcomeVideoScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GetStartedScreen from '../screens/GetStartedScreen';

export default function Navigation() {
    return (
        <NavigationContainer>
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
          <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ animation: 'none' }}/>
        </Stack.Navigator>
      </NavigationContainer>
      
    );
}   