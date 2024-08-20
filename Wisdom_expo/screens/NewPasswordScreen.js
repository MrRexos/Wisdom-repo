import React, { useState, useEffect } from 'react';
import { View, Keyboard, StatusBar, SafeAreaView, Platform, Text, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import EyeIcon from 'react-native-bootstrap-icons/icons/eye';
import EyeSlashIcon from 'react-native-bootstrap-icons/icons/eye-slash';
import WisdomLogo from '../assets/wisdomLogo.tsx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';




export default function LogInScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [isSecurePassword, setIsSecurePassword] = useState(true);
  const [isSecureConfirmation, setIsSecureConfirmation] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [keyboardOpen, setKeyboardOpen] = useState(false);


  

  const inputConfirmPasswordChanged = (event) => {
    const newConfirmPassword = event.nativeEvent.text;
    setConfirmPassword (newConfirmPassword);
    setShowError(false);
  }
  const inputNewPasswordChanged = (event) => {
    const newPassword = event.nativeEvent.text;
    setPassword (newPassword);
    setShowError(false);
  }
  const nextPressed = () =>{
    navigation.navigate('HomeScreen');
  }

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
            Set a new Password
        </Text>
        <Text className="font-inter-semibold text-[15px] pt-10 text-[#444343] dark:text-[#f2f2f2]">
          New Password
        </Text>
        
        <View className="mt-3 px-5 h-[55] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
            <TextInput 
            placeholder='New password' 
            autoFocus={true} 
            secureTextEntry={isSecurePassword}
            selectionColor={cursorColorChange} 
            placeholderTextColor={placeHolderTextColorChange} 
            onChange = {inputNewPasswordChanged} 
            value={password}
            onSubmitEditing={nextPressed}
            className=" h-11 text-[15px] flex-1 text-[#444343] dark:text-[#f2f2f2]"/>
                        
            <TouchableOpacity onPress={() => setIsSecurePassword(!isSecurePassword)}>
                {isSecurePassword ? (
                <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
                ) : (
                <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
                )}
            </TouchableOpacity>
        </View>
        <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">
          Confirm new password
        </Text>
        <View className="mt-3 px-5 h-[55] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
          <TextInput
            placeholder='Type it again'
            autoFocus={true}
            selectionColor={cursorColorChange}
            placeholderTextColor={placeHolderTextColorChange}
            secureTextEntry={isSecureConfirmation} // Controla la visibilidad del texto
            onChange = {inputConfirmPasswordChanged} 
            value={confirmPassword}
            onSubmitEditing={nextPressed}
            className="h-11 text-[15px] flex-1 text-[#444343] dark:text-[#f2f2f2]"
          />
          <TouchableOpacity onPress={() => setIsSecureConfirmation(!isSecureConfirmation)}>
            {isSecureConfirmation ? (
              <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            ) : (
              <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            )}
          </TouchableOpacity>
          
        </View>

      </View>
        <View className="justify-center items-center pb-5 pt-10">
          <TouchableOpacity 
          disabled={confirmPassword.length < 1 || password.length < 1}
          onPress={nextPressed}
          style={{opacity: confirmPassword.length < 1 || password.length < 1 ? 0.5 : 1.0}}
          className="bg-[#323131] dark:bg-[#fcfcfc] w-[320] h-[55] rounded-full items-center justify-center">
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Safe and Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
