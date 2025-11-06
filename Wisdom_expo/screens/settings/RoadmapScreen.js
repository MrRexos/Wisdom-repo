import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CheckCircleIcon as OutlineCheckCircleIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from 'react-native-heroicons/solid';

const RoadmapScreen = () => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const colors = useMemo(() => ({
    background: colorScheme === 'dark' ? '#272626' : '#f2f2f2',
    cardBackground: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
    cardBorder: colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0',
    primaryText: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
    secondaryText: colorScheme === 'dark' ? '#d4d4d3' : '#706f6e',
    badgeBackground: colorScheme === 'dark' ? '#34324a' : '#ecebff',
    badgeText: colorScheme === 'dark' ? '#d5d3ff' : '#4d46c7',
    milestonePrimaryBg: colorScheme === 'dark' ? '#31315a' : '#eceafd',
    milestonePrimaryBorder: colorScheme === 'dark' ? '#4946ff' : '#d0ceff',
    milestoneMutedBg: colorScheme === 'dark' ? '#2f2f38' : '#f2f1ff',
    milestoneMutedBorder: colorScheme === 'dark' ? '#3d3d3d' : '#dfdeff',
    milestoneIconBg: colorScheme === 'dark' ? '#4d48ff' : '#4f47ca',
    milestoneIconText: '#f2f2f2',
    outlineIcon: '#b6b5b5',
  }), [colorScheme]);

  const timeline = useMemo(() => ([
    { key: 'rearrangingBoards', titleKey: 'roadmap_item_rearranging_boards', badgeKey: 'roadmap_badge_aug_2024', status: 'done' },
    { key: 'compactView', titleKey: 'roadmap_item_compact_view', badgeKey: 'roadmap_badge_aug_2024', status: 'done' },
    { key: 'appStoreLaunch', titleKey: 'roadmap_milestone_app_store_launch', badgeKey: 'roadmap_badge_jul_2024', type: 'milestone', tone: 'primary', iconLabel: '🎉' },
    { key: 'amountsTracking', titleKey: 'roadmap_item_amounts_tracking', status: 'planned' },
    { key: 'boardEmojiIcons', titleKey: 'roadmap_item_board_emoji_icons', status: 'planned' },
    { key: 'singleBoardWidget', titleKey: 'roadmap_item_single_board_widget', status: 'planned' },
    { key: 'weekdayBreakdown', titleKey: 'roadmap_item_weekday_breakdown', status: 'planned' },
    { key: 'checkinHistory', titleKey: 'roadmap_item_checkin_history', status: 'planned' },
    { key: 'betaLaunch', titleKey: 'roadmap_milestone_beta_launch', badgeKey: 'roadmap_badge_jun_2024', type: 'milestone', tone: 'muted', iconLabel: 'β' },
  ]), []);

  const upcomingFeatures = useMemo(() => ([
    { key: 'reminders', titleKey: 'roadmap_feature_reminders' },
    { key: 'goals', titleKey: 'roadmap_feature_goals' },
    { key: 'appleHealth', titleKey: 'roadmap_feature_apple_health' },
    { key: 'watchOS', titleKey: 'roadmap_feature_watchos_app' },
    { key: 'ipad', titleKey: 'roadmap_feature_ipad_app' },
    { key: 'faceId', titleKey: 'roadmap_feature_face_id_lock' },
    { key: 'multiBoard', titleKey: 'roadmap_feature_multi_board_widget' },
    { key: 'boardSharing', titleKey: 'roadmap_feature_board_sharing' },
    { key: 'macOs', titleKey: 'roadmap_feature_macos_app' },
    { key: 'badges', titleKey: 'roadmap_feature_checkin_badges' },
  ]), []);

  const pastReleases = useMemo(() => ([
    { key: 'iosDesign', titleKey: 'roadmap_release_ios16_design', badgeKey: 'roadmap_badge_sep_2025' },
    { key: 'checkinNotes', titleKey: 'roadmap_release_checkin_notes', badgeKey: 'roadmap_badge_aug_2025' },
    { key: 'localizations', titleKey: 'roadmap_release_localizations', badgeKey: 'roadmap_badge_jun_2025' },
    { key: 'onboardingTutorial', titleKey: 'roadmap_release_onboarding_tutorial', badgeKey: 'roadmap_badge_apr_2025' },
    { key: 'streaks', titleKey: 'roadmap_release_streaks', badgeKey: 'roadmap_badge_apr_2025' },
    { key: 'analytics', titleKey: 'roadmap_release_board_analytics', badgeKey: 'roadmap_badge_mar_2025' },
    { key: 'minimalWidget', titleKey: 'roadmap_release_minimal_widget', badgeKey: 'roadmap_badge_feb_2025' },
    { key: 'dashboardWidget', titleKey: 'roadmap_release_dashboard_widget', badgeKey: 'roadmap_badge_feb_2025' },
    { key: 'dataExport', titleKey: 'roadmap_release_data_export', badgeKey: 'roadmap_badge_jan_2025' },
  ]), []);

  const renderLeadingIcon = (item) => {
    if (item.type === 'milestone') {
      const backgroundColor = item.tone === 'primary' ? colors.milestoneIconBg : colors.milestoneMutedBg;
      const textColor = item.tone === 'primary' ? colors.milestoneIconText : colors.primaryText;
      return (
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor }}>
          <Text className="font-inter-semibold text-[18px]" style={{ color: textColor }}>
            {item.iconLabel}
          </Text>
        </View>
      );
    }

    if (item.status === 'done') {
      return (
        <View className="w-10 h-10 items-center justify-center">
          <SolidCheckCircleIcon size={28} color={colors.badgeText} />
        </View>
      );
    }

    return (
      <View className="w-10 h-10 items-center justify-center">
        <OutlineCheckCircleIcon size={28} color={colors.outlineIcon} />
      </View>
    );
  };

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

  const renderRow = (item, index, arrayLength, options = {}) => {
    const isMilestone = item.type === 'milestone';
    const backgroundColor = isMilestone
      ? (item.tone === 'primary' ? colors.milestonePrimaryBg : colors.milestoneMutedBg)
      : colors.cardBackground;
    const borderColor = isMilestone
      ? (item.tone === 'primary' ? colors.milestonePrimaryBorder : colors.milestoneMutedBorder)
      : colors.cardBorder;

    return (
      <View
        key={item.key}
        className="px-4 py-4"
        style={{
          backgroundColor,
          borderTopWidth: index === 0 && !options.disableTopBorder ? 0 : 1,
          borderBottomWidth: index === arrayLength - 1 ? 0 : 0,
          borderColor,
        }}
      >
        <View className="flex-row items-center space-x-3">
          {renderLeadingIcon(item)}
          <View className="flex-1">
            <Text className="font-inter-semibold text-[15px]" style={{ color: colors.primaryText }}>
              {t(item.titleKey)}
            </Text>
            {item.subtitleKey && (
              <Text className="font-inter-medium text-[13px] mt-1" style={{ color: colors.secondaryText }}>
                {t(item.subtitleKey)}
              </Text>
            )}
          </View>
          {renderBadge(item.badgeKey)}
        </View>
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
      <StatusBar
        translucent
        backgroundColor={colors.background}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />

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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4 pb-6 space-y-8">
          <View>
            <Text className="font-inter-semibold text-[18px] mb-4" style={{ color: colors.primaryText }}>
              {t('roadmap_highlights_title')}
            </Text>
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                overflow: 'hidden',
              }}
            >
              {timeline.map((item, index) => renderRow(item, index, timeline.length, { disableTopBorder: true }))}
            </View>
          </View>

          <View>
            <Text className="font-inter-semibold text-[18px] mb-4" style={{ color: colors.primaryText }}>
              {t('roadmap_major_upcoming_title')}
            </Text>
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                overflow: 'hidden',
              }}
            >
              {upcomingFeatures.map((item, index) => (
                <View
                  key={item.key}
                  className="px-4 py-4"
                  style={{ borderTopWidth: index === 0 ? 0 : 1, borderColor: colors.cardBorder }}
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 items-center justify-center">
                      <OutlineCheckCircleIcon size={28} color={colors.outlineIcon} />
                    </View>
                    <Text className="font-inter-semibold text-[15px]" style={{ color: colors.primaryText }}>
                      {t(item.titleKey)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text className="font-inter-semibold text-[18px] mb-4" style={{ color: colors.primaryText }}>
              {t('roadmap_past_releases_title')}
            </Text>
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                overflow: 'hidden',
              }}
            >
              {pastReleases.map((item, index) => (
                <View
                  key={item.key}
                  className="px-4 py-4"
                  style={{ borderTopWidth: index === 0 ? 0 : 1, borderColor: colors.cardBorder }}
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 items-center justify-center">
                      <SolidCheckCircleIcon size={28} color={colors.badgeText} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter-semibold text-[15px]" style={{ color: colors.primaryText }}>
                        {t(item.titleKey)}
                      </Text>
                    </View>
                    {renderBadge(item.badgeKey)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RoadmapScreen;
