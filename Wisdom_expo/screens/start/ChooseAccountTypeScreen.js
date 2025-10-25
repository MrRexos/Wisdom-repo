import React, { useState } from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { UserCheck, Briefcase } from 'react-native-feather';
import '../../languages/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingProgressDots from '../../components/OnboardingProgressDots';

const OPTIONS = [
  {
    key: 'client',
    icon: UserCheck,
    titleKey: 'client_version_title',
    descriptionKey: 'client_version_description',
    value: false,
  },
  {
    key: 'professional',
    icon: Briefcase,
    titleKey: 'professional_version_title',
    descriptionKey: 'professional_version_description',
    value: true,
  },
];

export default function ChooseAccountTypeScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, password, firstName, surname, username, image } = route.params;

  const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const activeBackground = colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0';
  const inactiveBackground = colorScheme === 'dark' ? '#272626' : '#ffffff';
  const activeBorder = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const inactiveBorder = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const activeTextColor = colorScheme === 'dark' ? '#f2f2f2' : '#323131';
  const inactiveTextColor = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';

  const handleContinue = () => {
    navigation.navigate('NotificationAllow', {
      email,
      password,
      firstName,
      surname,
      username,
      image,
      isProfessional: selectedOption.value,
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 px-5 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} />
          </TouchableOpacity>
        </View>
        <OnboardingProgressDots totalSteps={5} currentStep={5} style={{ marginTop: 16 }} />
        <Text className="font-inter-bold text-[26px] text-[#444343] dark:text-[#f2f2f2] pt-8">
          {t('choose_version')}
        </Text>
        <Text className="font-inter-medium text-[15px] text-[#706f6e] dark:text-[#b6b5b5] mt-2 pr-6">
          {t('choose_version_description')}
        </Text>
        <View className="flex-1 pt-10">
          {OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOption.key === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSelectedOption(option)}
                activeOpacity={0.9}
                className="mb-5"
                style={{
                  borderRadius: 14,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: isSelected ? activeBorder : inactiveBorder,
                  backgroundColor: isSelected ? activeBackground : inactiveBackground,
                }}
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text
                      className="font-inter-semibold text-[16px]"
                      style={{ color: isSelected ? activeTextColor : inactiveTextColor }}
                    >
                      {t(option.titleKey)}
                    </Text>
                    <Text
                      className="font-inter-medium text-[14px] mt-2 pr-6"
                      style={{ color: isSelected ? activeTextColor : inactiveTextColor, opacity: isSelected ? 1 : 0.8 }}
                    >
                      {t(option.descriptionKey)}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: isSelected
                        ? colorScheme === 'dark'
                          ? '#515150'
                          : '#ffffff'
                        : colorScheme === 'dark'
                        ? '#272626'
                        : '#f2f2f2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: isSelected ? activeBorder : inactiveBorder,
                    }}
                  >
                    <IconComponent color={isSelected ? iconColor : inactiveTextColor} width={26} height={26} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="pb-4">
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
