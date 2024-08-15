
import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, ScrollView, Text, TouchableOpacity} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';


export default function PrivacyPolicy() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const titleColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textColor = '#979797';
  const textStyle='mb-2 font-inter-medium';
  


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="pl-5 py-3 ">
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color="#f2f2f2" strokeWidth="1.7" className="p-6"/>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="p-4">
        <Text style={{ color: titleColor }} className="text-2xl font-inter-semibold mb-4">
            Privacy Policy 
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Last update: August 15, 2024
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            At Wisdom, we are committed to protecting the privacy of our users and professionals. This Privacy Policy describes how we collect, use, share, and protect your personal information when you use our mobile application, Wisdom, and all associated services. We encourage you to read this policy carefully to understand our data handling practices.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            By using Wisdom, you agree to the terms of this Privacy Policy. If you do not agree with the terms described below, we ask that you do not use our platform.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            1. Information We Collect
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            To provide an optimal and personalized experience, we collect various types of information, including:
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
           A) Information You Provide to Us:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            • Registration Information: When you register on Wisdom, we collect your name, email address, phone number, address, and other relevant information that may be necessary to create and maintain your account.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • Profile Information: Service professionals may provide additional information, such as service descriptions, certifications, availability, pricing, and other information they consider relevant for their profiles.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • Messaging and Communications: We collect information about communications made through our platform, including conversations with other users and professionals.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            B) Information We Collect Automatically:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            • Usage Data: We collect information about your interaction with the app, such as the features you use, the pages you visit, and the time spent on the platform.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • Cookies and Similar Technologies: We use cookies and similar technologies to enhance your experience on our platform, remember your preferences, and collect information about your use of Wisdom.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            C) Information from Third Parties:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            We may receive information about you from third parties, such as social media platforms, marketing partners, and service professionals. This information will be used in accordance with this Privacy Policy.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            2. Use of Collected Information
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The information we collect is used for the following purposes:
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            A) Provision of Services:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            • To create and manage your account.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To facilitate service bookings through the platform.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To enable communication between users and service professionals.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To process transactions and payments securely.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            B) Improvement and Personalization:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            • To personalize your experience on the platform and display relevant content.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To improve and optimize the functionality of Wisdom.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To conduct analysis and market studies to better understand our users and improve our services.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            C) Security and Protection:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            • To protect the integrity of the platform and prevent fraudulent or unauthorized activities.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To verify the identity of users and professionals.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            • To comply with our legal and regulatory obligations.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            3. Sharing of Information
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Wisdom does not sell or rent your personal information to third parties. However, we may share your information in the following circumstances:
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            A) With Other Users:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            When a user books services from a professional, we share the necessary information to facilitate the service, such as the name, location, and contact details.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            B) With Third-Party Service Providers:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            We work with third parties who provide services such as payment processing, data hosting, analytics, and customer service. These third parties only have access to the information necessary to perform their functions and are required to protect your information in accordance with this policy.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            C) For Legal Reasons:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            We may disclose your information if we are required to do so by law or if we believe in good faith that such disclosure is necessary to comply with a legal process, protect our rights, your safety, or the safety of others.
        </Text>

        <Text style={{ color: titleColor }} className="text-base font-inter-medium mt-2 mb-2">
            D) In the Context of a Merger or Acquisition:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            If Wisdom is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you through our platform if there is a change in ownership or in the use of your personal information.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            4. Information Security
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            At Wisdom, we take the security of your personal information very seriously. We implement technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, while we strive to protect your information, we cannot guarantee the absolute security of data transmitted over the Internet or stored in our systems.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            5. Data Retention
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            We retain your personal information for as long as necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            6. Children's Privacy
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Wisdom is not directed to individuals under the age of 18, and we do not knowingly collect personal information from children. If we discover that we have collected personal information from a child under 18 without parental consent, we will take steps to delete that information as soon as possible.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            7. Changes to the Privacy Policy
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of any significant changes through our platform or by other means before the changes take effect. By continuing to use Wisdom after the effective date of the new policy, you agree to those changes.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            8. Contact
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            If you have any questions or concerns about this Privacy Policy or our data handling practices, please feel free to contact us at:
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            9. Acceptance of the Privacy Policy
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            By using Wisdom, you agree to the terms set forth in this Privacy Policy. If you do not agree with this policy, we ask that you do not use our app or its services.
        </Text>

        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
            10. Additional Rights for Residents of the European Union and Other Territories
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            If you reside in the European Union or other jurisdictions that provide additional privacy protections, you may have additional rights regarding your personal information, such as the right to data portability, the right to restrict processing, and the right to lodge a complaint with a supervisory authority.
        </Text>

        <Text style={{ color: textColor }} className="mt-4">
            This Privacy Policy is designed to ensure that your personal information is handled transparently and responsibly, ensuring the privacy and security of our users at all times.
        </Text>
        <View className="h-8"></View>
      </ScrollView>
    </SafeAreaView>
  );
}