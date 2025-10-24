
import React, { useEffect } from 'react'
import {View, StatusBar, Platform, ScrollView, Text, TouchableOpacity} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';


export default function TermsScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const titleColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textColor = '#979797';
  const titleStyle='text-xl font-inter-semibold mt-4 mb-2';
  const textStyle='mb-2 font-inter-medium';
  const iconColor = colorScheme === 'dark' ? '#f2f2f2': '#444343';


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      <View className="pl-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6"/>
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text style={{ color: titleColor }} className="text-2xl font-inter-bold mb-10">
        {t('terms_and_conditions')}
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Last updated: August 15, 2024
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            These Terms and Conditions of Use govern the access and use of the mobile application Wisdom, developed and managed by us. By downloading, installing, and using Wisdom, you agree to be bound by these Terms. If you do not agree with any of the terms stipulated herein, please do not use the Application.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            1. Definitions
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            A) Users: Refers to any person who accesses, browses, uses, or registers in the Application to search for, compare, and contract professional services offered by Professionals.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            B) Professionals: Natural or legal persons who register in the Application to offer their professional services through the platform.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
            C) Services: Refers to the professional and essential services offered by Professionals through the Application.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            2. Registration and Account Creation
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            To use Wisdom, it is necessary for the User and/or Professional to register and create a personal account. Users must be of legal age according to the current legislation in their place of residence. By registering, the User and/or Professional agrees to provide truthful, complete, and updated information. The Company reserves the right to suspend or cancel any account if false, inaccurate, or misleading information is detected.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            3. Use of the Application
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Company grants the User and/or Professional a limited, non-exclusive, non-transferable, and revocable license to access and use the Application in accordance with these Terms.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The User and/or Professional agrees not to use the Application for illegal, fraudulent, or unauthorized activities, and not to attempt to disable, damage, or overload the Application’s infrastructure.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Company reserves the right to modify, suspend, or discontinue, temporarily or permanently, the Application or any functionality, with or without prior notice.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            4. Services Offered
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Company acts solely as an intermediary between Users and Professionals, facilitating the connection between both parties.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Users can leave ratings and comments about the Services received. Professionals cannot censor or alter User ratings. The Company reserves the right to remove comments it deems offensive, inappropriate, or false.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            5. Transactions and Payments
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Application integrates secure payment systems that allow Users to make payments to Professionals easily and securely. Available payment methods may vary depending on the location of the User and Professional. All transactions between the User and Professional must be conducted within the application; otherwise, the professional’s account will be penalized with a strike.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Company may charge a commission for mediating transactions conducted through the application. This commission will be clearly communicated before the confirmation of any payment.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            6. Real-Time Messaging
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Users and Professionals must use messaging in a professional and respectful manner. The use of this feature to send messages that lead to communication outside the application (phone number, email…), or that are abusive, harassing, offensive, or unsolicited, is prohibited.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Company reserves the right to monitor communications in the Application to ensure compliance with these Terms and to protect all Users.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            7. Intellectual Property
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            All intellectual property rights to the Application, including but not limited to its design, software, source code, logos, trademarks, and original content, are the exclusive property of the Company or its licensors.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            By uploading content to the Application, the User and/or Professional grants the Company a non-exclusive, worldwide, royalty-free, and sublicensable license to use, reproduce, modify, and distribute such content in connection with the operation and promotion of the Application.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            8. Privacy and Data Protection
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Please review our Privacy Policy, which also governs the use of the Services, for information on how we collect, use, and share your information.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            9. Modification of Terms
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The Company reserves the right to modify these Terms at any time. Any significant changes will be notified to the User and/or Professional through the Application or by other available means of communication.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            Continued use of the Application after notification of any changes will constitute acceptance of the new Terms. If the User and/or Professional does not agree with the modified terms, they must stop using the Application.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            10. Termination
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            The User and/or Professional may stop using the Application at any time and close their account following the procedure indicated in the Application. Additionally, the Company reserves the right to suspend or cancel any account in case of violation of these Terms, or for any other legitimate reason, with or without prior notice. Upon termination, all licenses and rights granted to the User and/or Professional under these Terms will cease immediately.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            11. Governing Law and Jurisdiction
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            These Terms shall be governed by and construed in accordance with the laws of jurisdiction, without regard to its conflict of laws. Any dispute relating to these Terms or the use of the Application shall be submitted to the exclusive jurisdiction of the courts of Spain.
        </Text>

        <Text style={{ color: titleColor }} className={titleStyle}>
            12. Contact
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
            If you have any questions or comments about these Terms, you can contact us at wisdom.helpcontact@gmail.com.
        </Text>

        <Text style={{ color: textColor }} className="mt-4 font-inter-medium">
            By accepting these Terms and continuing to use Wisdom, you acknowledge that you have read, understood, and agreed to comply with all the provisions contained herein.
        </Text>
        <View className="h-8"></View>
      </ScrollView>
    </SafeAreaView>
  );
}