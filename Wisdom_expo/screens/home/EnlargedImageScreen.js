import React, { useState, useRef, useEffect } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, FlatList, Image, Dimensions, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../languages/i18n.js';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function EnlargedImageScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images, index } = route.params;
  const { width } = Dimensions.get('screen');

  // Referencia al FlatList para controlar el scroll
  const flatListRef = useRef(null);

  // Estado para rastrear la posición actual
  const [currentIndex, setCurrentIndex] = useState(index);

  // Efecto para desplazarse al índice inicial
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: false });
    }
  }, [index]);

  // Manejar el desplazamiento horizontal para actualizar el índice
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  // Determinar la escala de la imagen dependiendo de su posición en la lista
  const getScale = (index) => {
    return index === currentIndex ? 1 : 0.85; // Escala para la imagen seleccionada y las demás
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="px-6 pt-10 pb-3 justify-center items-center">
        <View className="mb-6 w-full flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
          </TouchableOpacity>
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
          getItemLayout={(data, index) => (
            { length: width, offset: width * index, index }
          )}
          renderItem={({ item, index }) => (
            <View style={{ width: width }} className="justify-center items-center">
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
                  source={{ uri: item.image_url }} // Usa la URL de la imagen actual
                  style={{ width: '100%', height: '100%', borderRadius: 10 }} // Tamaño y bordes redondeados
                  className="bg-gray-200 dark:bg-gray-600" // Color de fondo
                />
              </Animated.View>
            </View>
          )}
        />
        {/* Indicadores de índice */}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {images.slice(0, 6).map((_, index) => (
            <View
              key={index}
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? colorScheme === 'dark' ? '#f2f2f2' : '#444343' : colorScheme === 'dark' ? '#474646' : '#d4d4d3',
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
