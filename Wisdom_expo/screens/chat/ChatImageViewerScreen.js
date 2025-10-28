import React, { useMemo, useState } from 'react';
import { View, Platform, TouchableOpacity, Text, Image, StatusBar as RNStatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

export default function ChatImageViewerScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images, index } = route.params;
  const insets = useSafeAreaInsets();

  // 1) Invertimos el orden para que la "primera" quede al final (derecha)
  const reversedImages = useMemo(() => [...images].reverse(), [images]);

  // 2) Ajustamos el índice inicial para seguir abriendo en la misma imagen
  const initialIndex = useMemo(
    () => Math.max(0, images.length - 1 - (index ?? 0)),
    [images.length, index]
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const viewerImages = useMemo(
    () => reversedImages.map((img) => ({ url: img.uri })),
    [reversedImages]
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}
    >
      <ExpoStatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Barra superior FUERA del viewer */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom:20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
        </TouchableOpacity>

        <Text className="font-inter-bold text-[17px]" style={{ color: iconColor }}>
          {t('images')}
        </Text>

        <Text className="font-inter-medium text-[14px]" style={{ color: iconColor }}>
          {currentIndex + 1}/{images.length}
        </Text>
      </View>

      {/* Viewer ocupa el resto y centra respecto a ese alto */}
      <View style={{ flex: 1,paddingHorizontal: 20, }}>
      <ImageViewer
        key={`viewer-${initialIndex}-${viewerImages.length}`}  // ← fuerza remount si cambia
        imageUrls={viewerImages}
        index={initialIndex}                                   // ← usa el índice recalculado
        backgroundColor={colorScheme === 'dark' ? '#323131' : '#fcfcfc'}
        saveToLocalByLongPress={false}
        enableSwipeDown={false}
        renderIndicator={() => null}
        onChange={(newIndex) => {
          if (typeof newIndex === 'number') setCurrentIndex(newIndex);
        }}
        renderImage={(props) => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',         
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,           // ← radio de las esquinas
                  overflow: 'hidden',         // ← necesario para que se recorte la imagen
                  backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', // por si hay letterboxing
                }}
              >
                <Image
                  {...props}
                  style={[
                    props.style,
                    {
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',   // mantiene proporción y respeta márgenes
                    },
                  ]}
                />
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}