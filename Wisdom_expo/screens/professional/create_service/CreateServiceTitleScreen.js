import React, { useEffect, useState } from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';

export default function CreateServiceTitleScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [title, setTitle] = useState(prevParams.title || '');

  const {
    isEditing,
    hasChanges,
    saving,
    requestBack,
    handleSave,
    confirmVisible,
    handleConfirmSave,
    handleDiscardChanges,
    handleDismissConfirm,
  } = useServiceFormEditing({ prevParams, currentValues: { title }, t });

  const inputChanged = (text) => {
    setTitle(text);
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        <View className="flex-1 px-6 pt-5 pb-6">
            <ServiceFormHeader
              onBack={requestBack}
              onSave={handleSave}
              showSave={isEditing && hasChanges}
              saving={saving}
            />
            <View className=" justify-center items-center">
              <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('what_is_the_title_of_your_service')}</Text>
              <Text className="mt-5 font-inter-bold text-[16px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('this_will_be_the_public_title')}</Text>
            </View>
            <View className="flex-1 px-4 pb-[60px] justify-center items-center">
              <View className="w-full h-10 p-2 border-b-[1px] border-[#444343] dark:border-[#f2f2f2]">
                <TextInput
                placeholder={t('service_title_placeholder')}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeholderTextColorChange}
                onChangeText={inputChanged}
                value={title}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="h-[50px] w-full flex-1 font-inter-medium text-[18px] text-[#515150] dark:text-[#d4d4d3]"
                />
              </View>
            </View>
            <View className="flex-row justify-center items-center">
              <TouchableOpacity 
              disabled={false}
              onPress={() => {
                if (isEditing) {
                  requestBack();
                } else {
                  navigation.goBack();
                }
              }}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
              disabled={title.length < 1}
onPress={() => navigation.navigate('CreateServiceClassification', { prevParams: { ...prevParams, title } })}
              style={{opacity: title.length < 1 ? 0.5 : 1.0}}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>
            </View>
        </View>
      <ServiceFormUnsavedModal
        visible={confirmVisible}
        onSave={handleConfirmSave}
        onDiscard={handleDiscardChanges}
        onDismiss={handleDismissConfirm}
      />
    </SafeAreaView>
  );
}