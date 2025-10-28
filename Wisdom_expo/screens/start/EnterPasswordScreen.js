import React, { useState } from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import EyeIcon from 'react-native-bootstrap-icons/icons/eye';
import EyeSlashIcon from 'react-native-bootstrap-icons/icons/eye-slash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingProgressDots from '../../components/OnboardingProgressDots';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';

export default function EnterPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [showError, setShowError] = useState(false);
  const route = useRoute();
  const {email} = route.params;

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const inputChanged = (event) => {
    const newPassword = event.nativeEvent.text;
    setPassword (newPassword);
    setShowError(false);
  }

  const nextPressed = async () =>{
    if (password.length < 8){
      setShowError(true);
    }
    else {
      navigation.navigate('EnterName', {email, password});
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1  bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
      
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <View className="flex-1 w-full justify-between items-center">
      <View className="px-5 py-3 w-full">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
        </TouchableOpacity>
        <Text className="font-inter-bold text-xl pt-11 text-[#444343] dark:text-[#f2f2f2]">
          {t('set_a_password')}
        </Text>
        
        <View className="mt-7 px-5 h-[55px] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
          <TextInput
            placeholder={t('eight_characters_or_more')}
            autoFocus={true}
            selectionColor={cursorColorChange}
            placeholderTextColor={placeholderTextColorChange}
            secureTextEntry={isSecure} // Controla la visibilidad del texto
            onChange = {inputChanged} 
            value={password}
            onSubmitEditing={nextPressed}
            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            className=" text-[15px w-full h-[55px] flex-1 text-[#444343] dark:text-[#f2f2f2]"
          />
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            {isSecure ? (
              <EyeSlashIcon size={20} color={placeholderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            ) : (
              <EyeIcon size={20} color={placeholderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
            )}
          </TouchableOpacity>
        </View>
        {
            showError? (
                <Text className="text-[#ff633e] text-[13px] pt-3">{t('password_at_least_eight')}</Text>
            ):null
        }
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
        <View className="justify-center items-center pb-6 w-full px-8">
          <View className="mb-[20px]">
            <OnboardingProgressDots currentStep={1} totalSteps={5} />
          </View>
          <TouchableOpacity 
          disabled={password.length < 1}
          onPress={nextPressed}
          style={{opacity: password.length < 1 ? 0.5 : 1.0}}
          className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center">
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('next')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </View>

      </TouchableWithoutFeedback>
    </View>
  );
}