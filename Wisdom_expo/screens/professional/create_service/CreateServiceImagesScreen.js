import React, { useCallback, useMemo, useState } from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text, Image, StyleSheet, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon } from 'react-native-heroicons/outline'; // Asegúrate de importar PlusIcon o el ícono que prefieras
import AddMainImage from '../../../assets/AddMainImage';
import AddServiceImages from '../../../assets/AddServiceImages';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';
import * as ImagePicker from 'expo-image-picker';
import DraggableFlatList, { ScaleDecorator, ShadowDecorator } from 'react-native-draggable-flatlist';

const DRAG_ACTIVATION_DISTANCE = 12;

export default function CreateServiceImagesScreen() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences } = prevParams;
  const [serviceImages, setServiceImages] = useState(() => (
    Array.isArray(prevParams.serviceImages)
      ? prevParams.serviceImages.map((img) => ({ ...img }))
      : []
  ));

  const {
    isEditing,
    hasChanges,
    saving,
    requestBack,
    handleSave,
    confirmVisible,
    handleConfirmSave,
    handleDiscardChanges,
    handleDismissConfirm,
  } = useServiceFormEditing({ prevParams, currentValues: { serviceImages }, t });

  const handlePickMainImage = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('allow_wisdom_to_access_gallery'),
        t('need_gallery_access_service'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('settings'), onPress: () => Linking.openSettings() }
        ],
        { cancelable: true }
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setServiceImages(prevImages => [result.assets[0], ...prevImages]);
    }
  }, [t]);

  const handlePickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('allow_wisdom_to_access_gallery'),
        t('need_gallery_access_service'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('settings'), onPress: () => Linking.openSettings() }
        ],
        { cancelable: true }
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      aspect: [1, 1],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setServiceImages(prevImages => [...prevImages, ...result.assets]);
    }
  }, [t]);

  const handleRemoveImage = useCallback((index) => {
    setServiceImages(prevImages => prevImages.filter((_, i) => i !== index));
  }, []);

  const handleDragEnd = useCallback(({ data }) => {
    setServiceImages(data);
  }, []);

  const keyExtractor = useCallback((item, index) => `${item.assetId ?? item.fileName ?? item.uri}-${index}`, []);

  const renderImageItem = useCallback(({ item, index, drag, isActive }) => {
    const isMain = index === 0;

    return (
      <ScaleDecorator>
        <ShadowDecorator>
          <View style={[styles.itemWrapper, isMain ? styles.mainItemWrapper : styles.secondaryItemWrapper]}>
            <TouchableOpacity
              activeOpacity={0.95}
              delayLongPress={120}
              onLongPress={drag}
              onPress={isMain ? handlePickMainImage : undefined}
              style={[
                styles.imageTouchable,
                isMain ? styles.mainImageTouchable : styles.secondaryImageTouchable,
                isActive && styles.activeItem,
              ]}
            >
              <Image
                source={{ uri: item.uri }}
                style={[
                  styles.image,
                  { borderColor: colorScheme === 'dark' ? '#202020' : '#fcfcfc' },
                ]}
              />
              <View style={[styles.reorderHandle, isMain && styles.mainReorderHandle]}>
                <Text style={styles.reorderHandleText}>☰</Text>
              </View>
              {isMain ? (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>{t('main_photo')}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(index)}>
              <XMarkIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ShadowDecorator>
      </ScaleDecorator>
    );
  }, [colorScheme, handlePickMainImage, handleRemoveImage, t]);

  const listHeader = useMemo(() => (
    <View className="justify-center items-center">
      <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('upload_some_photos')}</Text>
      <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('we_recommend_you_upload_at_least_five_images')}</Text>
      {serviceImages.length >= 2 ? (
        <TouchableOpacity onPress={handlePickImages}>
          <Text className="mt-10 font-inter-semibold text-[16px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('add_more')}</Text>
        </TouchableOpacity>
      ) : null}
      {serviceImages.length < 2 ? <View style={{ height: 30 }} /> : null}
    </View>
  ), [handlePickImages, serviceImages.length, t]);

  const listFooter = useMemo(() => {
    if (!serviceImages.length) {
      return null;
    }

    return (
      <View className="w-full items-center mt-10">
        <TouchableOpacity onPress={handlePickImages}>
          <AddServiceImages stroke={iconColor} />
        </TouchableOpacity>
      </View>
    );
  }, [handlePickImages, iconColor, serviceImages.length]);

  const emptyComponent = useMemo(() => (
    <View className="w-full mt-[20px] justify-start items-center">
      <TouchableOpacity onPress={handlePickMainImage} className="justify-center items-center relative">
        <AddMainImage fill={iconColor} width={257} height={118} />
        <Text className="absolute bottom-4 inset-x-0 font-inter-semibold text-[14px] text-center text-[#e0e0e0] dark:text-[#3d3d3d]">{t('main_photo')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePickImages} className="mt-12">
        <AddServiceImages stroke={iconColor} />
      </TouchableOpacity>
    </View>
  ), [handlePickImages, handlePickMainImage, iconColor, t]);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
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
          renderItem={renderImageItem}
          onDragEnd={handleDragEnd}
          activationDistance={DRAG_ACTIVATION_DISTANCE}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={emptyComponent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

      </View>

      {/* Botones fijos abajo */}

      <View className="flex-row justify-center items-center pt-4 pb-6 px-6">

        <TouchableOpacity onPress={() => navigation.navigate('CreateServiceExperiences', { prevParams: { ...prevParams, serviceImages } })} style={{ opacity: 1 }} className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center">
          <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={false}
onPress={() => navigation.navigate('CreateServicePriceType', { prevParams: { ...prevParams, serviceImages } })}
          style={{ opacity: 1 }}
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
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
    paddingTop: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemWrapper: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 18,
  },
  mainItemWrapper: {
    flexBasis: '100%',
    maxWidth: '100%',
  },
  secondaryItemWrapper: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
  imageTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainImageTouchable: {
    height: 200,
  },
  secondaryImageTouchable: {
    height: 150,
  },
  activeItem: {
    opacity: 0.9,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 3,
  },
  reorderHandle: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mainReorderHandle: {
    top: 14,
    left: 14,
  },
  reorderHandleText: {
    color: '#fcfcfc',
    fontSize: 16,
    fontWeight: '700',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  mainBadgeText: {
    color: '#fcfcfc',
    fontWeight: '600',
    letterSpacing: 0.4,
    fontSize: 13,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    padding: 4,
  },
});
