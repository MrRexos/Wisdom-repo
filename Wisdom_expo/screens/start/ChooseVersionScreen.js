import React, { useMemo, useState } from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import * as FileSystem from 'expo-file-system/legacy';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { UserCheck, Briefcase } from 'react-native-feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingProgressDots from '../../components/OnboardingProgressDots';
import ModalMessage from '../../components/ModalMessage';
import api, { setTokens } from '../../utils/api';
import { storeDataLocally } from '../../utils/asyncStorage';
import { ensureSupportedLanguage } from '../../utils/language';

export default function ChooseVersionScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, password, firstName, surname, username, image } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selected, setSelected] = useState('client');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const options = useMemo(
    () => [
      {
        key: 'client',
        title: t('choose_version_client_title'),
        description: t('choose_version_client_description'),
        Icon: UserCheck,
      },
      {
        key: 'professional',
        title: t('choose_version_professional_title'),
        description: t('choose_version_professional_description'),
        Icon: Briefcase,
      },
    ],
    [t],
  );

  const guessMime = (name, fallback = 'image/jpeg') => {
    const ext = (name?.split('.').pop() || '').toLowerCase();
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    return fallback;
  };

  const uploadImage = async () => {
    if (!image?.uri) return null;
  
    const name = image.fileName || (image.uri.split('/').pop() || 'profile.jpg');
    const type = image.type || guessMime(name);
  
    // tamaño para la firma
    const info = await FileSystem.getInfoAsync(image.uri);
    const size = Number(image.fileSize ?? image.size ?? info.size ?? 0);
  
    // 1) pedir firma
    const { data } = await api.post('/api/uploads/sign', { name, type, size });
    const { uploadUrl, publicUrl } = data;
  
    // 2) subir binario directo al storage (PUT)
    await FileSystem.uploadAsync(uploadUrl, image.uri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': type },
    });
  
    // 3) devolver la URL pública (sin type assertions)
    return publicUrl;
  };

  const handleContinue = async () => {
    if (isProcessing) return;

    setShowErrorModal(false);
    setIsProcessing(true);

    try {
      const isProfessional = selected === 'professional';

      let imageURL = null;
      if (image) {
        imageURL = await uploadImage();
        if (!imageURL) throw new Error('Image upload failed');
      }

      const response = await api.post('/api/signup', {
        email,
        username,
        password,
        first_name: firstName,
        surname,
        language: i18n.language,
        allow_notis: 1,
        profile_picture: imageURL,
        is_professional: isProfessional ? 1 : 0,
      });

      const access = response.data.access_token || response.data.token || null;
      const refresh = response.data.refresh_token || null;
      await setTokens({ access, refresh });

      const resolvedLanguage = ensureSupportedLanguage(i18n.language);
      const userData = {
        token: access,
        id: response.data.userId,
        email,
        username,
        first_name: firstName,
        surname,
        profile_picture: imageURL,
        joined_datetime: new Date().toISOString(),
        is_professional: isProfessional,
        language: resolvedLanguage,
        selectedLanguage: resolvedLanguage,
        allow_notis: true,
        money_in_wallet: '0.00',
        professional_started_datetime: null,
        is_expert: false,
        is_verified: false,
        strikes_num: false,
        hobbies: null,
      };

      await storeDataLocally('user', JSON.stringify(userData));

      navigation.navigate('NotificationAllow', {
        userId: response.data.userId,
        isProfessional,
      });
    } catch (error) {
      console.error('Error creating user in ChooseVersionScreen:', error?.response?.data || error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}
      className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 w-full justify-between">
        <View className="px-5 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
          </TouchableOpacity>
          <View className="px-4 mt-15 justify-center items-center">
            <Text className="font-inter-bold text-center text-[28px] pt-2 text-[#444343] dark:text-[#f2f2f2]">
              {t('choose_version_title')}
            </Text>
            <Text className="font-inter-medium text-center text-[14px] pt-3 text-[#b6b5b5] dark:text-[#706f6e]">
              {t('choose_version_subtitle')}
            </Text>
          </View>
          
          <View className="px-3 pt-[52px]">
            {options.map(({ key, title, description, Icon }) => {
              const isActive = selected === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelected(key)}
                  className={
                    isActive
                      ? 'mb-5 p-5 pr-4 w-full justify-start items-center rounded-2xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e] bg-[#e0e0e0] dark:bg-[#3d3d3d]'
                      : 'mb-5 p-5 w-full justify-start items-center rounded-2xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e] bg-transparent'
                  }
                >

                  <View className="flex-row w-full items-center">
                    <View className="mr-3 p-[3px] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                        {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]"/>)}
                    </View>
                    <View className="flex-row items-start justify-start">
                      <View className="flex-1 pr-4">
                        <Text
                          className={
                            isActive
                              ? 'font-inter-semibold text-[15px] text-[#323131] dark:text-[#fcfcfc]'
                              : 'font-inter-medium text-[15px] text-[#b6b5b5] dark:text-[#706f6e]'
                          }
                        >
                          {title}
                        </Text>
                        
                      </View>
                    </View>
                    </View>
                    {isActive && (
                      <>
                        <Text
                          className='w-full  font-inter-medium  text-[13px] mt-[18px] text-[#979797] dark:text-[#979797]'
                        >
                          {description}
                        </Text>
                        <View
                          className='mt-[18px] mr-1 items-center justify-center'
                        >
                          <Icon
                            color={colorScheme === 'dark' ? '#d4d4d3' : '#515150'}
                            strokeWidth={1.6}
                            width={60}
                            height={60}
                          />
                        </View>
                      </>
                    )
                  }
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View className="justify-center items-center pb-6 w-full px-8">
          <View className="mb-[20px]">
            <OnboardingProgressDots currentStep={4} totalSteps={5} />
          </View>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={isProcessing}
            className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
          >
            {isProcessing ? (
              <ActivityIndicator color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
            ) : (
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                {t('create_account')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ModalMessage
        visible={showErrorModal}
        title={t('user_creation_error_title')}
        description={t('user_creation_error_description')}
        showCancel={false}
        confirmText={t('ok')}
        onConfirm={() => setShowErrorModal(false)}
        onDismiss={() => setShowErrorModal(false)}
      />
    </View>
  );
}
