import React, { useState, useEffect  } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, ScrollView, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import DateTimePickerModal from "react-native-modal-datetime-picker";


export default function CreateService7Screen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate} = route.params;
  const [position, setPosition] = useState('');
  const [place, setPlace] = useState('');
  const [experiences, setExperiences] = useState();
  const [experienceItem, setExperienceItem] = useState([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)

  const inputPositionChanged = (text) => {
    setPosition(text);
  };

  const inputPlaceChanged = (text) => {
    setPlace(text);
  };

  const handleConfirm = (date) => {
    console.log("A date has been picked: ", date);
    setOpenStartDate(false);;
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

          <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.pop(7)}>
              <View className="flex-row justify-start">
                <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
              </View>
            </TouchableOpacity>

            <View className="justify-center items-center">
              <Text className="mt-[55] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">Your experience</Text>
              <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#b6b5b5] dark:text-[#706f6e]">Show your entire career with this service</Text>
            </View>

            {experiences? (
              <View className="flex-1 justify-center items-center">

              </View>
            ) : null }

            {!showAddExperience? (

              <View className="flex-1 justify-center items-center">
                <TouchableOpacity onPress={() => setShowAddExperience(true)}>
                  <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">+ Add an experience</Text>
                </TouchableOpacity>
              </View>

            ): (
              <View className="flex-1 justify-center items-center">
                <View className="w-full h-[330] mt-7 py-4 px-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

                  <TouchableOpacity onPress={() => setShowAddExperience(false)} className="justify-center items-end">
                    <XMarkIcon size={23} color={iconColor} strokeWidth="2" />
                  </TouchableOpacity>

                  <View className="mb-5 w-full justify-center items-start">
                    <Text className="mb-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Position or study...</Text>
                    <View className="w-full py-3 px-5 justify-center items-start rounded-full bg-[#f2f2f2] dark:bg-[#272626]">           
                      <TextInput
                        placeholder='Position or study...'
                        selectionColor={cursorColorChange}
                        placeholderTextColor={placeHolderTextColorChange}
                        onChangeText={inputPositionChanged} 
                        value={position}
                        keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                        className="font-inter-medium w-full text-[13px] text-[#444343] dark:text-[#f2f2f2]"           
                      />
                    </View>
                  </View>

                  <View className="mb-7 w-full justify-center items-start">
                    <Text className="mb-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Place or company...</Text>
                    <View className="w-full py-3 px-5 justify-center items-start rounded-full bg-[#f2f2f2] dark:bg-[#272626]">           
                      <TextInput
                        placeholder='Place or company...'
                        selectionColor={cursorColorChange}
                        placeholderTextColor={placeHolderTextColorChange}
                        onChangeText={inputPlaceChanged} 
                        value={place}
                        keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                        className="font-inter-medium w-full text-[13px] text-[#444343] dark:text-[#f2f2f2]"           
                      />
                    </View>
                  </View>

                  <View className="flex-row justify-center items-center">

                    <TouchableOpacity onPress={() => setOpenStartDate(true)} className="flex-1 justify-center items-center">
                      <Text className="font-inter-semibold text-[14px] text-center underline underline-offset-2 text-[#444343] dark:text-[#f2f2f2]">Started</Text>
                      <Text className="mt-3 font-inter-medium text-[14px] text-center  text-[#b6b5b5] dark:text-[#706f6e]">July</Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={openStartDate}
                      mode="datetime"
                      onConfirm={handleConfirm}
                      onCancel={() => setOpenStartDate(false)}
                    />

                    <TouchableOpacity className="flex-1 justify-center items-center">
                      <Text className="font-inter-semibold text-[14px] text-center underline underline-offset-2 text-[#444343] dark:text-[#f2f2f2]">End</Text>
                      <Text className="mt-3 font-inter-medium text-[14px] text-center  text-[#b6b5b5] dark:text-[#706f6e]">Still here</Text>
                    </TouchableOpacity>
                    

                  </View>

                  <TouchableOpacity className="mt-3 justify-center items-center">
                    <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">Save</Text>
                  </TouchableOpacity>

                </View>
              </View>
            )}

           
          </View>
        </ScrollView>

        {/* Botones fijos abajo */}
        <View className="flex-row justify-center items-center pt-4 pb-6 px-6">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ opacity: 1 }} className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center">
            <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!description}
            onPress={() => navigation.navigate('CreateService8', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate})}
            style={{ opacity: description ? 1.0 : 0.5 }}
            className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
          </TouchableOpacity>
        </View>
      
    </SafeAreaView>
  );
}
