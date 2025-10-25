import { NavigationContainer, useFocusEffect, useNavigation, createNavigationContainerRef  } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image } from 'react-native'
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { getDataLocally } from '../utils/asyncStorage';
import eventEmitter from '../utils/eventEmitter';
import { useEffect, useState, useCallback, useRef } from 'react';

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
import ChooseAccountTypeScreen from '../screens/start/ChooseAccountTypeScreen';
import ForgotPasswordScreen from '../screens/start/ForgotPasswordScreen';
import HomeScreen from '../screens/home/HomeScreen';
import NotificationAllowScreen from '../screens/start/NotificationAllowScreen';
import EmailSendedScreen from '../screens/start/EmailSendedScreen';
import NewPasswordScreen from '../screens/start/NewPasswordScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ListScreen from '../screens/favorites/ListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import ConversationScreen from '../screens/chat/ConversationScreen';
import ChatImageViewerScreen from '../screens/chat/ChatImageViewerScreen';
import PreferencesScreen from '../screens/settings/PreferencesScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import CreateServiceStartScreen from '../screens/professional/create_service/CreateServiceStartScreen';
import CreateServiceTitleScreen from '../screens/professional/create_service/CreateServiceTitleScreen';
import CreateServiceClassificationScreen from '../screens/professional/create_service/CreateServiceClassificationScreen';
import CreateServiceDescriptionScreen from '../screens/professional/create_service/CreateServiceDescriptionScreen';
import CreateServiceDetailsScreen from '../screens/professional/create_service/CreateServiceDetailsScreen';
import CreateServiceLocationScreen from '../screens/professional/create_service/CreateServiceLocationScreen';
import CreateServiceExperiencesScreen from '../screens/professional/create_service/CreateServiceExperiencesScreen';
import CreateServiceImagesScreen from '../screens/professional/create_service/CreateServiceImagesScreen';
import CreateServicePriceTypeScreen from '../screens/professional/create_service/CreateServicePriceTypeScreen';
import CreateServicePriceScreen from '../screens/professional/create_service/CreateServicePriceScreen';
import CreateServiceAskScreen from '../screens/professional/create_service/CreateServiceAskScreen';
import CreateServiceDiscountsScreen from '../screens/professional/create_service/CreateServiceDiscountsScreen';
import CreateServiceConsultScreen from '../screens/professional/create_service/CreateServiceConsultScreen';
import CreateServiceTermsScreen from '../screens/professional/create_service/CreateServiceTermsScreen';
import CreateServiceReviewScreen from '../screens/professional/create_service/CreateServiceReviewScreen';
import SearchDirectionScreen from '../screens/home/SearchDirectionScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ConfirmPaymentScreen from '../screens/home/ConfirmPaymentScreen';
import PaymentMethodScreen from '../screens/booking/PaymentMethodScreen';
import ResultsScreen from '../screens/home/ResultsScreen';
import SearchScreen from '../screens/home/SearchScreen';
import SearchServiceScreen from '../screens/home/SearchServiceScreen';
import ServiceProfileScreen from '../screens/home/ServiceProfileScreen';
import DisplayImagesScreen from '../screens/home/DisplayImagesScreen';
import DisplayReviewsScreen from '../screens/home/DisplayReviewsScreen';
import AddReviewScreen from '../screens/home/AddReviewScreen';
import EnlargedImageScreen from '../screens/home/EnlargedImageScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import SetFinalPriceScreen from '../screens/booking/SetFinalPriceScreen';
import CalendarProScreen from '../screens/professional/CalendarProScreen';
import ListingsProScreen from '../screens/professional/ListingsProScreen';
import SettingsProScreen from '../screens/professional/SettingsProScreen';
import TodayProScreen from '../screens/professional/TodayProScreen';
import CalendarScreen from '../screens/services/CalendarScreen';
import DirectionsScreen from '../screens/settings/DirectionsScreen';
import EditAccountScreen from '../screens/settings/EditAccountScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import WisdomWarrantyScreen from '../screens/settings/WisdomWarrantyScreen';
import CancellationPolicyScreen from '../screens/settings/CancellationPolicyScreen';
import ReservationPolicyScreen from '../screens/settings/ReservationPolicyScreen';
import TurnExpertScreen from '../screens/settings/TurnExpertScreen';
import WalletScreen from '../screens/settings/WalletScreen';
import WalletProScreen from '../screens/professional/WalletProScreen';
import ExpertPlansScreen from '../screens/settings/ExpertPlansScreen';
import FAQScreen from '../screens/settings/FAQScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import CollectionMethodNameScreen from '../screens/professional/collection_method/CollectionMethodNameScreen';
import CollectionMethodBirthScreen from '../screens/professional/collection_method/CollectionMethodBirthScreen';
import CollectionMethodDniScreen from '../screens/professional/collection_method/CollectionMethodDniScreen';
import CollectionMethodPhoneScreen from '../screens/professional/collection_method/CollectionMethodPhoneScreen';
import DniCameraScreen from '../screens/professional/collection_method/DniCameraScreen';
import CollectionMethodIbanScreen from '../screens/professional/collection_method/CollectionMethodIbanScreen';
import CollectionMethodDirectionScreen from '../screens/professional/collection_method/CollectionMethodDirectionScreen';
import CollectionMethodConfirmScreen from '../screens/professional/collection_method/CollectionMethodConfirmScreen';
import FullScreenMapScreen from '../screens/common/FullScreenMapScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [
    Linking.createURL('/'),
    'wisdomexpo://',
    'https://wisdom-app-34b3fb420f18.herokuapp.com'
  ],
  config: {
    screens: {
      NewPassword: {
        path: 'reset-password/:token?',
        parse: {
          token: (token) => token,
        },
      },
    },
  },
};


export default function Navigation() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
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
        <Stack.Screen name="ChooseAccountType" component={ChooseAccountTypeScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={TabNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="NotificationAllow" component={NotificationAllowScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="EmailSended" component={EmailSendedScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ServicesScreen" component={ServicesScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="ChatImageViewer" component={ChatImageViewerScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="List" component={ListScreen} />
        <Stack.Screen name="CreateServiceStack" component={CreateServiceStackNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceStart" component={CreateServiceStartScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceTitle" component={CreateServiceTitleScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceClassification" component={CreateServiceClassificationScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceDescription" component={CreateServiceDescriptionScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceDetails" component={CreateServiceDetailsScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceLocation" component={CreateServiceLocationScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceExperiences" component={CreateServiceExperiencesScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceImages" component={CreateServiceImagesScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServicePrice" component={CreateServicePriceScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServicePriceType" component={CreateServicePriceTypeScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceDiscounts" component={CreateServiceDiscountsScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceAsk" component={CreateServiceAskScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceConsult" component={CreateServiceConsultScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceTerms" component={CreateServiceTermsScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CreateServiceReview" component={CreateServiceReviewScreen} options={{ animation: 'none', gestureEnabled: false }} />
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
        <Stack.Screen name="AddReview" component={AddReviewScreen} />
        <Stack.Screen name="EnlargedImage" component={EnlargedImageScreen} />
        <Stack.Screen name="FullScreenMap" component={FullScreenMapScreen} />
        <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
        <Stack.Screen name="SetFinalPrice" component={SetFinalPriceScreen} />
        <Stack.Screen name="CalendarPro" component={CalendarProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="ListingsPro" component={ListingsProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="SettingsPro" component={SettingsProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="TodayPro" component={TodayProScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Professional" component={ProTabNavigator} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Directions" component={DirectionsScreen} />
        <Stack.Screen name="EditAccount" component={EditAccountScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="WisdomWarranty" component={WisdomWarrantyScreen} />
        <Stack.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />
        <Stack.Screen name="ReservationPolicy" component={ReservationPolicyScreen} />
        <Stack.Screen name="TurnExpert" component={TurnExpertScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="WalletPro" component={WalletProScreen} />
        <Stack.Screen name="ExpertPlans" component={ExpertPlansScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="CollectionMethodName" component={CollectionMethodNameScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CollectionMethodBirth" component={CollectionMethodBirthScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CollectionMethodDni" component={CollectionMethodDniScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CollectionMethodPhone" component={CollectionMethodPhoneScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="DniCamera" component={DniCameraScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CollectionMethodIban" component={CollectionMethodIbanScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CollectionMethodDirection" component={CollectionMethodDirectionScreen} options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="CollectionMethodConfirm" component={CollectionMethodConfirmScreen} options={{ animation: 'none', gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator({ route }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const [profileImage, setProfileImage] = useState(null);
  const [showTabs, setShowTabs] = useState(true);
  const navigation = useNavigation();
  const lastTapRef = useRef(null);

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

    const handleProfileUpdated = async () => {
      try {
        const userData = await getDataLocally('user');
        const user = JSON.parse(userData);
        if (user.profile_picture) {
          setProfileImage(user.profile_picture);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.log('Error al actualizar la imagen de perfil:', error);
      }
    };

    eventEmitter.on('profileUpdated', handleProfileUpdated);
    return () => eventEmitter.off('profileUpdated', handleProfileUpdated);
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
    }, [])
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
          tabBarLabelPosition: 'below-icon',
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
            fontFamily: 'inter-medium',
            textAlign: 'center',
          },
        })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStackNavigator}
            options={{ tabBarLabel: t('home') }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesStackNavigator}
            options={{ tabBarLabel: t('favorites') }}
          />
          <Tab.Screen
            name="Services"
            component={ServicesStackNavigator}
            options={{ tabBarLabel: t('services') }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatStackNavigator}
            options={{ tabBarLabel: t('chat') }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsStackNavigator}
            options={{ tabBarLabel: t('settings') }}
            listeners={{
              tabPress: (e) => {
                const now = Date.now();
                if (lastTapRef.current && now - lastTapRef.current < 300) {
                  e.preventDefault();
                  navigation.navigate('Professional');
                }
                lastTapRef.current = now;
              },
            }}
          />
        </Tab.Navigator>
      ) : null}
    </>

  );
}

function ProTabNavigator({ route }) {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const [profileImage, setProfileImage] = useState(null);
  const navigation = useNavigation();
  const lastTapRef = useRef(null);

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

    const handleProfileUpdated = async () => {
      try {
        const userData = await getDataLocally('user');
        const user = JSON.parse(userData);
        if (user.profile_picture) {
          setProfileImage(user.profile_picture);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.log('Error al actualizar la imagen de perfil:', error);
      }
    };

    eventEmitter.on('profileUpdated', handleProfileUpdated);
    return () => eventEmitter.off('profileUpdated', handleProfileUpdated);
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
    }, [])
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
      <Tab.Screen
        name="Today"
        component={TodayProScreen}
        options={{ animation: 'none', gestureEnabled: false, tabBarLabel: t('today') }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarProScreen}
        options={{ animation: 'none', gestureEnabled: false, tabBarLabel: t('calendar') }}
      />
      <Tab.Screen
        name="Listings"
        component={ListingsProScreen}
        options={{ animation: 'none', gestureEnabled: false, tabBarLabel: t('listings') }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{ animation: 'none', gestureEnabled: false, tabBarLabel: t('chat') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsProScreen}
        options={{ animation: 'none', gestureEnabled: false, tabBarLabel: t('settings') }}
        listeners={{
          tabPress: (e) => {
            const now = Date.now();
            if (lastTapRef.current && now - lastTapRef.current < 300) {
              e.preventDefault();
              navigation.navigate('HomeScreen', {
                screen: 'Home',
                params: { screen: 'HomeScreen' },
              });
            }
            lastTapRef.current = now;
          },
        }}
      />

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
      <Stack.Screen name="AddReview" component={AddReviewScreen} />
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
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="WalletPro" component={WalletProScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Directions" component={DirectionsScreen} />
      <Stack.Screen name="AddDirection" component={SearchDirectionScreen} />
      <Stack.Screen name="CollectionMethodName" component={CollectionMethodNameScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CollectionMethodBirth" component={CollectionMethodBirthScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CollectionMethodDni" component={CollectionMethodDniScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CollectionMethodPhone" component={CollectionMethodPhoneScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CollectionMethodIban" component={CollectionMethodIbanScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CollectionMethodDirection" component={CollectionMethodDirectionScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CollectionMethodConfirm" component={CollectionMethodConfirmScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="DniCamera" component={DniCameraScreen} options={{ animation: 'none', gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

function CreateServiceStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateServiceStart" component={CreateServiceStartScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceTitle" component={CreateServiceTitleScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceClassification" component={CreateServiceClassificationScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceDescription" component={CreateServiceDescriptionScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceDetails" component={CreateServiceDetailsScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceLocation" component={CreateServiceLocationScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceExperiences" component={CreateServiceExperiencesScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceImages" component={CreateServiceImagesScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServicePrice" component={CreateServicePriceScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServicePriceType" component={CreateServicePriceTypeScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceDiscounts" component={CreateServiceDiscountsScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceAsk" component={CreateServiceAskScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceConsult" component={CreateServiceConsultScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceTerms" component={CreateServiceTermsScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="CreateServiceReview" component={CreateServiceReviewScreen} options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="SearchDirectionCreateService" component={SearchDirectionScreen} />
    </Stack.Navigator>
  );
}