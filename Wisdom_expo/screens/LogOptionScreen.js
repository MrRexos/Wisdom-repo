
import React, { useEffect } from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, Dimensions, Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import {XMarkIcon} from 'react-native-heroicons/outline';
import WisdomLogo from '../assets/wisdomLogo.tsx'
import GoogleLogo from '../assets/GoogleLogo.svg'
import AppleLogo from '../assets/AppleLogo.svg'
import FacebookLogo from '../assets/FacebookLogo.svg';
import axios from 'axios';
import * as Google from 'expo-auth-session/providers/google';



export default function LogOptionScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: Platform.select({
          ios: '232292898356-o6jj43dnn8uqg139udlvtptcaj8551rp.apps.googleusercontent.com',
          android: '232292898356-i7q895e9nin3cj2aedhlos954c3f95p0.apps.googleusercontent.com',
        }),
        redirectUri: Platform.select({
            ios: 'https://wisdom-app-34b3fb420f18.herokuapp.com/',
            android: 'https://auth.expo.io/@your-username/your-app-name',
            // web: 'https://auth.expo.io/@your-username/your-app-name',
          }),
      });

    useEffect(() => {
    if (response?.type === 'success') {
        const { id_token } = response.params;
        // Aquí puedes enviar el token al backend para su verificación
        axios.post('YOUR_BACKEND_URL/auth/google', { id_token })
        .then(res => {
            console.log(res.data);
            // Maneja la respuesta del backend (por ejemplo, almacena el token en el almacenamiento local)
        })
        .catch(err => {
            console.error(err);
        });
    }
    }, [response]);

    
    return (
        
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-neutral-700 justify-between'>
        <Image source={require('../assets/LoadChair.png')}  style={{ height: windowHeight, width: windowWidth, position: 'absolute' }}/>
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
          <View className="justify-center items-center space-y-2.5 pb-2">
              <TouchableOpacity onPress={() => navigation.navigate('EnterEmail')} className="bg-[#f2f2f2] w-[320] h-[55] rounded-full items-center justify-center">
                  <Text className="font-inter-semibold text-[15px]text-[#444343] ">
                      Register
                  </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                  <View className="bg-[#f2f2f2]/10 w-[320] h-[55] rounded-full items-center justify-center border-[1px] border-[#f2f2f2]/50">
                    <Text className="font-inter-semibold text-[15px] text-[#f2f2f2]">
                        Log In
                    </Text>
                  </View>
                  
              </TouchableOpacity>
              <View className="flex-row justify-center items-center space-x-2.5  mx-[25]">
                  <TouchableOpacity onPress={() => promptAsync()} className="bg-[#f2f2f2]/10 h-[55] flex-1 rounded-full flex-row items-center justify-center border-[1px] border-[#f2f2f2]/50">
                      <GoogleLogo width={14} height={14} color="#f2f2f2"/>  
                      <Text className="font-inter-semibold text-[15px] text-[#f2f2f2] ml-3">
                        Continue with Google -{'>'}
                      </Text>

                  </TouchableOpacity>
                  {/* <TouchableOpacity onPress={() => navigation.navigate('NotificationAllow')} className="bg-[#f2f2f2]/20 h-[55] flex-1 rounded-full items-center justify-center border-[1px] border-[#f2f2f2]/50">
                      <AppleLogo width={21} height={26} color="#f2f2f2"  />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('NotificationAllow')} className="bg-[#f2f2f2]/20 h-[55] flex-1 rounded-full items-center justify-center border-[1px] border-[#f2f2f2]/50">
                    <FacebookLogo width={15} height={26} color="#f2f2f2"  />
                  </TouchableOpacity> */}
              </View>
          </View>
      </SafeAreaView>
    );
}