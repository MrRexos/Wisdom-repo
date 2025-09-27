import React from 'react';
import { View, StatusBar, Platform, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WisdomWarrantyScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const titleColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textColor = '#979797';
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textStyle = 'mb-2 font-inter-medium';

  return (
    <SafeAreaView edges={['top', 'left', 'right']}
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'
    >
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <View className="pl-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        {/* Título principal */}
        <Text style={{ color: titleColor }} className="text-2xl font-inter-bold mb-10">
          {t('wisdom_warranty')}
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          Last updated: September 6, 2025
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          At Wisdom, we work to ensure that every booking is{' '}
          <Text style={{ color: textColor }} className="font-inter-semibold">professional, high-quality, safe, transparent, and fair</Text>, both for clients and professionals. That’s why we created the{' '}
          <Text style={{ color: textColor }} className="font-inter-semibold">Wisdom Guarantee</Text>, a commitment that protects every service reserved and paid through our platform in all its stages.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          With the Wisdom Guarantee:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          • Payments are managed <Text style={{ color: textColor }} className="font-inter-semibold">securely</Text> through a protected and reliable system.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • We provide <Text style={{ color: textColor }} className="font-inter-semibold">specialized support</Text> in case of issues between client and professional.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • Every booking comes with <Text style={{ color: textColor }} className="font-inter-semibold">full traceability</Text>, bringing confidence and transparency.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • If the professional cancels a booking, <Text style={{ color: textColor }} className="font-inter-semibold">the commission is fully refunded to the client</Text>.
        </Text>

        {/* Sección: Why do we charge a commission? */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Why do we charge a commission?
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          The commission is what allows Wisdom to sustain and improve this guarantee, creating a trustworthy environment for everyone. This commission is used for:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          1. <Text style={{ color: textColor }} className="font-inter-semibold">Payment security</Text>: covering the costs of processing transactions with world-class providers.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          2. <Text style={{ color: textColor }} className="font-inter-semibold">Support for clients and professionals</Text>: offering fast assistance for any issue related to bookings, payments, or disputes.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          3. <Text style={{ color: textColor }} className="font-inter-semibold">Platform development and maintenance</Text>: constantly improving the app with new features and greater stability.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          4. <Text style={{ color: textColor }} className="font-inter-semibold">Mutual trust</Text>: ensuring that both clients and professionals enjoy a protected environment where both their money and time are guaranteed.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          The commission is always <Text style={{ color: textColor }} className="font-inter-semibold">10% of the service price</Text>, with a <Text style={{ color: textColor }} className="font-inter-semibold">minimum of €1</Text>, which ensures that the Wisdom Guarantee remains in place even for low-cost services.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          In case of cancellation by the client, <Text style={{ color: textColor }} className="font-inter-semibold">this commission will not be refunded</Text>, thereby ensuring that all management and communication always take place within the app and preventing misuse outside the platform.
        </Text>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
