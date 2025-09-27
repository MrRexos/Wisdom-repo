import React, { useState, useRef, useEffect } from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text, FlatList, Image, Dimensions, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatImageViewerScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images, index } = route.params;
  const { width } = Dimensions.get('screen');

  console.log(colorScheme)

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(index);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: false });
    }
  }, [index]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  const getScale = (idx) => (idx === currentIndex ? 1 : 0.85);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View className="px-6 pt-3 pb-3 justify-center items-center">

        <View className="mb-6 w-full flex-row justify-between items-center">

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
          </TouchableOpacity>

          <View className="flex-[2px] justify-center items-center  ">
            <Text className='font-inter-bold text-[17px] text-[#444343] dark:text-[#f2f2f2]'>
              {t('images')}
            </Text>
          </View>

          <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">
            {currentIndex + 1}/{images.length}
          </Text>

        </View>

      </View>

      <View className="flex-1 justify-center items-center">
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={flatListRef}
          initialScrollIndex={index}
          getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item, index }) => (
            <View style={{ width }} className="justify-center items-center">
              <Animated.View
                style={{
                  transform: [{ scale: getScale(index) }],
                  width: 320,
                  height: 420,
                  borderRadius: 10,
                  backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: '100%', height: '100%', borderRadius: 10 }}
                  className="bg-gray-200 dark:bg-gray-600"
                />
              </Animated.View>
            </View>
          )}
        />
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {images.slice(0, 6).map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 6,
                height: 6,
                borderRadius: 4,
                backgroundColor: currentIndex === idx ? (colorScheme === 'dark' ? '#f2f2f2' : '#444343') : (colorScheme === 'dark' ? '#474646' : '#d4d4d3'),
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}