import React, { useEffect, useState, useRef } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Keyboard, TouchableWithoutFeedback} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';
import { Check } from "react-native-feather";



export default function CreateService5Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#b6b5b5' : '#706F6E';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title, family, category, description} = route.params;
  const [showLanguages, setShowLanguages] = useState(false);
  const [showAboutYou, setShowAboutYou] = useState(false);
  const [showTags, setShowTags] = useState(false); 
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isIndividual, setIsIndividual] = useState(true); 
  const [hobbies, setHobbies] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [tags, setTags] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef(null);
  const input2Ref = useRef(null);

  const languages = [
    { id: 1, label: 'Catalan', abbreviation: 'ca' },
    { id: 2, label: 'Spanish', abbreviation: 'es' },
    { id: 3, label: 'English', abbreviation: 'en' },
    { id: 4, label: 'French', abbreviation: 'fr' },
    { id: 5, label: 'Arabic', abbreviation: 'ar' },
    { id: 6, label: 'German', abbreviation: 'de' },
    { id: 7, label: 'Chinese', abbreviation: 'zh' },
    { id: 8, label: 'Japanese', abbreviation: 'ja' },
    { id: 9, label: 'Korean', abbreviation: 'ko' },
    { id: 10, label: 'Portuguese', abbreviation: 'pt' },
    { id: 11, label: 'Russian', abbreviation: 'ru' },
    { id: 12, label: 'Italian', abbreviation: 'it' },
    { id: 13, label: 'Dutch', abbreviation: 'nl' },
    { id: 14, label: 'Turkish', abbreviation: 'tr' },
    { id: 15, label: 'Swedish', abbreviation: 'sv' }
    
  ];

  const inputHobbiesChanged = (text) => {
    setHobbies(text);
  };

  const inputTagsChanged = (text) => {
    setTagsText(text);
  };

  const handleClearText = () => {
    setHobbies('');
  };

  const handleLanguagesPress = () => {
    setShowLanguages(!showLanguages);
    setShowAboutYou(false);
    setShowTags(false);
  };

  const handleAboutYouPress = () => {
    setShowAboutYou(!showAboutYou);
    setShowLanguages(false);
    setShowTags(false);
  };

  const handleTagsPress = () => {
    setShowTags(!showTags);
    setShowLanguages(false);
    setShowAboutYou(false);
  };

  const toggleLanguage = (abbreviation) => {
    if (selectedLanguages.includes(abbreviation)) {
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== abbreviation));
    } else {
      setSelectedLanguages([...selectedLanguages, abbreviation]);
    }
  };

  const handleAddTag = () => {
    if (tagsText.trim() !== '') {
      setTags([...tags, tagsText.trim()]);
      setTagsText('');
    }
  };

  const handleDeleteTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const isSelectedLanguages = (abbreviation) => selectedLanguages.includes(abbreviation);

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
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <ScrollView className="flex-1 px-6 pt-5 pb-6">

            <TouchableOpacity onPress={() => navigation.pop(5)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>

            <View className=" justify-center items-start ">
              <Text className="pl-2 mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('give_some_information')}</Text>
            </View>

            {/* Languages */}

            <View className="mt-[60] flex-1 pl-[30] pr-5 justify-start items-start">
              
              <TouchableOpacity onPress={() => handleLanguagesPress()} className="flex-row w-full justify-between items-center">
                <Text className="font-inter-bold text-[24px] text-[#706f6e] dark:text-[#b6b5b5]">{t('languages')}</Text>
                {showLanguages? (                  
                  <ChevronUpIcon size={20} color={colorScheme=='dark'? '#b6b5b5': '#706f6e'} strokeWidth="2" />
                ): null }
              </TouchableOpacity>

              {showLanguages? (
                  <ScrollView className="pr-12 pl-1 mt-4" style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>                  
                    {languages.map((language) => (
                      <TouchableOpacity
                        key={language.id}                        
                        onPress={() => toggleLanguage(language.abbreviation)}
                        className="flex-row w-full justify-between mt-5 ml-6"
                      >
                        <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5]">
                          {language.label}
                        </Text>
                        <View 
                          style={[
                            styles.checkbox, 
                            { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }, 
                            isSelectedLanguages(language.abbreviation) && { 
                              backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', 
                              borderWidth: 0 
                            }
                          ]}
                        >
                          {isSelectedLanguages(language.abbreviation) && (
                            <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ): null }
              
              {/* About you */}

              <View className="mt-8 justify-start items-start w-full">
                
                <TouchableOpacity onPress={() => handleAboutYouPress()} className="flex-row w-full justify-between items-center ">
                  <Text className="font-inter-bold text-[24px] text-[#706f6e] dark:text-[#b6b5b5]">About you</Text>                 
                  {showAboutYou? (
                    <ChevronUpIcon size={20} color={colorScheme=='dark'? '#b6b5b5': '#706f6e'} strokeWidth="2" />
                  ): null }
                </TouchableOpacity>

                {showAboutYou? (
                  <View className="w-full justify-center items-center">   

                    <TouchableOpacity onPress={() => setIsIndividual(!isIndividual)} className="flex-row w-full justify-between mt-5 pl-6">
                        <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5]">{t('are_you_an_individual')}</Text>
                      <View 
                        style={[
                          styles.checkbox, 
                          { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }, 
                          isIndividual && { 
                            backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131', 
                            borderWidth: 0 
                          }
                        ]}
                      >
                        {isIndividual && (
                          <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                        )}
                      </View>
                    </TouchableOpacity>                                    
                    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
                    <View className="min-h-[100] bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl py-3 px-4 mt-8 w-full" >
                      
                      {hobbies.length > 0 ? (
                      <View className="flex-row justify-end">
                        <TouchableOpacity onPress={handleClearText} className="">
                          <Text className="mb-1 font-inter-medium text-[13px] text-[#d4d4d3] dark:text-[#474646]">{t('clear')}</Text>
                        </TouchableOpacity>
                      </View>
                      ) : null }

                      <TextInput
                          placeholder={t('hobbies_optional_placeholder')}
                        selectionColor={cursorColorChange}
                        placeholderTextColor={placeholderTextColorChange}
                        onChangeText={inputHobbiesChanged}
                        value={hobbies}
                        ref={inputRef}
                        keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                        className="w-full text-[14px] text-[#515150] dark:text-[#d4d4d3]"
                        multiline
                        maxLength={300}
                        style={{ textAlignVertical: 'top' }}
                      />
                    </View>
                    </TouchableWithoutFeedback>
                     
                  </View>
                ): null }

              </View>

              {/* Tags */}

              <View className="mt-8 justify-start items-start w-full">

                <TouchableOpacity onPress={() => handleTagsPress()} className="flex-row w-full justify-between items-center">
                  <Text className="font-inter-bold text-[24px] text-[#706f6e] dark:text-[#b6b5b5]">{t('tags')}</Text>
                  {showTags? (
                    <ChevronUpIcon size={20} color={colorScheme=='dark'? '#b6b5b5': '#706f6e'} strokeWidth="2" />
                  ): null }
                </TouchableOpacity> 

                {showTags ? (
                  <View className="w-full justify-center items-center">  
                    <TouchableWithoutFeedback onPress={() => input2Ref.current?.focus()}>                                
                    <View className="min-h-[150] bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl py-3 px-4 mt-8 w-full" >

                      {/* Display existing tags */}

                      <View className="flex-row justify-start items-center flex-wrap"> 
                        {tags.map((tag, index) => (
                          <View key={index} className="flex-row p-[8] pl-3 bg-[#f2f2f2] dark:bg-[#272626] rounded-full mr-1 mb-1">
                            <Text className="font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{tag}</Text>
                            <TouchableOpacity onPress={() => handleDeleteTag(index)} className="ml-1">
                              <XMarkIcon size={15} color={iconColor} strokeWidth={2} />
                            </TouchableOpacity>
                          </View>
                        ))}

                        <TextInput
                            placeholder={tags.length > 14 ? t('maximum_15_tags') : t('add_a_tag_placeholder')}
                          selectionColor={cursorColorChange}
                          placeholderTextColor={placeholderTextColorChange}
                          onChangeText={inputTagsChanged}
                          value={tagsText}
                          ref={input2Ref}
                          onSubmitEditing={handleAddTag} // Handle adding tag on Enter press
                          keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                          disabled={tags.length > 14}
                          className="text-[14px] text-[#515150] dark:text-[#d4d4d3] max-w-full min-w-10 ml-1 mt-3"
                          style={{ textAlignVertical: 'top' }}
                        />

                      </View>                  
                      
                    </View>
                    </TouchableWithoutFeedback>   
                  </View>
                ) : null }

              </View>

            </View>
            {isKeyboardVisible && (
              <View className="h-[250]"></View>
            )}
            
            
        </ScrollView>
        {/* Buttons */}

        <View className="flex-row justify-center items-center pt-4 pb-6 px-6">
              
          <TouchableOpacity 
          disabled={false}
          onPress={() => navigation.goBack()}
          style={{opacity: 1}}
          className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center" >
                <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          disabled={selectedLanguages.length<1 || tags.length<1}
          onPress={() => navigation.navigate('CreateService6', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags})}
          style={{opacity: (selectedLanguages.length>0 && tags.length>0)? 1 : 0.5}}
          className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
          </TouchableOpacity>

        </View>
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:25,
    borderRadius: 4,
  },
});