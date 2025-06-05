
import React from 'react';
import {View, StatusBar,SafeAreaView, Platform,Text, TouchableOpacity, Image, Dimensions} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';


export default function GetStartedScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
  
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-neutral-700 justify-between'>
        <Image source={require('../../assets/LoadChair.png')}  style={{ height: windowHeight, width: windowWidth, position: 'absolute' }}/>
        <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
          <View>
              <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
                  <View className="flex-row justify-end pt-5 pr-6 opacity-50">
                      <XMarkIcon size={30} color="#f2f2f2" strokeWidth="1.7" />
                  </View> 
              </TouchableOpacity>
              <View className="items-center pt-3 ">
                  <WisdomLogo width={70} height={40} className='fill-black'/>
              </View> 
          </View>
          <View className="justify-center items-center">
              <TouchableOpacity className="bg-[#f2f2f2] w-[320] h-[55] rounded-full items-center justify-center" onPress={() => navigation.navigate('LogOption')}>
                  <Text className="font-inter-semibold text-[15px] text-[#444343] ">{t('get_started')}</Text>
              </TouchableOpacity>
              <View className="w-[250]">

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
      </SafeAreaView>
    );
}
