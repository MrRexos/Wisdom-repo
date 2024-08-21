
import React, {useState } from 'react';
import {View, StatusBar,SafeAreaView, Platform,Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Animated} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../utils/asyncStorage';


export default function EnterNameScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const placheHolderTextColorChange = colorScheme === 'dark' ? '#706F6E': '#B6B5B5'; 
    const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2': '#444343';
    const [name, setName] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

  
    const inputChanged = (event) => {
        const newName = event.nativeEvent.text;
        setName (newName);
        setShowError(false);
      }

    const nextPressed = async () =>{

      const nameSplited = name.split(" ");

      if (nameSplited.length === 1){
        setErrorMessage('Must enter your surname');
        setShowError(true);
        
      }
      else if (nameSplited.length > 2) {
        setErrorMessage('Must enter only your name and surname');
        setShowError(true);
      }
      else {
        const firstName = nameSplited[0].charAt(0).toUpperCase() + nameSplited[0].slice(1).toLowerCase();
        const surname = nameSplited[1].charAt(0).toUpperCase() + nameSplited[1].slice(1).toLowerCase();
        const userData = await getDataLocally('user');

        if (userData) {
          user = JSON.parse(userData);
          user.name = firstName; 
          user.surname = surname;
          await storeDataLocally('user', JSON.stringify(user));
          navigation.navigate('CreateProfile');
        } else {
          console.log('Not user found in Asyncstorage')
        }
      
    }
    }

    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="px-5 py-3 w-full">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6"/>
            </TouchableOpacity>
            <Text className="font-inter-bold text-xl pt-11 text-[#444343] dark:text-[#f2f2f2]">
                Enter your complete name
            </Text>
            <View className="mt-7 h-[55] flex-row justify-start items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
                <TextInput 
                placeholder='Name and Surname' 
                autoFocus={true} 
                selectionColor={cursorColorChange} 
                placeholderTextColor={placheHolderTextColorChange} 
                onChange = {inputChanged} 
                value={name}
                onSubmitEditing={nextPressed}
                className="px-4 h-[55] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"/>
            </View>
            {
            showError? (
                <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
            ):null
            }
        </View>
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="justify-center items-center pb-6">
                <TouchableOpacity 
                disabled={name.length < 1}
                onPress={nextPressed}
                style={{opacity: name.length < 1 ? 0.5 : 1.0}}
                className="bg-[#323131] dark:bg-[#fcfcfc] w-[320] h-[55] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">Next </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
        
      </SafeAreaView>
    );
}