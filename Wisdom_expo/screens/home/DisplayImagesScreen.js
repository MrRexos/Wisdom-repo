import React from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';

export default function DisplayImagesScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images } = route.params;

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('EnlargedImage', { images: images, index: index })} 
      className="items-center mt-5 w-1/2"
    >
      <Image
        source={{ uri: item.image_url }}
        style={{ width: 140, height: 160, borderRadius: 10, borderColor: colorScheme === 'dark' ? '#202020' : '#fcfcfc', borderWidth: 3 }}
        className="bg-gray-200 dark:bg-gray-600" // Color de fondo para que se vea en caso de que no cargue la imagen
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="px-6 pt-10 pb-3 justify-center items-center">
        
        <View className="mb-6 w-full flex-row justify-center items-center">
          <View className="flex-1 justify-center items-start">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{t('gallery')}</Text>
          </View>
          <View className="flex-1 justify-center items-start"></View>
        </View>

        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2} // Dos columnas
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ flexGrow: 1, marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}
