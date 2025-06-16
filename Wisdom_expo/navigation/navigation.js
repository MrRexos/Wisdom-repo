import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image } from 'react-native'
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { getDataLocally } from '../utils/asyncStorage';
import { useEffect, useState, useCallback } from 'react';

import { Search, Heart, MessageSquare, Calendar } from "react-native-feather";
import { BookOpenIcon as OutlineBookOpenIcon } from 'react-native-heroicons/outline';
import { BookOpenIcon as SolidBookOpenIcon } from 'react-native-heroicons/solid';
import HeartFill from "../assets/HeartFill.tsx"
import MessageSquareFill from "../assets/MessageSquareFill.tsx"
import Suitcase from "../assets/Suitcase.tsx"
import SuitcaseFill from "../assets/SuitcaseFill.tsx"
import BriefcaseIcon from "../assets/BriefCase"
import BriefcaseFillIcon from "../assets/BriefCaseFill"
import CalendarFillIcon from "../assets/CalendarFill"

import React from 'react'


import WelcomeVideoScreen from '../screens/start/WelcomeVideoScreen';
import LoadingScreen from '../screens/start/LoadingScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import GetStartedScreen from '../screens/start/GetStartedScreen';
import TermsScreen from '../screens/start/TermsScreen';
import PrivacyPolicyScreen from '../screens/start/PrivacyPolicyScreen';
import LogOptionScreen from '../screens/start/LogOptionScreen';
import LogInScreen from '../screens/start/LogInScreen';
import EnterEmailScreen from '../screens/start/EnterEmailScreen';
import EnterPasswordScreen from '../screens/start/EnterPasswordScreen';
import EnterNameScreen from '../screens/start/EnterNameScreen';
import CreateProfileScreen from '../screens/start/CreateProfileScreen';
import ForgotPasswordScreen from '../screens/start/ForgotPassword';
import HomeScreen from '../screens/home/HomeScreen';
import NotificationAllowScreen from '../screens/start/NotificationAllowScreen';
import EmailSendedScreen from '../screens/start/EmailSendedScreen';
import NewPasswordScreen from '../screens/start/NewPasswordScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ListScreen from '../screens/favorites/ListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import ConversationScreen from '../screens/chat/ConversationScreen';
import PreferencesScreen from '../screens/settings/PreferencesScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import CreateService1Screen from '../screens/settings/CreateService1Screen';
import CreateService2Screen from '../screens/settings/CreateService2Screen';
import CreateService3Screen from '../screens/settings/CreateService3Screen';
import CreateService4Screen from '../screens/settings/CreateService4Screen';
import CreateService5Screen from '../screens/settings/CreateService5Screen';
import CreateService6Screen from '../screens/settings/CreateService6Screen';
import CreateService7Screen from '../screens/settings/CreateService7Screen';
import CreateService8Screen from '../screens/settings/CreateService8Screen';
import CreateService9_0Screen from '../screens/settings/CreateService9_0Screen';
import CreateService9Screen from '../screens/settings/CreateService9Screen';
import CreateService11_0Screen from '../screens/settings/CreateService11_0Screen';
import CreateService10Screen from '../screens/settings/CreateService10Screen';
import CreateService11Screen from '../screens/settings/CreateService11Screen';
import CreateService12Screen from '../screens/settings/CreateService12Screen';
import CreateService13Screen from '../screens/settings/CreateService13Screen';
import SearchDirectionScreen from '../screens/home/SearchDirectionScreen';
import BookingScreen from '../screens/home/BookingScreen';
import ConfirmPaymentScreen from '../screens/home/ConfirmPaymentScreen';
import PaymentMethodScreen from '../screens/home/PaymentMethodScreen';
import ResultsScreen from '../screens/home/ResultsScreen';
import SearchScreen from '../screens/home/SearchScreen';
import SearchServiceScreen from '../screens/home/SearchServiceScreen';
import ServiceProfileScreen from '../screens/home/ServiceProfileScreen';
import DisplayImagesScreen from '../screens/home/DisplayImagesScreen';
import DisplayReviewsScreen from '../screens/home/DisplayReviewsScreen';
import EnlargedImageScreen from '../screens/home/EnlargedImageScreen';

import CalendarProScreen from '../screens/professional/CalendarProScreen';
import ListingsProScreen from '../screens/professional/ListingsProScreen';
import SettingsProScreen from '../screens/professional/SettingsProScreen';
import TodayProScreen from '../screens/professional/TodayProScreen';

import CalendarScreen from '../screens/services/CalendarScreen';
import DirectionsScreen from '../screens/settings/DirectionsScreen';
import EditAccountScreen from '../screens/settings/EditAccountScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import TurnExpertScreen from '../screens/settings/TurnExpertScreen';
import WalletScreen from '../screens/settings/WalletScreen';
import ExpertPlansScreen from '../screens/settings/ExpertPlansScreen';
import FAQScreen from '../screens/settings/FAQScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL('/'), 'Wisdom_expo://'],
  config: {
    screens: {
      NewPassword: 'reset-password'
    }
  }
};


export default function Navigation() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="SettingsScreen" component={TabNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="LogOption" component={LogOptionScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="LogIn" component={LogInScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="EnterEmail" component={EnterEmailScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="EnterPassword" component={EnterPasswordScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="EnterName" component={EnterNameScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={TabNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="NotificationAllow" component={NotificationAllowScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="EmailSended" component={EmailSendedScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ServicesScreen" component={ServicesScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="List" component={ListScreen} />
        <Stack.Screen name="CreateServiceStack" component={CreateServiceStackNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService1" component={CreateService1Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService2" component={CreateService2Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService3" component={CreateService3Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService4" component={CreateService4Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService5" component={CreateService5Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService6" component={CreateService6Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService7" component={CreateService7Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService8" component={CreateService8Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService9" component={CreateService9Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService9_0" component={CreateService9_0Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService10" component={CreateService10Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService11_0" component={CreateService11_0Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService11" component={CreateService11Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService12" component={CreateService12Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateService13" component={CreateService13Screen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="SearchService" component={SearchServiceScreen} />
        <Stack.Screen name="ServiceProfile" component={ServiceProfileScreen} />
        <Stack.Screen name="SearchDirectionCreateService" component={SearchDirectionScreen} />
        <Stack.Screen name="SearchDirectionAlone" component={SearchDirectionScreen} />
        <Stack.Screen name="DisplayImages" component={DisplayImagesScreen} />
        <Stack.Screen name="DisplayReviews" component={DisplayReviewsScreen} />
        <Stack.Screen name="EnlargedImage" component={EnlargedImageScreen} />
        <Stack.Screen name="CalendarPro" component={CalendarProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ListingsPro" component={ListingsProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="SettingsPro" component={SettingsProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="TodayPro" component={TodayProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Professional" component={ProTabNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Directions" component={DirectionsScreen} />
        <Stack.Screen name="EditAccount" component={EditAccountScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="TurnExpert" component={TurnExpertScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="ExpertPlans" component={ExpertPlansScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator({ route }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const [profileImage, setProfileImage] = useState(null);
  const [showTabs, setShowTabs] = useState(true);

  useEffect(() => {
    // Función para obtener la imagen de perfil guardada en AsyncStorage
    const getProfileImage = async () => {
      try {
        const userData = await getDataLocally('user');
        const user = JSON.parse(userData);
        if (user.profile_picture) {
          setProfileImage(user.profile_picture);
        }
      } catch (error) {
        console.log('Error al cargar la imagen de perfil:', error);
      }
    };

    getProfileImage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const getProfileImage = async () => {
        try {
          const userData = await getDataLocally('user');
          const user = JSON.parse(userData);
          if (user.profile_picture) {
            setProfileImage(user.profile_picture);
          }
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      };

      getProfileImage();
    }, [route])
  );


  useFocusEffect(
    useCallback(() => {
      if (route.params?.showTab !== undefined) {
        console.log(route.params.showTab)
        setShowTabs(route.params.showTab);
      }
    }, [route.params?.showTab])
  );

  return (
    <>
      {showTabs ? (
        <Tab.Navigator initialRouteName="Home" screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let IconName;
            switch (route.name) {
              case 'Home':
                IconName = Search;
                break;
              case 'Favorites':
                IconName = focused ? HeartFill : Heart;
                break;
              case 'Services':
                IconName = focused ? SuitcaseFill : Suitcase;
                break;
              case 'Chat':
                IconName = focused ? MessageSquareFill : MessageSquare;
                break;
              case 'Settings':
                return (
                  <View
                    style={{
                      padding: 1, // Espacio entre la imagen y el borde
                      borderRadius: 27, // Un radio un poco mayor para el borde externo
                      borderColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343', // Color del borde
                      borderWidth: focused ? 1 : 0, // Borde condicional
                    }}
                  >
                    <Image
                      source={profileImage ? { uri: profileImage } : require('../assets/defaultProfilePic.jpg')}
                      style={{
                        width: 25,
                        height: 25,
                        borderRadius: 25, // Mantiene la imagen redondeada
                      }}
                    />
                  </View>
                );
            }
            return <IconName color={color} strokeWidth={1.7} width={size} height={size} />;
          },
          tabBarActiveTintColor: colorScheme == 'dark' ? '#f2f2f2' : '#444343',
          tabBarInactiveTintColor: colorScheme == 'dark' ? '#706f6e' : '#B6B5B5',
          tabBarStyle: {
            backgroundColor: colorScheme == 'dark' ? '#323131' : '#fcfcfc',
            paddingBottom: 38,
            paddingTop: 15,
            height: 95,
            borderTopWidth: 0,
            shadowColor: '#000000',
            shadowOpacity: 0.07,
            shadowRadius: 18,
          },
          tabBarLabelStyle: {
            paddingTop: 10,
            fontSize: 10,
            fontFamily: 'inter-medium'
          },
        })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStackNavigator}
          />
          <Tab.Screen name="Favorites" component={FavoritesStackNavigator} />
          <Tab.Screen name="Services" component={ServicesStackNavigator} />
          <Tab.Screen name="Chat" component={ChatStackNavigator} />
          <Tab.Screen name="Settings" component={SettingsStackNavigator} />
        </Tab.Navigator>
      ) : null}
    </>

  );
}

function ProTabNavigator({ route }) {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // Función para obtener la imagen de perfil guardada en AsyncStorage
    const getProfileImage = async () => {
      try {
        const userData = await getDataLocally('user');
        const user = JSON.parse(userData);
        if (user.profile_picture) {
          setProfileImage(user.profile_picture);
        }
      } catch (error) {
        console.log('Error al cargar la imagen de perfil:', error);
      }
    };

    getProfileImage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const getProfileImage = async () => {
        try {
          const userData = await getDataLocally('user');
          const user = JSON.parse(userData);
          if (user.profile_picture) {
            setProfileImage(user.profile_picture);
          }
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      };

      getProfileImage();
    }, [route])
  );


  return (
    <Tab.Navigator initialRouteName="Today" screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let IconName;
        switch (route.name) {
          case 'Today':
            IconName = focused ? SolidBookOpenIcon : OutlineBookOpenIcon;
            break;
          case 'Calendar':
            IconName = focused ? CalendarFillIcon : Calendar;
            break;
          case 'Listings':
            IconName = focused ? BriefcaseFillIcon : BriefcaseIcon;
            break;
          case 'Chat':
            IconName = focused ? MessageSquareFill : MessageSquare;
            break;
          case 'Settings':
            return (
              <View
                style={{
                  padding: 1, // Espacio entre la imagen y el borde
                  borderRadius: 27, // Un radio un poco mayor para el borde externo
                  borderColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343', // Color del borde
                  borderWidth: focused ? 1 : 0, // Borde condicional
                }}
              >
                <Image
                  source={profileImage ? { uri: profileImage } : require('../assets/defaultProfilePic.jpg')}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 25, // Mantiene la imagen redondeada
                  }}
                />
              </View>
            );
        }
        return <IconName color={color} strokeWidth={1.7} width={size} height={size} />;
      },
      tabBarActiveTintColor: colorScheme == 'dark' ? '#f2f2f2' : '#444343',
      tabBarInactiveTintColor: colorScheme == 'dark' ? '#706f6e' : '#B6B5B5',
      tabBarStyle: {
        backgroundColor: colorScheme == 'dark' ? '#323131' : '#fcfcfc',
        paddingBottom: 38,
        paddingTop: 15,
        height: 95,
        borderTopWidth: 0,
        shadowColor: '#000000',
        shadowOpacity: 0.07,
        shadowRadius: 18,
      },
      tabBarLabelStyle: {
        paddingTop: 10,
        fontSize: 10,
        fontFamily: 'inter-medium'
      },
    })}
    >
      <Tab.Screen name="Today" component={TodayProScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Tab.Screen name="Calendar" component={CalendarProScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Tab.Screen name="Listings" component={ListingsProScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} options={{ animation: 'none', gestureEnabled: false }} />
      <Tab.Screen name="Settings" component={SettingsProScreen} options={{ animation: 'none', gestureEnabled: false }} />

    </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="SearchService" component={SearchServiceScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="SearchDirection" component={SearchDirectionScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="DisplayImages" component={DisplayImagesScreen} />
      <Stack.Screen name="DisplayReviews" component={DisplayReviewsScreen} />
      <Stack.Screen name="EnlargedImage" component={EnlargedImageScreen} />
    </Stack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <Stack.Screen name="List" component={ListScreen} />
    </Stack.Navigator>
  );
}

function ServicesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="ChatScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatScreen" component={ChatScreen} />


    </Stack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Directions" component={DirectionsScreen} />
      <Stack.Screen name="AddDirection" component={SearchDirectionScreen} />
    </Stack.Navigator>
  );
}

function CreateServiceStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateService1" component={CreateService1Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService2" component={CreateService2Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService3" component={CreateService3Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService4" component={CreateService4Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService5" component={CreateService5Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService6" component={CreateService6Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService7" component={CreateService7Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService8" component={CreateService8Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService9" component={CreateService9Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService9_0" component={CreateService9_0Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService10" component={CreateService10Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService11_0" component={CreateService11_0Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService11" component={CreateService11Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService12" component={CreateService12Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateService13" component={CreateService13Screen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="SearchDirectionCreateService" component={SearchDirectionScreen} />
    </Stack.Navigator>
  );
}