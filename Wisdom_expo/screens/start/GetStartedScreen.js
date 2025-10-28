
import React from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native'
import '../../languages/i18n';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XMarkIcon } from 'react-native-heroicons/outline';


export default function GetStartedScreen() {
  const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    return (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1 bg-neutral-700 justify-between'>
            <Image source={require('../../assets/LoadChair.png')} style={{ height: windowHeight, width: windowWidth, position: 'absolute' }} />
            <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
            <View>
                <TouchableOpacity onPress={() => null}>
                    <View className="flex-row justify-end pt-5 pr-6 opacity-50">
                        {/* <XMarkIcon size={30} color="#f2f2f2" strokeWidth={1.7} /> */}
                        <View className="w-6 h-[30px]"></View>
                    </View>
                </TouchableOpacity>
                <View className="items-center pt-3 ">
                    <WisdomLogo width={70} height={40} className='fill-black' />
                </View>
            </View>
            <View className="justify-center items-center">
                <TouchableOpacity className="bg-[#f2f2f2] w-[320px] h-[55px] rounded-full items-center justify-center" onPress={() => navigation.navigate('LogOption')}>
                    <Text className="font-inter-semibold text-[15px] text-[#444343] ">{t('get_started')}</Text>
                </TouchableOpacity>
                <View className="w-[250px]">

                    <Text className="pt-3 text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center">{t('by_tapping_get_started')} </Text>
                    <View className="pb-5 flex-row justify-center items-center">
                        <TouchableOpacity
                            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                            onPress={() => navigation.navigate('Terms')}
                        >
                            <Text className="text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center underline">
                                {t('terms')}
                            </Text>
                        </TouchableOpacity>
                        <Text className="text-[11px] mx-1 font-inter-medium text-[#f2f2f2] opacity-60 text-center">{t('and')}</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                        >
                            <Text className="text-[11px] font-inter-medium text-[#f2f2f2] opacity-60 text-center underline">
                                {t('privacy_policy')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </View>
    );
}
