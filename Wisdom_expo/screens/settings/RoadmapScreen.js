import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from 'react-native-heroicons/solid';

const StatusCircle = ({ status, accentColor, mutedColor, borderColor }) => {
  if (status === 'done' || status === 'active') {
    return (
      <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: accentColor + '1A' }}>
        <SolidCheckCircleIcon size={28} color={accentColor} />
      </View>
    );
  }

  return (
    <View
      className="w-9 h-9 rounded-full items-center justify-center"
      style={{ borderColor, borderWidth: 2 }}
    >
      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mutedColor }} />
    </View>
  );
};

const RoadmapBadge = ({ label, textColor, backgroundColor }) => (
  <View
    className="px-3 py-[3px] rounded-full"
    style={{ backgroundColor }}
  >
    <Text className="font-inter-semibold text-[12px]" style={{ color: textColor }}>
      {label}
    </Text>
  </View>
);

const RoadmapItem = ({ item, accentColor, mutedColor, borderColor, cardColor, textColor, badgeBackground }) => (
  <View className="flex-row items-center justify-between px-4 py-4" style={{ backgroundColor: cardColor }}>
    <View className="flex-row items-center gap-3 flex-1 pr-4">
      <StatusCircle status={item.status} accentColor={accentColor} mutedColor={mutedColor} borderColor={borderColor} />
      <Text className="font-inter-medium text-[15px]" style={{ color: textColor }}>
        {item.title}
      </Text>
    </View>
    {item.badge ? (
      <RoadmapBadge label={item.badge} textColor={accentColor} backgroundColor={badgeBackground} />
    ) : null}
  </View>
);

const RoadmapBanner = ({ banner, accentColor, textColor, badgeTextColor, badgeBackground }) => (
  <View
    className="px-4 py-4 rounded-2xl mt-4"
    style={{ backgroundColor: accentColor }}
  >
    <View className="flex-row items-center justify-between">
      <Text className="font-inter-semibold text-[15px]" style={{ color: textColor }}>
        {banner.icon} {banner.title}
      </Text>
      <RoadmapBadge label={banner.badge} textColor={badgeTextColor} backgroundColor={badgeBackground} />
    </View>
  </View>
);

export default function RoadmapScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const accentColor = colorScheme === 'dark' ? '#7E6CFF' : '#5F4EE5';
  const mutedColor = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const borderColor = colorScheme === 'dark' ? '#4a4a4a' : '#dcdcdc';
  const backgroundColor = colorScheme === 'dark' ? '#272626' : '#f2f2f2';
  const cardColor = colorScheme === 'dark' ? '#323131' : '#fcfcfc';
  const surfaceColor = colorScheme === 'dark' ? '#2f2d40' : '#edeaff';
  const textColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const secondaryText = colorScheme === 'dark' ? '#c7c7c7' : '#706f6e';
  const chipBackground = colorScheme === 'dark' ? '#3c3561' : '#e8e4ff';
  const bannerBadgeBackground = colorScheme === 'dark' ? '#241f3d' : '#f5f3ff';

  const data = useMemo(() => ({
    focus: [
      { title: t('roadmap.items.rearranging_boards'), badge: t('roadmap.badges.aug_2024'), status: 'active' },
      { title: t('roadmap.items.compact_view'), badge: t('roadmap.badges.aug_2024'), status: 'active' },
      {
        type: 'banner',
        icon: '🎉',
        title: t('roadmap.banners.app_store_launch'),
        badge: t('roadmap.badges.jul_2024'),
      },
      { title: t('roadmap.items.amounts_tracking'), status: 'active' },
      { title: t('roadmap.items.board_emoji_icons'), status: 'active' },
      { title: t('roadmap.items.single_board_widget'), status: 'active' },
      { title: t('roadmap.items.weekday_breakdown_chart'), status: 'active' },
      { title: t('roadmap.items.check_in_history_overview'), status: 'active' },
      {
        type: 'banner',
        icon: 'β',
        title: t('roadmap.banners.beta_launch'),
        badge: t('roadmap.badges.jun_2024'),
      },
    ],
    upcoming: [
      { title: t('roadmap.items.reminders'), status: 'planned' },
      { title: t('roadmap.items.weekly_goals'), status: 'planned' },
      { title: t('roadmap.items.apple_health_integration'), status: 'planned' },
      { title: t('roadmap.items.watch_app'), status: 'planned' },
      { title: t('roadmap.items.ipad_app'), status: 'planned' },
      { title: t('roadmap.items.face_id_lock'), status: 'planned' },
      { title: t('roadmap.items.multi_board_widget'), status: 'planned' },
      { title: t('roadmap.items.board_sharing'), status: 'planned' },
      { title: t('roadmap.items.mac_app'), status: 'planned' },
      { title: t('roadmap.items.check_in_badges'), status: 'planned' },
    ],
    past: [
      { title: t('roadmap.items.ios_26_design'), badge: t('roadmap.badges.sep_2025'), status: 'done' },
      { title: t('roadmap.items.check_in_notes'), badge: t('roadmap.badges.aug_2025'), status: 'done' },
      { title: t('roadmap.items.multilingual_support'), badge: t('roadmap.badges.jun_2025'), status: 'done' },
      { title: t('roadmap.items.onboarding_tutorial'), badge: t('roadmap.badges.apr_2025'), status: 'done' },
      { title: t('roadmap.items.streaks'), badge: t('roadmap.badges.apr_2025'), status: 'done' },
      { title: t('roadmap.items.board_analytics'), badge: t('roadmap.badges.mar_2025'), status: 'done' },
      { title: t('roadmap.items.minimal_widget_style'), badge: t('roadmap.badges.feb_2025'), status: 'done' },
      { title: t('roadmap.items.dashboard_widget_style'), badge: t('roadmap.badges.feb_2025'), status: 'done' },
      { title: t('roadmap.items.data_export'), badge: t('roadmap.badges.jan_2025'), status: 'done' },
    ],
  }), [t]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        backgroundColor,
      }}
      className="flex-1"
    >
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View className="pt-6 w-full justify-center items-center" style={{ backgroundColor }}>
        <View className="flex-row justify-between items-center pb-4 px-4 w-full">
          <View className="flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={textColor} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="font-inter-semibold text-[16px]" style={{ color: textColor }}>
              {t('roadmap.title')}
            </Text>
          </View>
          <View className="flex-1" />
        </View>
      </View>

      <ScrollView className="flex-1" style={{ backgroundColor }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <View className="mt-6">
          <Text className="font-inter-semibold text-[13px] uppercase tracking-[1.2px]" style={{ color: secondaryText }}>
            {t('roadmap.sections.focus')}
          </Text>

          <View className="mt-3 rounded-2xl overflow-hidden" style={{ backgroundColor: cardColor }}>
            {data.focus.map((item, index) => (
              item.type === 'banner' ? (
                <RoadmapBanner
                  key={`banner-${index}`}
                  banner={item}
                  accentColor={surfaceColor}
                  textColor={accentColor}
                  badgeTextColor={accentColor}
                  badgeBackground={bannerBadgeBackground}
                />
              ) : (
                <View key={item.title} style={{ borderBottomWidth: index === data.focus.length - 1 ? 0 : 1, borderColor }}>
                  <RoadmapItem
                    item={item}
                    accentColor={accentColor}
                    mutedColor={mutedColor}
                    borderColor={borderColor}
                    cardColor={cardColor}
                    textColor={textColor}
                    badgeBackground={chipBackground}
                  />
                </View>
              )
            ))}
          </View>
        </View>

        <View className="mt-10">
          <Text className="font-inter-semibold text-[13px] uppercase tracking-[1.2px]" style={{ color: secondaryText }}>
            {t('roadmap.sections.major')}
          </Text>
          <View className="mt-3 rounded-2xl overflow-hidden" style={{ backgroundColor: cardColor }}>
            {data.upcoming.map((item, index) => (
              <View key={item.title} style={{ borderBottomWidth: index === data.upcoming.length - 1 ? 0 : 1, borderColor }}>
                <RoadmapItem
                  item={item}
                  accentColor={accentColor}
                  mutedColor={mutedColor}
                  borderColor={borderColor}
                  cardColor={cardColor}
                  textColor={textColor}
                  badgeBackground={chipBackground}
                />
              </View>
            ))}
          </View>
        </View>

        <View className="mt-10">
          <Text className="font-inter-semibold text-[13px] uppercase tracking-[1.2px]" style={{ color: secondaryText }}>
            {t('roadmap.sections.past')}
          </Text>
          <View className="mt-3 rounded-2xl overflow-hidden" style={{ backgroundColor: cardColor }}>
            {data.past.map((item, index) => (
              <View key={item.title} style={{ borderBottomWidth: index === data.past.length - 1 ? 0 : 1, borderColor }}>
                <RoadmapItem
                  item={item}
                  accentColor={accentColor}
                  mutedColor={mutedColor}
                  borderColor={borderColor}
                  cardColor={cardColor}
                  textColor={textColor}
                  badgeBackground={chipBackground}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
