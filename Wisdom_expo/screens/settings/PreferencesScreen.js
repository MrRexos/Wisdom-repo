
import React, { useState, useCallback } from 'react';
import { Text, View, Button, Switch, Platform, StatusBar, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storeDataLocally } from '../../utils/asyncStorage';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {ChevronRightIcon, ChevronLeftIcon} from 'react-native-heroicons/outline';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function PreferencesScreen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';
  const currentLanguage = i18n.language;
  const languageMap = {
    en: 'English',
    es: 'Español',
    ca: 'Català',
    fr: 'Français',
    zh: '中文',
    ar: 'العربية',
  };

  const Sections = [
    {
      items: [
        {id: 'darkMode', label: t('dark_mode'), type: 'toggle'},
        {id: 'language', label: t('language'), type: 'select', link: 'Language'},
      ]
    },
  ];
  
  const [form, setForm] = useState({
    darkMode: colorScheme === 'dark',
    language: languageMap[currentLanguage]
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleToggleColorScheme = () => {
    toggleColorScheme();
    storeDataLocally('colorScheme', colorScheme === 'dark' ? 'light' : 'dark');
  };

  useFocusEffect(
    useCallback(() => {
      // Actualiza el idioma en el formulario cuando la pantalla vuelve a estar en foco
      setForm((prevForm) => ({
        ...prevForm,
        language: languageMap[i18n.language],
      }));
    }, [i18n.language])
  );

  useRefreshOnFocus(() => {});

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[90px] w-full z-10 justify-end">
        <View className="flex-row justify-between items-center pb-4 px-2">
            <View className="flex-1 ">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor}/>  
                </TouchableOpacity>                             
            </View>
            <View className="flex-1 justify-center items-center ">
                <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('preferences')}</Text>
            </View>
            
            <View className="flex-1"></View>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-[75px] space-y-9" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        
        {Sections.map(({items}, sectionIndex) => (
          <View key={sectionIndex} style={{borderRadius: 12, overflow: 'hidden'}}>
            {items.map(({label, id, type, link}, index) => (
              <View key={id} className="pl-5  bg-[#fcfcfc]  dark:bg-[#323131]" >
                <TouchableOpacity onPress={() => {['select', 'link'].includes(type) && navigation.navigate(link)}} >
                  <View className=" flex-row items-center justify-start ">
                    <View className="h-[45px] flex-1 flex-row items-center justify-start pr-[14px] border-[#e0e0e0] dark:border-[#3d3d3d]" style={[{borderTopWidth: 1}, index===0 && {borderTopWidth: 0 }]}>                   
                      <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{label}</Text>
                      <View className="flex-1"/>
                      
                      {type==='toggle' && ( 
                        <Switch 
                          style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                          value={form[id]} 
                          onValueChange={(value) => {
                            setForm({...form, [id]:value});
                            handleToggleColorScheme();              
                          }} 
                        />
                      )}

                      {type==='select' && ( 
                        <Text className="text-[#706f6e] dark:text-[#b6b5b5] mr-1 text-[14px]">{form[id]}</Text>
                      )}

                      {['select', 'link'].includes(type) &&(
                        <ChevronRightIcon size={23} strokeWidth={1.7} color={colorScheme=='dark'? '#706f6e': '#b6b5b5'}/>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>        
              </View>
            ))}
          </View>
        ))}
        <View className="h-10"></View>
      </ScrollView>
    </SafeAreaView>
  );
}