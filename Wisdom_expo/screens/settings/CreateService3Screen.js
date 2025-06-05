import React, { useEffect, useState } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon} from 'react-native-heroicons/outline';
import Triangle from '../../assets/triangle';
import api from '../../utils/api.js';




export default function CreateService3Screen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const {title} = route.params;
  const [family, setFamily] = useState(null);
  const [category, setCategory] = useState(null);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [families, setFamilies] = useState([]);
  const [categories, setCategories] = useState([]);
  


  const getFamilies = async () => {
    try {
      const response = await api.get(`/api/service-family`);
      setFamilies(response.data)
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };

  const getCategories= async (familyId) => {
    try {
      const response = await api.get(`/api/service-family/${familyId}/categories`);
      setCategories(response.data)
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };

  useEffect(() => {
    getFamilies();
  }, []);

  const handleFamilyPress = (option, familyId) => {
    setFamily(option);
    setShowFamilyDropdown(false);
    getCategories(familyId);
  };

  const handleCategoryPress = (option) => {
    setCategory(option);
    setShowCategoryDropdown(false);
  };

  const renderFamilyItem = ({ item }) => (
    <TouchableOpacity className="py-3" onPress={() => handleFamilyPress(item, item.id)}>
      <Text className="ml-6 text-[15px] text-[#444343] dark:text-[#f2f2f2]">{item.service_family}</Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity className="py-3" onPress={() => handleCategoryPress(item)}>
      <Text className="ml-6 text-[15px] text-[#444343] dark:text-[#f2f2f2]">{item.service_category_name}</Text>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.pop(3)}>
                <View className="flex-row justify-start">
                    <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
                </View> 
            </TouchableOpacity>
            <View className=" justify-center items-center ">
              <Text className="mt-[55] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('what_family_and_category_does_it_belong_to')}</Text>
            </View>

            <View className="flex-1 px-9 pb-[80] justify-center items-center">

              <TouchableOpacity onPress={() => {setShowFamilyDropdown(!showFamilyDropdown); setShowCategoryDropdown(false);}} className="w-full px-6 py-4 bg-[#fcfcfc] dark:bg-[#323131] rounded-xl flex-row justify-between items-center">
                <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                  {family ? family.service_family : t('choose_family')}
                </Text>
                {showFamilyDropdown? (
                  <ChevronUpIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                ): (
                  <ChevronDownIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                )}
              </TouchableOpacity>

              {showFamilyDropdown? (
                <View style={{
                  position: 'absolute', 
                  top: 190, 
                  left: 36, 
                  zIndex: 1000, 
                }} className="justify-center items-center w-full mt-2">
                <View className="flex-row w-full justify-end pr-5">
                  <Triangle fill={colorScheme=='dark'? '#323131': '#fcfcfc'} width={30} height={14}/>
                </View>
                <View className="w-full h-[190] bg-[#fcfcfc] dark:bg-[#323131] rounded-xl px-2 pt-3">
                <FlatList
                  data={families}
                  renderItem={renderFamilyItem}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={true}                  
                />
                </View>
              </View>
              ): null}

              <TouchableOpacity onPress={() => {setShowCategoryDropdown(!showCategoryDropdown); setShowFamilyDropdown(false);}} disabled={!family} style={{opacity: family ? 1.0 : 0.4}} className="mt-8 w-full px-6 py-4 bg-[#fcfcfc] dark:bg-[#323131] rounded-xl flex-row justify-between items-center">
                <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">                  
                  {category ? category.service_category_name : t('choose_category')}
                </Text>
                {showCategoryDropdown? (
                  <ChevronUpIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                ): (
                  <ChevronDownIcon size={20} color={colorScheme=='dark'? '#f2f2f2': '#444343'} strokeWidth="2" />
                )}
              </TouchableOpacity>

              {showCategoryDropdown? (
                <View style={{
                  position: 'absolute', 
                  bottom: 10, 
                  left: 36, 
                  zIndex: 1000, 
                }} className="justify-center items-center w-full mt-2">
                <View className="flex-row w-full justify-end pr-5">
                  <Triangle fill={colorScheme=='dark'? '#323131': '#fcfcfc'} width={30} height={14}/>
                </View>
                <View className="w-full h-[190] bg-[#fcfcfc] dark:bg-[#323131] rounded-xl px-2 pt-3">
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={true}                  
                />
                </View>
              </View>
              ): null}

            </View>

            <View className="flex-row justify-center items-center">
              
              <TouchableOpacity 
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
              disabled={!family && !category}
              onPress={() => {navigation.navigate('CreateService4', {title, family, category}); console.log(category.service_category_id)}}
              style={{opacity: family && category? 1.0: 0.5}}
              className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>

            </View>
        </View>
    </SafeAreaView>
  ); 
}
