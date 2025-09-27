import React, { useState, useEffect } from 'react';
import { View, Keyboard, StatusBar, Platform, Text, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import EyeIcon from 'react-native-bootstrap-icons/icons/eye';
import EyeSlashIcon from 'react-native-bootstrap-icons/icons/eye-slash';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import api, { setTokens } from '../../utils/api';
import { storeDataLocally } from '../../utils/asyncStorage';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function NewPasswordScreen({ route }) {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const emailOrUsername = route?.params?.emailOrUsername;
  const [code, setCode] = useState('');
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


  
  const inputCodeChanged = (event) => {
    setCode(event.nativeEvent.text);
    setShowError(false);
  };

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

  const nextPressed = async () => {
    if (!emailOrUsername || !code) {
      setShowError(true);
      setErrorMessage(t('passwords_do_not_match'));
      return;
    }

    if (password.length < 8) {
      setShowError(true);
      setErrorMessage(t('password_at_least_eight'));
      return;
    }

    if (password !== confirmPassword) {
      setShowError(true);
      setErrorMessage(t('passwords_do_not_match'));
      return;
    }

    try {
      const response = await api.post('/api/reset-password', { emailOrUsername, code, newPassword: password });
      if (response.data && response.data.token) {
        let user = response.data.user;
        const access = response.data.access_token || response.data.token; // compat 
        const refresh = response.data.refresh_token || null; 
        await setTokens({ access, refresh }); 
        user.token = access; // compat 
        await storeDataLocally('user', JSON.stringify(user));
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setShowError(true);
      setErrorMessage(t('reset_token_error'));
    }
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
    
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1  bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} enableOnAndroid={true} scrollEnabled={keyboardOpen} > 
      <View className="px-5 py-3 w-full">
        <View className="flex-row justify-between">
          <View className="flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
          </TouchableOpacity>
          </View>
          <View className="items-center pt-3">
            <WisdomLogo color = {colorScheme === 'dark' ? '#f2f2f2' : '#444343'} width={55} height={30} />
          </View>
          <View className="flex-1"></View>
        </View>

        <Text className="font-inter-bold text-xl pt-4 text-center text-[#444343] dark:text-[#f2f2f2]">
            {t('set_a_new_password')}
        </Text>
        <Text className="font-inter-semibold text-[15px] pt-10 text-[#444343] dark:text-[#f2f2f2]">
          {t('code')}
        </Text>

        <View className="mt-3 px-5 h-[55px] flex-row justify-start items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
            <TextInput
            placeholder={t('code')}
            autoFocus={true}
            selectionColor={cursorColorChange}
            placeholderTextColor={placeHolderTextColorChange}
            onChange={inputCodeChanged}
            value={code}
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className=" h-[55px] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"/>
        </View>

        <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">
          {t('new_password')}
        </Text>
        
        <View className="mt-3 px-5 h-[55px] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
            <TextInput 
            placeholder={t('new_password')}
            autoFocus={false} 
            secureTextEntry={isSecurePassword}
            selectionColor={cursorColorChange} 
            placeholderTextColor={placeHolderTextColorChange} 
            onChange = {inputNewPasswordChanged} 
            value={password}
            onSubmitEditing={nextPressed}
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className=" text-[15px] h-[55px] flex-1 text-[#444343] dark:text-[#f2f2f2]"/>
                        
            <TouchableOpacity onPress={() => setIsSecurePassword(!isSecurePassword)}>
                {isSecurePassword ? (
                <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
                ) : (
                <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
                )}
            </TouchableOpacity>
        </View>
        <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">
          {t('confirm_new_password')}
        </Text>
        <View className="mt-3 px-5 h-[55px] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
          <TextInput
            placeholder={t('type_it_again')}
            autoFocus={false}
            selectionColor={cursorColorChange}
            placeholderTextColor={placeHolderTextColorChange}
            secureTextEntry={isSecureConfirmation} // Controla la visibilidad del texto
            onChange = {inputConfirmPasswordChanged} 
            value={confirmPassword}
            onSubmitEditing={nextPressed}
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className="h-[55px] flex-1 text-[15px]  text-[#444343] dark:text-[#f2f2f2]"
          />
          <TouchableOpacity onPress={() => setIsSecureConfirmation(!isSecureConfirmation)}>
            {isSecureConfirmation ? (
              <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            ) : (
              <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            )}
          </TouchableOpacity>
          
        </View>
        {showError ? (
          <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
        ) : null}

      </View>
        <View className="justify-center items-center pb-5 pt-10">
          <TouchableOpacity 
          disabled={confirmPassword.length < 1 || password.length < 1}
          onPress={nextPressed}
          style={{opacity: confirmPassword.length < 1 || password.length < 1 ? 0.5 : 1.0}}
          className="bg-[#323131] dark:bg-[#fcfcfc] w-[320px] h-[55px] rounded-full items-center justify-center">
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('safe_and_login')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
