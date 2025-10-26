import React, { useMemo, useState } from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text, FlatList, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DisplayImagesScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images } = route.params;
  const [imageRatios, setImageRatios] = useState({});

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 24 * 2; // px-6 en los contenedores
  const cardSpacing = 16;

  const cardWidth = useMemo(() => {
    const availableWidth = screenWidth - horizontalPadding - cardSpacing;
    return availableWidth / 2;
  }, [screenWidth]);

  const handleImageLoad = (uri) => ({ nativeEvent }) => {
    const { width, height } = nativeEvent?.source || {};
    if (!width || !height) return;
    setImageRatios((prev) => {
      if (prev[uri]) return prev;
      return { ...prev, [uri]: width / height };
    });
  };

  const renderItem = ({ item, index }) => {
    const ratio = imageRatios[item.image_url] || 1;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EnlargedImage', { images: images, index: index })}
        style={{ width: cardWidth, marginTop: 20 }}
        className="items-center"
      >
        <Image
          source={{ uri: item.image_url }}
          onLoad={handleImageLoad(item.image_url)}
          resizeMode="cover"
          style={{
            width: '100%',
            aspectRatio: ratio,
            borderRadius: 10,
            borderColor: colorScheme === 'dark' ? '#202020' : '#fcfcfc',
            borderWidth: 3,
            backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : '#d4d4d3',
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
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
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}
