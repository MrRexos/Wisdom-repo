import React, { useState, useEffect  } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, ScrollView, Keyboard, StyleSheet} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import DateTimePicker from '@react-native-community/datetimepicker';


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
  const [experiences, setExperiences] = useState([]);
  const [experienceId, setExperienceId] = useState(1);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState();
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const inputPositionChanged = (text) => {
    setPosition(text);
  };

  const inputPlaceChanged = (text) => {
    setPlace(text);
  };

  const handleStartDateChange = (event, date) => {
    if (date !== undefined) {
      setTempDate(date); // Almacena la fecha seleccionada temporalmente
    }
  };

  const handleAcceptStartDate = () => {
    setStartDate(tempDate); 
    setTempDate(new Date());
    setOpenStartDate(false);  
  };

  const handleCancelStartDate = () => {
    setTempDate(new Date());
    setOpenStartDate(false); 
    
  };

  const handleEndDateChange = (event, date) => {
    if (date !== undefined) {
      setTempDate(date); 
    }
  };

  const handleAcceptEndDate = () => {
    const today = new Date();
    
    const isToday = (
      tempDate.getDate() === today.getDate() &&
      tempDate.getMonth() === today.getMonth() &&
      tempDate.getFullYear() === today.getFullYear()
    );

    if (tempDate >= today || isToday) {
      setEndDate(null);
    } else {
      setEndDate(tempDate); // Si es en el pasado, establecer la fecha seleccionada
    }
  
    setTempDate(new Date()); // Restablecer la fecha temporal a la fecha actual
    setOpenEndDate(false); // Cerrar el DateTimePicker
  };

  const handleCancelEndDate = () => {
    setTempDate(new Date());
    setOpenEndDate(false); 
  };

  const handleSave = () => {
    experiences.push({id: experienceId, position: position, place: place, startDate: startDate.getTime(), endDate: endDate ? endDate.getTime() : null})
    setPosition('');
    setPlace('');
    setStartDate(new Date());
    setEndDate();
    setExperienceId(experienceId+1);
    setShowAddExperience(false);
  };

  const handleCloseAddExperience = () => {
    setPosition('');
    setPlace('');
    setStartDate(new Date());
    setEndDate();
    setShowAddExperience(false);
  };

  const deleteExperience = (experienceId) => {
    setExperiences(experiences.filter(item => item.id !== experienceId))
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

            {experiences.length>0? (
              <View className="flex-1 justify-center items-center mt-10">

                {experiences.map((exp, index) => (
                  <View key={index} className="flex-row w-full justify-center items-center">

                    <View className="w-[30] h-full items-center pr-5">
                      <View className={`flex-1  bg-[#b6b5b5] dark:bg-[#706F6E] ${index>0 && 'w-[2]'}`}/>
                      <View className={`w-4 h-4 rounded-full border-2 border-[#444343] dark:border-[#f2f2f2] ${exp.endDate? null : colorScheme == 'dark' ? 'bg-[#f2f2f2]' : 'bg-[#444343]'}`}>
                      </View>
                      <View className={`flex-1 w-[2] bg-[#b6b5b5] dark:bg-[#706F6E] ${index===experiences.length-1 ? 'w-[0]' : 'w-[2]'}`}/>
                    </View>

                    <View className="flex-1 py-3 px-5 mb-3 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

                      <View className="mt-1 flex-row justify-between">
                        <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{exp.position}</Text>
                        <TouchableOpacity onPress={() => deleteExperience(exp.id)} className="justify-center items-end">
                          <XMarkIcon size={21} color={iconColor} strokeWidth="2" />
                        </TouchableOpacity>
                      </View>

                      <View className="mt-3 flex-row justify-between items-center mb-[6]">
                        <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{exp.place}</Text>
                        <Text>
                          <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                          <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]"> - </Text>
                          <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Still here'}</Text>
                        </Text>
                      </View>
                      
                    </View>
                  </View>
                ))}
                
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
                <View className="w-full mt-7 mb-7 py-4 px-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

                  <TouchableOpacity onPress={() => handleCloseAddExperience()} className="justify-center items-end">
                    <XMarkIcon size={23} color={iconColor} strokeWidth="2" />
                  </TouchableOpacity>

                  <View className="mb-5 w-full justify-center items-start">
                    <Text className="mb-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Position or study...</Text>
                    <View className="w-full  px-5 justify-center items-start rounded-full bg-[#f2f2f2] dark:bg-[#272626]">           
                      <TextInput
                        placeholder='Position or study...'
                        selectionColor={cursorColorChange}
                        placeholderTextColor={placeHolderTextColorChange}
                        onChangeText={inputPositionChanged} 
                        value={position}
                        keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                        className="py-3 font-inter-medium w-full text-[13px] text-[#444343] dark:text-[#f2f2f2]"           
                      />
                    </View>
                  </View>

                  <View className="mb-7 w-full justify-center items-start">
                    <Text className="mb-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">Place or company...</Text>
                    <View className="w-full px-5 justify-center items-start rounded-full bg-[#f2f2f2] dark:bg-[#272626]">           
                      <TextInput
                        placeholder='Place or company...'
                        selectionColor={cursorColorChange}
                        placeholderTextColor={placeHolderTextColorChange}
                        onChangeText={inputPlaceChanged} 
                        value={place}
                        keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                        className="py-3 font-inter-medium w-full text-[13px] text-[#444343] dark:text-[#f2f2f2]"           
                      />
                    </View>
                  </View>

                  <View className="flex-row justify-center items-center">

                    <TouchableOpacity onPress={() => setOpenStartDate(true)} className="flex-1 justify-center items-center">
                      <Text className="font-inter-semibold text-[14px] text-center underline underline-offset-2 text-[#444343] dark:text-[#f2f2f2]">Started</Text>
                      <Text className="mt-3 font-inter-medium text-[14px] text-center  text-[#b6b5b5] dark:text-[#706f6e]">{startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    {openStartDate && (
                      <View>
                        <View className="w-[300] h-[110]">
                          <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={handleStartDateChange}
                            style={styles.picker}
                          />
                        </View>
                        {Platform.OS === 'ios' ? (
                          <View className="flex-row justify-between px-12">
                            <TouchableOpacity onPress={handleCancelStartDate}>
                              <Text className="mt-3 font-inter-medium text-[15px] text-center text-[#b6b5b5] dark:text-[#706f6e]">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAcceptStartDate}>
                              <Text className="mt-3 font-inter-semibold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">Accept</Text>
                            </TouchableOpacity>
                          </View>
                        ) : null}

                      </View>
                    )}

                    <TouchableOpacity onPress={() => setOpenEndDate(true)} className="flex-1 justify-center items-center">
                      <Text className={`font-inter-semibold text-[14px] text-center underline underline-offset-2 ${endDate && endDate < startDate ? 'text-[#ff633e]' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>End</Text>
                      <Text className="mt-3 font-inter-medium text-[14px] text-center  text-[#b6b5b5] dark:text-[#706f6e]">{endDate? endDate.toLocaleDateString(): 'Still here'}</Text>
                    </TouchableOpacity>

                    {openEndDate && (
                      <View>
                        <View className="w-[300] h-[110]">
                          <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={handleEndDateChange}
                            style={styles.picker}
                          />
                        </View>
                        {Platform.OS === 'ios' ? (
                          <View className="flex-row justify-between px-12">
                            <TouchableOpacity onPress={handleCancelEndDate}>
                              <Text className="mt-3 font-inter-medium text-[15px] text-center text-[#b6b5b5] dark:text-[#706f6e]">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAcceptEndDate}>
                              <Text className="mt-3 font-inter-semibold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">Accept</Text>
                            </TouchableOpacity>
                          </View>
                        ) : null}

                      </View>
                    )}
                    

                  </View>

                  <TouchableOpacity
                    disabled={endDate && endDate < startDate || position.length === 0} 
                    style={{ opacity: endDate && endDate < startDate || position.length === 0 ? 0.2 : 1 }}
                    className={`mt-3 justify-center items-center`}
                    onPress={() => handleSave()}
                  >
                    <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">
                      Save
                    </Text>
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
            disabled={false}
            onPress={() => navigation.navigate('CreateService8', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences})}
            style={{ opacity: 1 }}
            className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
          </TouchableOpacity>
        </View>
      
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  picker: {
    flex: 1,
  },
});