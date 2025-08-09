import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, Image, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';

export default function CollectionMethodDniScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName } = route.params;
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [dni, setDni] = useState('');
  const [date, setDate] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setOpenDate(false);
  };

  const takePhoto = async (side) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(t('permission_denied'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      const image = result.assets[0];
      const data = { uri: image.uri, base64: image.base64 };
      if (side === 'front') setFrontImage(data);
      else setBackImage(data);
    }
  };

  const pickFromGallery = async (side) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(t('allow_wisdom_to_access_gallery'), t('need_gallery_access'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      const image = result.assets[0];
      const data = { uri: image.uri, base64: image.base64 };
      if (side === 'front') setFrontImage(data);
      else setBackImage(data);
    }
  };

  const handleImage = (side) => {
    Alert.alert('', '', [
      { text: 'Camera', onPress: () => takePhoto(side) },
      { text: t('gallery'), onPress: () => pickFromGallery(side) },
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
          <View className="flex-1 px-6 pt-5 pb-6">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  <View className="flex-row justify-start">
                      <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
                  </View>
              </TouchableOpacity>
              <View className="justify-center items-center">
                <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('enter_your_dni')}</Text>
              </View>
              <View className="flex-1 px-4 pb-[60px] justify-center items-center">
                <View className="w-full h-10 mb-6 p-2 border-b-[1px] border-[#444343] dark:border-[#f2f2f2]">
                  <TextInput
                  placeholder={t('dni')}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeholderTextColorChange}
                  onChangeText={setDni}
                  value={dni}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="h-[50px] w-full flex-1 font-inter-medium text-[18px] text-[#515150] dark:text-[#d4d4d3]"
                  />
                </View>
                <TouchableOpacity onPress={() => setOpenDate(true)} className="w-full h-10 mb-6 p-2 border-b-[1px] border-[#444343] dark:border-[#f2f2f2] justify-center">
                  <Text className="font-inter-medium text-[18px] text-[#515150] dark:text-[#d4d4d3]">
                    {t('date_of_birth')}: {date.toISOString().split('T')[0]}
                  </Text>
                </TouchableOpacity>
                {openDate && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                <View className="w-full flex-row justify-between mt-6">
                  <TouchableOpacity
                    onPress={() => handleImage('front')}
                    className="w-[48%] h-32 bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-lg justify-center items-center">
                    {frontImage ? (
                      <Image source={{ uri: frontImage.uri }} className="w-full h-full rounded-lg" />
                    ) : (
                      <Text className="font-inter-medium text-center text-[15px] text-[#515150] dark:text-[#d4d4d3]">{t('front_of_dni')}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleImage('back')}
                    className="w-[48%] h-32 bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-lg justify-center items-center">
                    {backImage ? (
                      <Image source={{ uri: backImage.uri }} className="w-full h-full rounded-lg" />
                    ) : (
                      <Text className="font-inter-medium text-center text-[15px] text-[#515150] dark:text-[#d4d4d3]">{t('back_of_dni')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-center items-center">
                <TouchableOpacity
                disabled={false}
                onPress={() => navigation.goBack()}
                style={{opacity: 1}}
                className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                disabled={!(dni && frontImage && backImage)}
                onPress={() => navigation.navigate('CollectionMethodPhone', { fullName, dni, dateOfBirth: date.toISOString().split('T')[0], frontImage, backImage })}
                style={{opacity: dni && frontImage && backImage ? 1.0 : 0.5}}
                className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                    <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
                </TouchableOpacity>
              </View>
          </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
