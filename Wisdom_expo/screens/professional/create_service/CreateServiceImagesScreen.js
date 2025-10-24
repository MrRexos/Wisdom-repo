// CreateServiceImagesScreen.js
import React, { useCallback, useMemo, useState } from 'react';
import { View, Platform, TouchableOpacity, Text, Image, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { useTranslation } from 'react-i18next';
import '../../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon } from 'react-native-heroicons/outline';

import AddMainImage from '../../../assets/AddMainImage';
import AddServiceImages from '../../../assets/AddServiceImages';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';
import * as ImagePicker from 'expo-image-picker';

const MAIN_W = 260;
const MAIN_H = 148;
const CARD_W = 150;   // como tus secundarias
const CARD_H = 160;

// rotaciones de tu patrón original (repetidas cada 6)
const ROT = ['-3deg', '4.4deg', '3.7deg', '-2.5deg', '2.2deg', '-2.4deg'];

const withId = (img, i) => ({
  ...img,
  _id: img._id || img.id || img.assetId || `${img.uri || 'img'}-${i}-${Date.now()}-${Math.random()}`
});

export default function CreateServiceImagesScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};

  const [serviceImages, setServiceImages] = useState(() =>
    Array.isArray(prevParams.serviceImages)
      ? prevParams.serviceImages.map(withId)
      : []
  );

  const borderLight = '#fcfcfc';
  const borderDark  = '#202020';
  const iconColor   = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';

  const {
    isEditing, hasChanges, saving,
    requestBack, handleSave,
    confirmVisible, handleConfirmSave, handleDiscardChanges, handleDismissConfirm,
  } = useServiceFormEditing({ prevParams, currentValues: { serviceImages }, t });

  const askGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // ✅ galería
    if (status !== 'granted') {
      Alert.alert(
        t('allow_wisdom_to_access_gallery'),
        t('need_gallery_access_service'),
        [{ text: t('cancel'), style: 'cancel' }, { text: t('settings'), onPress: () => Linking.openSettings() }],
        { cancelable: true }
      );
      return false;
    }
    return true;
  };

  const handlePickMainImage = useCallback(async () => {
    if (!(await askGallery())) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', aspect: [1,1], quality: 1 });
    if (!res.canceled) {
      setServiceImages(prev => [withId(res.assets[0], 0), ...prev]);
    }
  }, []);

  const handlePickImages = useCallback(async () => {
    if (!(await askGallery())) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', allowsMultipleSelection: true, aspect: [1,1], quality: 1
    });
    if (!res.canceled) {
      setServiceImages(prev => [...prev, ...res.assets.map(withId)]);
    }
  }, []);

  const handleRemove = useCallback((id) => {
    setServiceImages(prev => prev.filter(x => x._id !== id));
  }, []);

  const keyExtractor = useCallback((item) => item._id, []);

  // Header arriba (título y "+ Añadir más")
  const ListHeader = useMemo(() => (
    <View style={{alignItems:'center'}}>
      <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">
        {t('upload_some_photos')}
      </Text>
      <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">
        {t('we_recommend_you_upload_at_least_five_images')}
      </Text>
      {serviceImages.length > 0 && (
        <TouchableOpacity onPress={handlePickImages}>
          <Text className="mt-10 font-inter-semibold text-[16px] text-center text-[#444343] dark:text-[#f2f2f2]">
            {t('add_more')}
          </Text>
        </TouchableOpacity>
      )}
      {serviceImages.length < 1 ? <View style={{height:30}}/> : null}
    </View>
  ), [serviceImages.length, t, handlePickImages]);

  const ListFooter = useMemo(() => (
    serviceImages.length > 0 ? (
      <View style={{alignItems:'center', marginTop: 16, marginBottom: 8}}>
        <TouchableOpacity onPress={handlePickImages}>
          <AddServiceImages stroke={iconColor} />
        </TouchableOpacity>
      </View>
    ) : null
  ), [serviceImages.length, iconColor, handlePickImages]);

  const Empty = useMemo(() => (
    <View style={{alignItems:'center', marginTop: 20}}>
      <TouchableOpacity onPress={handlePickMainImage} style={{alignItems:'center'}}>
        <AddMainImage fill={iconColor} width={257} height={118} />
        <Text className="absolute bottom-4 inset-x-0 font-inter-semibold text-[14px] text-center text-[#e0e0e0] dark:text-[#3d3d3d]">
          {t('main_photo')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePickImages} style={{marginTop: 24}}>
        <AddServiceImages stroke={iconColor} />
      </TouchableOpacity>
    </View>
  ), [handlePickMainImage, handlePickImages, iconColor, t]);

  // Render que replica tu patrón (con rotaciones y tamaños)
  const renderItem = useCallback(({ item, index, drag, isActive }) => {
    const isMain = index === 0;
    const angle  = ROT[index % ROT.length];

    return (
      <ScaleDecorator>
        <View style={[styles.itemWrap, isMain ? styles.itemMainWrap : styles.itemSecWrap]}>
          <TouchableOpacity
            activeOpacity={0.95}
            onLongPress={drag}
            delayLongPress={120}
            onPress={isMain ? handlePickMainImage : undefined}
            style={[styles.touch, isActive && {opacity:0.92}]}
          >
            <Image
              source={{ uri: item.uri }}
              style={[
                isMain ? styles.mainImg : styles.secImg,
                { borderColor: colorScheme === 'dark' ? borderDark : borderLight, transform: [{ rotate: isMain ? '0deg' : angle }] }
              ]}
            />
            {isMain && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>{t('main_photo')}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.close} onPress={() => handleRemove(item._id)}>
              <XMarkIcon size={20} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScaleDecorator>
    );
  }, [colorScheme, handlePickMainImage, handleRemove, t]);

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View className="flex-1 px-6 pt-5 pb-6">
          <ServiceFormHeader
            onBack={requestBack}
            onSave={handleSave}
            showSave={isEditing && hasChanges}
            saving={saving}
          />

          <DraggableFlatList
            data={serviceImages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onDragEnd={({ data }) => setServiceImages(data)}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={Empty}
            activationDistance={8}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Botones fijos */}
        <View className="flex-row justify-center items-center pt-4 pb-6 px-6">
          <TouchableOpacity onPress={() => navigation.navigate('CreateServiceExperiences', { prevParams: { ...prevParams, serviceImages } })} className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center">
            <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateServicePriceType', { prevParams: { ...prevParams, serviceImages } })}
            className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
          </TouchableOpacity>
        </View>

        <ServiceFormUnsavedModal
          visible={confirmVisible}
          onSave={handleConfirmSave}
          onDiscard={handleDiscardChanges}
          onDismiss={handleDismissConfirm}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  itemWrap: { marginBottom: 18 },
  itemMainWrap: { flexBasis: '100%', maxWidth: '100%' },
  itemSecWrap:  { flexBasis: '48%',  maxWidth: '48%' },

  touch: { borderRadius: 16, overflow: 'hidden' },

  mainImg: { width: MAIN_W, height: MAIN_H, alignSelf: 'center', borderRadius: 16, borderWidth: 3 },
  secImg:  { width: CARD_W, height: CARD_H, alignSelf: 'center', borderRadius: 12, borderWidth: 3 },

  close: { position:'absolute', top:10, right:10, backgroundColor:'rgba(0,0,0,0.45)', padding:4, borderRadius:16 },

  mainBadge: { position:'absolute', bottom:10, left:10, backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:12, paddingVertical:6, borderRadius:14 },
  mainBadgeText: { color:'#fcfcfc', fontWeight:'600', fontSize:12 },
});
