
import React, {useState } from 'react';
import {View, StatusBar, Platform,Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Animated, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function EnterEmailScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const placheHolderTextColorChange = colorScheme === 'dark' ? '#706F6E': '#B6B5B5'; 
    const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const [email, setEmail] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [apiError, setApiError] = useState('');
  
    const inputChanged = (event) => {
        const newEmail = event.nativeEvent.text;
        setEmail (newEmail);
        setShowError(false);
    };

    const checkEmailExists = async (email) => {
        try {
          const response = await api.get('/api/check-email', {
            params: {
              email: email,  // Pasas el email como parámetro de consulta
            },
          });
      
          if (response.data.exists) {
            setErrorMessage(t('email_already_in_use'));
            setShowError(true);
          } else {
            navigation.navigate('EnterPassword', {email});
          }
        } catch (error) {
          console.error('Error al verificar el email:', error);
        }
    };

    const nextPressed = async () =>{
        setEmail(email.trim().toLowerCase());

        if (email.includes('@')){
            checkEmailExists(email);
        }
        else{
            setErrorMessage(t('email_not_valid'));
            setShowError(true);
        }
    }

    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false} >
        <View className="flex-1 w-full justify-between items-center">
        
        <View className="px-5 py-3  w-full ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6"/>
            </TouchableOpacity>
            <Text className="font-inter-bold text-xl pt-11 text-[#444343] dark:text-[#f2f2f2]">
                {t('enter_your_email')}
            </Text>
            <View className="mt-7 h-[55px] flex-row justify-start items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
                <TextInput 
                placeholder={t('email')}
                autoFocus={true} 
                selectionColor={cursorColorChange} 
                placeholderTextColor={placheHolderTextColorChange} 
                onChange = {inputChanged} 
                value={email}
                onSubmitEditing={nextPressed}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                keyboardType="email-address"
                
                className="px-4  w-full h-[55px] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"/>
            </View>
            {
            showError? (
                <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
            ):null
            }
        </View>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full ">
            <View className="justify-center items-center pb-6 w-full px-8 ">
                <TouchableOpacity 
                disabled={email.length < 1}
                onPress={nextPressed}
                style={{opacity: email.length < 1 ? 0.5 : 1.0}}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">{t('next')} </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
        </View>
        </TouchableWithoutFeedback>
        
      </SafeAreaView>
    );
}