import React, { useMemo, useState } from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { UserCheck, Briefcase } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingProgressDots from '../../components/OnboardingProgressDots';

export default function ChooseVersionScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, password, firstName, surname, username, image } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selected, setSelected] = useState('client');

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

  const handleContinue = () => {
    navigation.navigate('NotificationAllow', {
      email,
      password,
      firstName,
      surname,
      username,
      image,
      isProfessional: selected === 'professional',
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 w-full justify-between">
        <View className="px-5 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
          </TouchableOpacity>
          <Text className="font-inter-bold text-[26px] pt-2 text-[#444343] dark:text-[#f2f2f2]">
            {t('choose_version_title')}
          </Text>
          <Text className="font-inter-medium text-[14px] pt-3 text-[#706f6e] dark:text-[#b6b5b5]">
            {t('choose_version_subtitle')}
          </Text>
          <OnboardingProgressDots currentStep={4} totalSteps={5} />
          <View className="pt-8">
            {options.map(({ key, title, description, Icon }) => {
              const isActive = selected === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelected(key)}
                  className={
                    isActive
                      ? 'mb-5 p-5 w-full rounded-2xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e] bg-[#e0e0e0] dark:bg-[#3d3d3d]'
                      : 'mb-5 p-5 w-full rounded-2xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e] bg-transparent'
                  }
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <Text
                        className={
                          isActive
                            ? 'font-inter-semibold text-[16px] text-[#323131] dark:text-[#fcfcfc]'
                            : 'font-inter-semibold text-[16px] text-[#b6b5b5] dark:text-[#706f6e]'
                        }
                      >
                        {title}
                      </Text>
                      <Text
                        className={
                          isActive
                            ? 'font-inter-medium text-[13px] mt-3 text-[#515150] dark:text-[#d4d4d3]'
                            : 'font-inter-medium text-[13px] mt-3 text-[#b6b5b5] dark:text-[#706f6e]'
                        }
                      >
                        {description}
                      </Text>
                    </View>
                    <View
                      className={
                        isActive
                          ? 'h-12 w-12 rounded-2xl bg-[#d5d5d5] dark:bg-[#4b4b4b] items-center justify-center'
                          : 'h-12 w-12 rounded-2xl border border-[#b6b5b5] dark:border-[#706f6e] items-center justify-center'
                      }
                    >
                      <Icon
                        color={isActive ? '#323131' : '#b6b5b5'}
                        strokeWidth={1.8}
                        width={26}
                        height={26}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View className="justify-center items-center pb-6 w-full px-8">
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
              {t('create_account')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
