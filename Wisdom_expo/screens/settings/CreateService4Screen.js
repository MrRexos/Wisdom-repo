import React, { useState, useEffect  } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, ScrollView, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon } from 'react-native-heroicons/outline';

export default function CreateService4Screen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { title, family, category } = route.params;
  const [description, setDescription] = useState('');
  const maxLength = 2000;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const inputChanged = (text) => {
    setDescription(text);
  };

  const handleDone = () => {
    Keyboard.dismiss();
  };

  const handleClearText = () => {
    setDescription('');
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // Si el teclado se abre
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // Si el teclado se cierra
      }
    );

    // Limpia los listeners cuando el componente se desmonta
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.pop(4)}>
              <View className="flex-row justify-start">
                <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
              </View>
            </TouchableOpacity>

            <View className="justify-center items-center">
              <Text className="mt-[55] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">Add a description</Text>
            </View>

            <View className="flex-1 w-full mt-[50]">
              <View className="w-full min-h-[300] bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl py-4 px-5 ">

                {description.length > 0 ? (
                <View className="flex-row justify-end">
                  <TouchableOpacity onPress={handleClearText} className="">
                    <Text className="mb-1 font-inter-medium text-[13px] text-[#d4d4d3] dark:text-[#474646]">Clear</Text>
                  </TouchableOpacity>
                </View>
                ) : null }

                <TextInput
                  placeholder='Description...'
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeholderTextColorChange}
                  onChangeText={inputChanged}
                  value={description}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="w-full text-[15px] text-[#515150] dark:text-[#d4d4d3]"
                  multiline
                  maxLength={maxLength}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
              
              {/* Contador de palabras */}
              <View className="w-full flex-row justify-end">
                <Text className="pt-2 pr-2 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]">{description.length}/{maxLength}</Text>
              </View>
              {isKeyboardVisible && (
              <View className="h-[200]"></View>
              )}

            </View>
          </View>
        </ScrollView>

        {/* Botones fijos abajo */}
        <View className="flex-row justify-center items-center pt-4 pb-6 px-6">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ opacity: 1 }} className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center">
            <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!description}
            onPress={() => navigation.navigate('CreateService5', { title, family, category, description })}
            style={{ opacity: description ? 1.0 : 0.5 }}
            className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
          </TouchableOpacity>
        </View>
      
    </SafeAreaView>
  );
}
