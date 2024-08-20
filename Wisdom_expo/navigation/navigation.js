import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';

import { Search, Heart, MessageSquare } from "react-native-feather";
import HeartFill from "../assets/HeartFill.tsx"
import MessageSquareFill from "../assets/MessageSquareFill.tsx"
import Suitcase from "../assets/Suitcase.tsx"
import SuitcaseFill from "../assets/SuitcaseFill.tsx"

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
import NotificationAllowScreen from '../screens/NotificationAllowScreen';
import EmailSendedScreen from '../screens/EmailSendedScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatScreen from '../screens/ChatScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ConversationScreen from '../screens/ConversationScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



export default function Navigation() {
    return (
        <NavigationContainer>
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
          <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} options={{ animation: 'none'  }}/>
          <Stack.Screen name="SettingsScreen" component={TabNavigator} options={{ animation: 'none' }}/>
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
          <Stack.Screen name="HomeScreen" component={TabNavigator} options={{ animation: 'none' }}/>
          <Stack.Screen name="NotificationAllow" component={NotificationAllowScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="EmailSended" component={EmailSendedScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="ServicesScreen" component={ServicesScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ animation: 'none' }}/>
          <Stack.Screen name="Conversation" component={ConversationScreen} options={{ animation: 'none' }}/>

        </Stack.Navigator>
      </NavigationContainer>
    );
}   

function TabNavigator() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n} = useTranslation();
  return (
      <Tab.Navigator initialRouteName="Home" screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {

          switch (route.name) {

            case 'Home':
              IconName = Search;
              break;
            case 'Favorites':
              IconName = focused? HeartFill :  Heart;
              break;
            case 'Services':
              IconName = focused ? SuitcaseFill : Suitcase;
              break;
            case 'Chat':
              IconName = focused? MessageSquareFill: MessageSquare;
              break;
            //case 'Settings':
              //IconName = focused ? 'settings' : 'settings-outline';
              //break;
          }
          return <IconName color={color} strokeWidth={1.7} width={size} height={size} />;
        },
        tabBarActiveTintColor: colorScheme=='dark' ? '#f2f2f2' : '#444343', 
        tabBarInactiveTintColor: colorScheme=='dark' ? '#706f6e' : '#B6B5B5',  
        tabBarStyle: {
          backgroundColor: colorScheme=='dark' ? '#323131' : '#fcfcfc',  
          paddingBottom: 38, 
          paddingTop: 15,
          height: 95,
        },
        tabBarLabelStyle: { 
          paddingTop: 10,
          fontSize: 10, 
          fontFamily: 'inter-medium'
        },
      })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Services" component={ServicesScreen} />
        <Tab.Screen name="Chat" component={ChatStackNavigator} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      </Stack.Navigator>
  );
}

function ServicesStackNavigator() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
      </Stack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
      <Stack.Navigator initialRouteName="ChatScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="Conversation" component={ConversationScreen} />

      </Stack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      </Stack.Navigator>
  );
}