import React, { useMemo, useState } from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function EnlargedImageScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const navigation = useNavigation();
  const route = useRoute();
  const { images, index } = route.params;
  const [currentIndex, setCurrentIndex] = useState(index);

  const viewerImages = useMemo(() => images.map((img) => ({ url: img.image_url })), [images]);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <ImageViewer
          imageUrls={viewerImages}
          index={index}
          backgroundColor={colorScheme === 'dark' ? '#323131' : '#fcfcfc'}
          saveToLocalByLongPress={false}
          enableSwipeDown={false}
          onChange={(newIndex) => {
            if (typeof newIndex === 'number') {
              setCurrentIndex(newIndex);
            }
          }}
          renderIndicator={() => null}
          renderHeader={() => (
            <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ChevronLeftIcon size={24} strokeWidth={1.9} color={iconColor} />
              </TouchableOpacity>
              <Text className="font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">
                {t('gallery')}
              </Text>
              <Text className="font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">
                {currentIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
