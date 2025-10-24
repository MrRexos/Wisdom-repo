import React from 'react';
import { View, StatusBar, Platform, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';

export default function CancellationPolicyScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const titleColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textColor = '#979797';
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textStyle = 'mb-2 font-inter-medium';

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }}
      className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'
    >
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <View className="pl-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text style={{ color: titleColor }} className="text-2xl font-inter-bold mb-10">
          {t('cancellation_policy')}
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          Last updated: September 6, 2025
        </Text>

        {/* Intro */}
        <Text style={{ color: textColor }} className={textStyle}>
          At Wisdom, we understand that unforeseen circumstances can arise for both clients and professionals. That’s why we have designed a <Text className="font-inter-semibold">Cancellation Policy</Text> that aims to be <Text className="font-inter-semibold">fair, clear, and balanced</Text>, always protecting both parties and maintaining transparency in every booking.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          With our policy:
        </Text>

        {/* Cancellation by the client */}
        <Text style={{ color: titleColor }} className="text-base font-inter-semibold mt-2 mb-2">
          • Cancellation by the client
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          The client may cancel a booking at any time. If they do so <Text className="font-inter-semibold">before the professional accepts it</Text>, the request will be voided and the deposit will be <Text className="font-inter-semibold">fully refunded</Text>, since the service was never confirmed. If the cancellation occurs <Text className="font-inter-semibold">after the professional has accepted the booking</Text>, the deposit paid will <Text className="font-inter-semibold">not be refundable</Text> and will serve as compensation for the late cancellation. No additional amounts will ever be charged after cancellation, but the client will lose the deposit already paid.
        </Text>

        {/* Cancellation by the professional */}
        <Text style={{ color: titleColor }} className="text-base font-inter-semibold mt-4 mb-2">
          • Cancellation by the professional
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          If the professional cancels a confirmed booking, the client will receive a <Text className="font-inter-semibold">full refund</Text>, including Wisdom’s commission. In addition, the professional may face penalties on their account in the case of repeated cancellations, as we seek to protect client trust.
        </Text>

        {/* Cancellation during the service */}
        <Text style={{ color: titleColor }} className="text-base font-inter-semibold mt-4 mb-2">
          • Cancellation during the service
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          If a booking is canceled once the service has already begun, the situation will be evaluated by Wisdom’s support team, who will decide on a partial or full refund depending on the time elapsed and the evidence provided by both parties.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          – In cases of <Text className="font-inter-semibold">no-show</Text> (by the client) or last-minute cancellations, the professional has the right to keep the deposit as compensation. Conversely, if the professional does not show up or fails to provide the service, the client may request a refund of the deposit.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          – Cancellations must be managed through the app in order to be registered. The canceled booking will switch to the “canceled” status and both parties will be notified. In the user’s history, canceled or rejected bookings will appear marked accordingly (status “Canceled” or “Rejected”).
        </Text>

        {/* Our Commitment */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Our Commitment
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          The Cancellation Policy is part of the <Text className="font-inter-semibold">Wisdom Guarantee</Text> and is designed to protect the trust between clients and professionals. Thanks to this system, everyone knows that their rights are supported and that each booking has a fair solution in case of unforeseen circumstances.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          At Wisdom, we promote a safe and transparent environment where every booking is made with <Text className="font-inter-semibold">maximum peace of mind</Text>, knowing that no matter what happens, there will always be a framework of protection and fairness.
        </Text>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

