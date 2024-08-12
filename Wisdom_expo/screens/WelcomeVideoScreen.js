import { View, Text, Switch, Button } from 'react-native'
import { useColorScheme } from 'nativewind'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Navigation from '../navigation/navigation';

import { useNavigation } from '@react-navigation/native';


export default function WelcomeVideoScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    const navigation = useNavigation();
    return (
        <View className='flex-1 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626]'>
          <Text className='text-[#272626] dark:text-[#f2f2f2] font-inter-medium'>WelcomeVideoScreen</Text>
          <Switch value={colorScheme==='dark'} onChange={toggleColorScheme}/>
          <Button title='Hola' onPress={() => navigation.navigate('Loading')} />
      </View>
    )
}