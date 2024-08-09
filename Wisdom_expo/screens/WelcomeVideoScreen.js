import { View, Text, Switch, Button } from 'react-native'
import { useColorScheme } from 'nativewind'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Navigation from '../navigation/navigation';

export default function WelcomeVideoScreen() {
    const {colorScheme, toggleColorScheme} = useColorScheme();
    return (
        <View className='flex-1 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626]'>
          <Text className='text-[#272626] dark:text-[#f2f2f2]'>WelcomeVideoScreen</Text>
          <Switch value={colorScheme==='dark'} onChange={toggleColorScheme}/>
      </View>
    )
}