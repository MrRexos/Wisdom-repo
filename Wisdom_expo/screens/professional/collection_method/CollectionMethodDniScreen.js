import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, Image, Keyboard, TouchableWithoutFeedback, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import PersonFill from "react-native-bootstrap-icons/icons/person-fill";
import eventEmitter from '../../../utils/eventEmitter';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function CollectionMethodDniScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName, dateOfBirth } = route.params;
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const cardColor = colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0';

  const [dni, setDni] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  useEffect(() => {
    const handleCapture = ({ side, data }) => {
      if (side === 'front') setFrontImage(data);
      else setBackImage(data);
    };
    eventEmitter.on('dniCapture', handleCapture);
    return () => eventEmitter.off('dniCapture', handleCapture);
  }, []);

  const handleImage = async (side) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('allow_wisdom_to_access_camera'),
        t('need_camera_access_scan_dni'),
        [
          { text: t('cancel'), style: "cancel" },
          { text: t('settings'), onPress: () => Linking.openSettings() }
        ],
        { cancelable: true }
      );
      return;
    }
    navigation.navigate('DniCamera', { side });
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        <View className="flex-1 px-6 pt-5 pb-6">
          <TouchableOpacity onPress={() => navigation.navigate('WalletPro')}>
            <View className="flex-row justify-start">
              <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
            </View>
          </TouchableOpacity>
          <View className="justify-center items-center">
            <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('enter_your_dni')}</Text>
          </View>
          <View className="flex-1 px-4 justify-center items-center pt-[35px]">
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

            <View></View>

            <View className="justify-center items-center">
              <Text className="mt-[60px] font-inter-bold text-[18px] text-center text-[#979797] dark:text-[#979797]">{t('scan_your_dni')}</Text>
            </View>

            <View className="w-full flex-row justify-between mt-8">
              <TouchableOpacity
                onPress={() => handleImage('front')}
                style={{ aspectRatio: 1.586, borderColor: cardColor, borderWidth: 4 }}
                className="w-[48%] rounded-lg justify-center items-center" >
                {frontImage ? (
                  <Image source={{ uri: frontImage.uri }} className="w-full h-full rounded-lg" />
                ) : (
                  <View className="flex-1 flex-row items-center px-3">
                    <View className="mr-3">
                      <PersonFill viewBox="0 0 16 16" width={44} height={44} fill={cardColor} />
                    </View>
                    <View className="flex-1">
                      <View style={{ backgroundColor: cardColor, height: 6, borderRadius: 4, width: '78%', marginBottom: 10 }} />
                      <View style={{ backgroundColor: cardColor, height: 6, borderRadius: 4, width: '62%', marginBottom: 10 }} />
                      <View style={{ backgroundColor: cardColor, height: 6, borderRadius: 4, width: '46%' }} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleImage('back')}
                style={{ aspectRatio: 1.586, borderColor: cardColor, borderWidth: 4 }}
                className="w-[48%] rounded-lg">
                {backImage ? (
                  <Image source={{ uri: backImage.uri }} className="w-full h-full rounded-lg" />
                ) : (
                  <View className="w-full h-full p-5 justify-between">
                    <View className="flex-row items-center">
                      <View style={{ width: 20, height: 17, borderRadius: 5, backgroundColor: '#3d3d3d', marginRight: 16 }} />
                      <View className="flex-1">
                        <View style={{ backgroundColor: '#3d3d3d', height: 6, borderRadius: 4, width: '78%', marginBottom: 10 }} />
                        <View style={{ backgroundColor: '#3d3d3d', height: 6, borderRadius: 4, width: '62%' }} />
                      </View>
                    </View>
                    <View style={{ backgroundColor: '#3d3d3d', height: 6, borderRadius: 4, width: '100%', alignSelf: 'center' }} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-center items-center">
            <TouchableOpacity
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{ opacity: 1 }}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
              <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!(dni && frontImage && backImage)}
              onPress={() => navigation.navigate('CollectionMethodPhone', { fullName, dni, dateOfBirth, frontImage, backImage })}
              style={{ opacity: dni && frontImage && backImage ? 1.0 : 0.5 }}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
