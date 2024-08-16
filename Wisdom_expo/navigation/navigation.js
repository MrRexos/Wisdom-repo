import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { View, Text } from 'react-native'
import React from 'react'
import WelcomeVideoScreen from '../screens/WelcomeVideoScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GetStartedScreen from '../screens/GetStartedScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import LogOptionScreen from '../screens/LogOptionScreen';
import LogInScreen from '../screens/LogInScreen';
import EnterEmailScreen from '../screens/EnterEmailScreen';
import EnterPasswordScreen from '../screens/EnterPasswordScreen';
import EnterNameScreen from '../screens/EnterNameScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import HomeScreen from '../screens/HomeScreen';
import { CardStyleInterpolators } from '@react-navigation/stack';



export default function Navigation() {
    return (
        <NavigationContainer>
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
          <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} options={{ animation: 'none'  }}/>
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="Terms" component={TermsScreen}/>
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="LogOption" component={LogOptionScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="LogIn" component={LogInScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="EnterEmail" component={EnterEmailScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="EnterPassword" component={EnterPasswordScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="EnterName" component={EnterNameScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="CreateProfile" component={CreateProfileScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="Home" component={HomeScreen} options={{ animation: 'none' }}/>
        </Stack.Navigator>
      </NavigationContainer>
      
    );
}   