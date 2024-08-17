import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, Text, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import EyeIcon from 'react-native-bootstrap-icons/icons/eye';
import EyeSlashIcon from 'react-native-bootstrap-icons/icons/eye-slash';

export default function EnterPasswordScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [showError, setShowError] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const inputChanged = (event) => {
    const newPassword = event.nativeEvent.text;
    setPassword (newPassword);
    setShowError(false);
  }
  const nextPressed = () =>{
    if (password.length < 8){
      setShowError(true);
    }
    else{
      navigation.navigate('EnterName');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1  bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="px-5 py-3 w-full">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6" />
        </TouchableOpacity>
        <Text className="font-inter-bold text-xl pt-11 text-[#444343] dark:text-[#f2f2f2]">
          Set a password
        </Text>
        <View className="mt-7 px-5 h-[55] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
          <TextInput
            placeholder='8 characters or more'
            autoFocus={true}
            selectionColor={cursorColorChange}
            placeholderTextColor={placeholderTextColorChange}
            secureTextEntry={isSecure} // Controla la visibilidad del texto
            onChange = {inputChanged} 
            value={password}
            onSubmitEditing={nextPressed}
            className="h-11 text-[15px] flex-1 text-[#444343] dark:text-[#f2f2f2]"
          />
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            {isSecure ? (
              <EyeSlashIcon size={20} color={placeholderTextColorChange} style={{ marginLeft: 10 }} />
            ) : (
              <EyeIcon size={20} color={placeholderTextColorChange} style={{ marginLeft: 10 }} />
            )}
          </TouchableOpacity>
        </View>
        {
            showError? (
                <Text className="text-[#ff633e] text-[13px] pt-3">Password must be at least 8 characters</Text>
            ):null
        }
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="justify-center items-center pb-6">
          <TouchableOpacity 
          disabled={password.length < 1}
          onPress={nextPressed}
          style={{opacity: password.length < 1 ? 0.5 : 1.0}}
          className="bg-[#323131] dark:bg-[#fcfcfc] w-[320] h-[55] rounded-full items-center justify-center">
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
