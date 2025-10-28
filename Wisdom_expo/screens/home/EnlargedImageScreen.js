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

export default function EnlargedImageScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images, index } = route.params;
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(index ?? 0);

  const viewerImages = useMemo(
    () => (images ?? []).map((img) => ({ url: img.image_url })),
    [images]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}>
      <ExpoStatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header fuera del viewer */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
        </TouchableOpacity>

        <Text className="font-inter-semibold text-[16px]" style={{ color: iconColor }}>
          {t('gallery')}
        </Text>

        <Text className="font-inter-medium text-[14px]" style={{ color: iconColor }}>
          {currentIndex + 1}/{images?.length ?? 0}
        </Text>
      </View>

      {/* Viewer: margen lateral + centrado vertical + bordes redondeados */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ImageViewer
          key={`viewer-${index}-${viewerImages.length}`} // fuerza remount si cambia el índice
          imageUrls={viewerImages}
          index={index ?? 0}
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
                  borderRadius: 20,      // esquinas redondeadas
                  overflow: 'hidden',    // recorte al radio
                  backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
                }}
              >
                <Image
                  {...props}
                  style={[
                    props.style,
                    { width: '100%', height: '100%', resizeMode: 'contain' },
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