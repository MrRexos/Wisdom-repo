import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CheckCircleIcon as OutlineCheckCircleIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as SolidCheckCircleIcon, LockClosedIcon, RocketLaunchIcon } from 'react-native-heroicons/solid';

const RoadmapScreen = () => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const colors = useMemo(() => ({
    background: colorScheme === 'dark' ? '#272626' : '#f2f2f2',
    primaryText: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
    secondaryText: colorScheme === 'dark' ? '#d4d4d3' : '#515150',
    badgeBackground: colorScheme === 'dark' ? '#474646' : '#d4d4d3',
    badgeText: colorScheme === 'dark' ? '#272626' : '#f2f2f2',
    milestonePrimaryBorder: colorScheme === 'dark' ? '#4946ff' : '#d0ceff',
    milestoneMutedBorder: colorScheme === 'dark' ? '#3d3d3d' : '#dfdeff',
    milestoneIconBg: colorScheme === 'dark' ? '#4d48ff' : '#4f47ca',
    milestoneIconText: '#f2f2f2',
    outlineIcon: colorScheme === 'dark' ? '#979797' : '#4f47ca',
    checkIcon: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
  }), [colorScheme]);

  
  const upcomingFeatures = useMemo(() => ([
    { key: 'filterSearch', titleKey: 'roadmap_feature_filter_search' },
    { key: 'notifications', titleKey: 'roadmap_feature_notifications' },
    { key: 'moreLanguages', titleKey: 'roadmap_feature_more_languages' },
    { key: 'web', titleKey: 'roadmap_feature_web' },
    { key: 'officialLaunch', titleKey: 'roadmap_feature_official_launch' },
    { key: 'consultations', titleKey: 'roadmap_feature_consultations' },
    { key: 'loginOptions', titleKey: 'roadmap_feature_login_options' },
    { key: 'profiles', titleKey: 'roadmap_feature_profile_pro_client' },
    { key: 'servicesMap', titleKey: 'roadmap_feature_services_map' },
    { key: 'recurringBookings', titleKey: 'roadmap_feature_recurring_bookings' },
    { key: 'discounts', titleKey: 'roadmap_feature_discounts' },
    { key: 'calendar', titleKey: 'roadmap_feature_calendar' },
    { key: 'premium', titleKey: 'roadmap_feature_premium_version' },
    { key: 'cardsBadges', titleKey: 'roadmap_feature_cards_badges' },
    { key: 'giftCards', titleKey: 'roadmap_feature_gift_cards' },
  ]), []);

  const pastReleases = useMemo(() => ([
    { key: 'editService', titleKey: 'roadmap_release_edit_service', badgeKey: 'roadmap_badge_oct_2025' },
    { key: 'bookings', titleKey: 'roadmap_release_bookings', badgeKey: 'roadmap_badge_jul_2025' },
    { key: 'chat', titleKey: 'roadmap_release_chat', badgeKey: 'roadmap_badge_jun_2025' },
    { key: 'translations', titleKey: 'roadmap_release_translations_multi', badgeKey: 'roadmap_badge_may_2025' },
  ]), []);


  const renderBadge = (badgeKey) => {
    if (!badgeKey) {
      return null;
    }

    return (
      <View
        className="px-3 py-[6px] rounded-full"
        style={{ backgroundColor: colors.badgeBackground }}
      >
        <Text className="font-inter-semibold text-[12px]" style={{ color: colors.badgeText }}>
          {t(badgeKey)}
        </Text>
      </View>
    );
  };

  return (
    <View
      className="flex-1"
      style={{
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar translucent backgroundColor={colors.background} barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}/>

      <View className="pt-6" style={{ backgroundColor: colors.background }}>
        <View className="flex-row justify-between items-center pb-4 px-2">
          <View className="flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="font-inter-semibold text-center text-[16px]" style={{ color: colors.primaryText }}>
              {t('roadmap')}
            </Text>
          </View>
          <View className="flex-1" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        <View className="px-6 pt-4 pb-6 space-y-8">
          

          <View>
            <Text className="font-inter-bold text-[18px] mb-7 mt-3" style={{ color: colors.primaryText }}>
              {t('roadmap_major_upcoming_title')}
            </Text>
            <View>
              {upcomingFeatures.map((item, index) => (
                <View key={item.key} className="py-2 ">
                  <View className="flex-row items-start">
                    <View className="w-10 items-center justify-center ">
                      <View className='h-6 w-6 rounded-full border-2 border-[#d4d4d3] dark:border-[#474646]'/>
                    </View>
                    <View className="flex-1 pr-2 " style={{marginTop:2}}>
                      <Text className="font-inter-medium text-[15px] leading-[20px] ml-2 " style={{ color: colors.secondaryText }}>
                        {t(item.titleKey)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text className="font-inter-bold text-[18px] mb-7 mt-10" style={{ color: colors.primaryText }}>
              {t('roadmap_past_releases_title')}
            </Text>
            <View>
              {pastReleases.map((item, index) => (
                <View key={item.key} className="py-2">
                  <View className="flex-row items-start">
                    <View className="w-10 items-center justify-center ">
                      <SolidCheckCircleIcon size={28} color={colors.checkIcon} />
                    </View>
                    <View className="flex-1 pr-2 mt-1">
                      <Text className="font-inter-medium text-[15px] leading-[20px] ml-2" style={{ color: colors.secondaryText }}>
                        {t(item.titleKey)}
                      </Text>
                    </View>
                    <View style={{marginTop:0.5}}> 
                          {renderBadge(item.badgeKey)}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className='px-12 mt-5'>
            <View className='rounded-full py-3 px-3 flex-row items-center justify-center dark:bg-[#323131] bg-[#d4d4d3]'>
              <LockClosedIcon size={16} color={colors.checkIcon} />
              <Text className="font-inter-medium text-[14px] ml-2" style={{ color: colors.checkIcon }}>
                {`${t('roadmap_milestone_beta_launch')} · ${t('roadmap_badge_dec_2024')}`}
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default RoadmapScreen;
