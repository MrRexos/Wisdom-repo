

import React, {useState } from 'react';
import {View, StatusBar,SafeAreaView, Platform,Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Animated} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import WisdomLogo from '../../assets/wisdomLogo.tsx'


export default function ForgotPasswordScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const placheHolderTextColorChange = colorScheme === 'dark' ? '#706F6E': '#B6B5B5'; 
    const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const [email, setEmail] = useState('');
    const [showError, setShowError] = useState(false);
  
    const inputChanged = (event) => {
        const newEmail = event.nativeEvent.text;
        setEmail (newEmail);
        setShowError(false);
      }
    const nextPressed = () =>{
    if (email.includes('@')){
        navigation.navigate('EmailSended');
    }
    else{
        setShowError(true);
    }
    }

    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          <View className="px-5 py-3  w-full">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6" />
                </TouchableOpacity>
              </View>
              <View className="items-center pt-3">
                <WisdomLogo color = {colorScheme === 'dark' ? '#f2f2f2' : '#444343'} width={55} height={30} />
              </View>
              <View className="flex-1">
              </View>
            </View>

            <Text className="font-inter-bold text-xl pt-4 text-center text-[#444343] dark:text-[#f2f2f2]">
                {t('restart_password')}
            </Text>
            <View className="justify-center items-center px-5">
              <Text className="font-inter-medium text-[13px] text-center pt-3 text-[#B6B5B5] dark:text-[#706F6E]">
                {t('reset_link_instruction')}
              </Text>
            </View>
            <Text className="font-inter-semibold text-[15px] pt-10 text-[#444343] dark:text-[#f2f2f2]">
              {t('email_or_username')}
            </Text>
            
            <View className="mt-3 h-[55] flex-row justify-start items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
                <TextInput 
                placeholder={t('email_or_username')}
                autoFocus={true} 
                selectionColor={cursorColorChange} 
                placeholderTextColor={placheHolderTextColorChange} 
                onChange = {inputChanged} 
                value={email}
                onSubmitEditing={nextPressed}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="px-4 h-[55] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"/>
            </View>
            {
            showError? (
                <Text className="text-[#ff633e] text-[13px] pt-3">{t('email_not_valid')}</Text>
            ):null
            }
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
              <View className="justify-center items-center pb-6 w-full px-8">
                  <TouchableOpacity 
                  disabled={email.length < 1}
                  onPress={nextPressed}
                  style={{opacity: email.length < 1 ? 0.5 : 1.0}}
                  className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center" >
                      <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">{t('send_link')}</Text>
                  </TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
        
      </SafeAreaView>
    );
}