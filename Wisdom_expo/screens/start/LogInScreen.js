import React, { useState, useEffect } from 'react';
import { View, Keyboard, StatusBar, SafeAreaView, Platform, Text, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import EyeIcon from 'react-native-bootstrap-icons/icons/eye';
import EyeSlashIcon from 'react-native-bootstrap-icons/icons/eye-slash';
import WisdomLogo from '../../assets/wisdomLogo.tsx';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage.js';
import api from '../../utils/api.js';




export default function LogInScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [userEmail, setuser] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiError, setApiError] = useState('');
  

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [keyboardOpen, setKeyboardOpen] = useState(false);


  

  const inputPasswordChanged = (event) => {
    const newPassword = event.nativeEvent.text;
    setPassword (newPassword);
    setShowError(false);
  }

  const inputuserChanged = (event) => {
    const newuser = event.nativeEvent.text;
    setuser (newuser);
    setShowError(false);
  }

  const nextPressed = async () => {
    if (userEmail.length < 1) {
      setShowError(true);
      setErrorMessage("Email or username is missing");
    } else if (password.length < 8) {
      setShowError(true);
      setErrorMessage("Password must be at least 8 characters long");
    } else {
      try {
        const response = await api.post('/api/login', {
          usernameOrEmail: userEmail,
          password: password,
        });
  
        if (response.data.success) {
          let user = response.data.user;
          user.userToken = true;
          
          // Almacena la información del usuario en AsyncStorage
          await storeDataLocally('user', JSON.stringify(user));
  
          // Navega a la pantalla de inicio
          navigation.navigate('HomeScreen');
        } else if (response.data.success===false) {
          setShowError(true);
          setErrorMessage('Password incorrect.');
        } else {
          setShowError(true);
          setErrorMessage('Wrong user or password.');
        };
      } catch (error) {
        console.error('Login error:', error);
        setApiError('Failed to log in');
      }
    }
  };
  

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardOpen(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1  bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} enableOnAndroid={true} scrollEnabled={keyboardOpen} > 
      <View className="px-5 py-3 w-full">
        <View className="flex-row justify-between">
          <View className="flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6" />
            </TouchableOpacity>
          </View>
          <View className="items-center pt-3">
            <WisdomLogo color = {colorScheme === 'dark' ? '#f2f2f2' : '#444343'} width={55} height={30} />
          </View>
          <View className="flex-1"></View>
        </View>

        <Text className="font-inter-bold text-xl pt-4 text-center text-[#444343] dark:text-[#f2f2f2]">
            Welcome back
        </Text>
        <Text className="font-inter-semibold text-[15px] pt-10 text-[#444343] dark:text-[#f2f2f2]">
          Email or username
        </Text>
        
        <View className="mt-3 h-[55] flex-row justify-start items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
            <TextInput 
            placeholder='Email or username' 
            autoFocus={true} 
            selectionColor={cursorColorChange} 
            placeholderTextColor={placeHolderTextColorChange} 
            onChange = {inputuserChanged} 
            value={userEmail}
            onSubmitEditing={nextPressed}
            keyboardType="email-address"
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className="px-4 h-11 text-[15px] text-[#444343] dark:text-[#f2f2f2]"/>
        </View>
        <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">
          Password
        </Text>
        <View className="mt-3 px-5 h-[55] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
          <TextInput
            placeholder='password'
            autoFocus={false}
            selectionColor={cursorColorChange}
            placeholderTextColor={placeHolderTextColorChange}
            secureTextEntry={isSecure} // Controla la visibilidad del texto
            onChange = {inputPasswordChanged} 
            value={password}
            onSubmitEditing={nextPressed}
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className="h-11 text-[15px] flex-1 text-[#444343] dark:text-[#f2f2f2]"
          />
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            {isSecure ? (
              <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            ) : (
              <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            )}
          </TouchableOpacity>
          
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={{color:placeHolderTextColorChange}} className="text-right text-[13px] mt-2">Forgot Password?</Text>
        </TouchableOpacity>
        {
            showError? (
                <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
            ):null
        }
      </View>
        <View className="justify-center items-center pb-6 pt-7">
          <TouchableOpacity 
          disabled={password.length < 1 || userEmail.length < 1}
          onPress={nextPressed}
          style={{opacity: password.length < 1 || userEmail.length < 1 ? 0.5 : 1.0}}
          className="bg-[#323131] dark:bg-[#fcfcfc] w-[320] h-[55] rounded-full items-center justify-center">
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

