import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { View, StatusBar, Platform, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, Alert, RefreshControl, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, XCircleIcon } from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import { Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X, Check, Maximize2, File, Image as ImageIcon, Folder, AlertTriangle, Eye, EyeOff, Edit2, Trash2 } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import Message from '../../components/Message';
import { buildEditPrevParams } from '../../utils/serviceFormEditing';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getRegionForRadius } from '../../utils/mapUtils';
import { doc, setDoc, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db, storage } from '../../utils/firebase';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import { format } from 'date-fns';

const DATE_LOCALE_MAP = {
  en: 'en-GB',
  es: 'es-ES',
  ca: 'ca-ES',
  ar: 'ar',
  fr: 'fr-FR',
  zh: 'zh-CN',
};
import {
  mapMarkerAnchor,
  mapMarkerCenterOffset,
  mapMarkerImage,
  mapMarkerStyle,
} from '../../utils/mapMarkerAssets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';




export default function ServiceProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const { serviceId, location, fromListings } = route.params || {};
  const [serviceData, setServiceData] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [address, setAddress] = useState('');
  const [localHour, setLocalHour] = useState('');
  const [filteredReviews, setFilteredReviews] = useState();
  const [width5, setWidth5] = useState(0);
  const [width4, setWidth4] = useState(0);
  const [width3, setWidth3] = useState(0);
  const [width2, setWidth2] = useState(0);
  const [width1, setWidth1] = useState(0);
  const [isServiceLiked, setIsServiceLiked] = useState(false);
  const [lists, setLists] = useState([]);
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);
  const [userId, setUserId] = useState();
  const [showAddList, setShowAddList] = useState(false);
  const [listName, setListName] = useState('');
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState({});
  const serviceOptionsSheetRef = useRef(null);
  const [updatingServiceVisibility, setUpdatingServiceVisibility] = useState(false);
  const [serviceDeleteConfirmVisible, setServiceDeleteConfirmVisible] = useState(false);
  const [serviceDeleteLoading, setServiceDeleteLoading] = useState(false);
  const cameFromListings = Boolean(fromListings);
  const isMyService = useMemo(() => Boolean(userId && serviceData?.user_id === userId), [userId, serviceData?.user_id]);
  const showServiceSettingsButton = isMyService && cameFromListings;

  const hasFiniteActionRate = Number.isFinite(serviceData.action_rate);

  const mapRegion = serviceData.latitude
    ? (hasFiniteActionRate && serviceData.action_rate < 100
      ? getRegionForRadius(serviceData.latitude, serviceData.longitude, serviceData.action_rate)
      : {
        latitude: serviceData.latitude,
        longitude: serviceData.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.03,
      })
    : null;

  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [sliderValue, setSliderValue] = useState(12);
  const sliderTimeoutId = useRef(null);
  const [timeUndefined, setTimeUndefined] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const locale = useMemo(() => DATE_LOCALE_MAP[i18n.language] || DATE_LOCALE_MAP.en, [i18n.language]);
  const reportSheetModalRef = useRef(null);
  const [reportStep, setReportStep] = useState(1);
  const [reportReason, setReportReason] = useState(null);
  const [reportOther, setReportOther] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportAttachments, setReportAttachments] = useState([]);
  const [sendingReport, setSendingReport] = useState(false);
  const reportDescInputRef = useRef(null);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const reasonOptions = [
    { code: 'fraud', textKey: 'report_reason_fraud' },
    { code: 'incorrect_info', textKey: 'report_reason_incorrect_info' },
    { code: 'inappropriate', textKey: 'report_reason_offensive', reasonText: 'offensive' },
    { code: 'inappropriate', textKey: 'report_reason_illegal', reasonText: 'illegal' },
    { code: 'spam', textKey: 'report_reason_spam' },
    { code: 'external_contact', textKey: 'report_reason_external_contact' },
    { code: 'inappropriate', textKey: 'report_reason_harassment', reasonText: 'harassment' },
    { code: 'other', textKey: 'report_reason_ip', reasonText: 'intellectual_property' },
    { code: 'inappropriate', textKey: 'report_reason_inappropriate_images', reasonText: 'inappropriate_images' },
    { code: 'other', textKey: 'report_reason_other' },
  ];


  const openReportSheet = () => {
    setReportStep(1);
    setReportReason(null);
    setReportOther('');
    setReportDescription('');
    setReportAttachments([]);
    setShowAttachOptions(false);
    reportSheetModalRef.current?.present();
  };

  const handleReportSheetDismiss = useCallback(() => {
    setShowAttachOptions(false);
    setReportStep(1);
    setReportReason(null);
    setReportOther('');
    setReportDescription('');
    setReportAttachments([]);
  }, []);

  const renderReportSheetBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleImagePick = async () => {
    if (reportAttachments.length >= 3) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(t('allow_wisdom_to_access_gallery'), t('need_gallery_access_chat'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('settings'), onPress: () => Linking.openSettings() },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setReportAttachments(prev => [
        ...prev,
        {
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          mime: asset.mimeType || 'image/jpeg'
        }
      ]);
    }
    setShowAttachOptions(false);
  };

  const sheetMinHeight = useMemo(() => {
    if (showAttachOptions) return 220;
    if (reportStep === 1) return 520;
    if (reportStep === 2) {
      const rows = Math.ceil((reportAttachments.length-1) / 3);
      return 480; // igual que hacías en la versión 2
    }
    if (reportStep === 3) return 380;
    return 320; // step 4 (éxito)
  }, [reportStep, showAttachOptions, reportAttachments.length]);

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled && reportAttachments.length < 3) {
      const asset = result.assets?.[0] || result;
      setReportAttachments(prev => [
        ...prev,
        {
          type: 'file',
          uri: asset.uri,
          name: asset.name,
          mime: asset.mimeType || 'application/octet-stream'
        }
      ]);
    }
    setShowAttachOptions(false);
  };

  const renderServiceOptionsBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleOpenServiceOptions = useCallback(() => {
    if (!isMyService) return;
    serviceOptionsSheetRef.current?.present();
  }, [isMyService]);

  const handleServiceOptionsDismiss = useCallback(() => {
    setUpdatingServiceVisibility(false);
  }, []);

  const handleToggleServiceVisibility = useCallback(async () => {
    if (!serviceId) return;
    const currentlyHidden = serviceData?.is_hidden === 1 || serviceData?.is_hidden === true;
    const newHiddenValue = !currentlyHidden;
    const formattedHiddenValue = typeof serviceData?.is_hidden === 'number' ? (newHiddenValue ? 1 : 0) : newHiddenValue;
    try {
      setUpdatingServiceVisibility(true);
      await api.patch(`/api/services/${serviceId}/visibility`, { is_hidden: newHiddenValue });
      setServiceData(prev => prev ? { ...prev, is_hidden: formattedHiddenValue } : prev);
    } catch (error) {
      console.error('Error updating service visibility:', error);
      Alert.alert(t('service_visibility_error'));
    } finally {
      setUpdatingServiceVisibility(false);
    }
  }, [serviceData?.is_hidden, serviceId, t]);

  const handleServiceEdit = useCallback(() => {
    if (!serviceId || !serviceData) {
      Alert.alert(t('service_edit_load_error'));
      return;
    }

    serviceOptionsSheetRef.current?.dismiss();

    try {
      const prevParams = buildEditPrevParams(serviceData, {
        serviceId,
        originScreen: 'ServiceProfile',
        originParams: { ...(route.params || {}), serviceId, fromListings: cameFromListings },
      });
      navigation.navigate('CreateServiceTitle', { prevParams });
    } catch (error) {
      console.error('Error preparing service edit:', error);
      Alert.alert(t('service_edit_load_error'));
    }
  }, [serviceId, serviceData, t, navigation, route.params, cameFromListings]);

  const handleServiceDeletePress = useCallback(() => {
    serviceOptionsSheetRef.current?.dismiss();
    setServiceDeleteConfirmVisible(true);
  }, []);

  const handleCancelServiceDelete = useCallback(() => {
    if (serviceDeleteLoading) return;
    setServiceDeleteConfirmVisible(false);
  }, [serviceDeleteLoading]);

  const handleConfirmServiceDelete = useCallback(async () => {
    if (!serviceId || serviceDeleteLoading) return;
    setServiceDeleteConfirmVisible(false);
    setServiceDeleteLoading(true);
    try {
      
      await api.delete(`/api/services/${serviceId}`);
      Alert.alert(t('service_deleted_title'), t('service_deleted_message'));
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert(t('service_delete_error'));
    } finally {
      setServiceDeleteLoading(false);
    }
  }, [serviceDeleteLoading, serviceId, t, navigation]);

  const removeAttachment = (index) => {
    setReportAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatResponseTime = (minutes) => {
    const n = Number(minutes);
    if (!Number.isFinite(n) || n < 0) return '—';
    const m = Math.round(n);
  
    if (m < 1) return '<1 min';
    if (m < 5) return '<5 min';
    if (m < 10) return '5–10 min';
    if (m < 20) return '10–20 min';
    if (m < 30) return '20–30 min';
    if (m < 45) return '30–45 min';
    if (m < 60) return '45–60 min';
    if (m < 120) return '1–2 h';
    if (m < 240) return '2–4 h';
    if (m < 480) return '4–8 h';
    if (m < 1440) return '8–24 h';
    if (m < 2880) return `1–2 ${t('days')}`;
    if (m < 4320) return `2–3 ${t('days')}`;
    if (m < 10080) return `3–7 ${t('days')}`;
    return `≥ 1 ${t('week')}`;
  };

  const uploadFile = async (uri, path, mime) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const fileRef = ref(storage, path);
    const task = uploadBytesResumable(fileRef, blob, { contentType: mime });

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        null,
        reject,
        async () => {
          blob.close?.();
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const submitReport = async () => {
    if (sendingReport) return;
    setSendingReport(true);
    try {
      const uploaded = await Promise.all(
        reportAttachments.map((a, idx) => {
          const ext = a.name?.split('.').pop() || (a.type === 'image' ? 'jpg' : 'file');
          const path = `service_reports/${serviceId}/${Date.now()}_${idx}.${ext}`;
          return uploadFile(a.uri, path, a.mime).then(url => ({ file_url: url, file_type: a.type }));
        })
      );
      const reason_text = reportReason?.code === 'other' ? reportOther : reportReason?.reasonText;
      await api.post('/api/service_reports', {
        service_id: serviceId,
        reason_code: reportReason?.code,
        reason_text,
        description: reportDescription,
        attachments: uploaded,
      });
      setReportStep(4);
    } catch (err) {
      console.error('report error', err);
      Alert.alert(t('unexpected_error'));
    } finally {
      setSendingReport(false);
    }
  };

  const renderReportSheetContent = () => {

    if (showAttachOptions) {
      return (
        <View className="flex-1 py-4 px-7">
          <View className="flex-row justify-end items-center mb-2">
            <TouchableOpacity onPress={() => setShowAttachOptions(false)} className="p-1">
              <XMarkIcon height={22} width={22} color={iconColor} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View className="gap-y-4">
            <TouchableOpacity onPress={handleImagePick} className="py-2 flex-row items-center">
              <ImageIcon height={24} width={24} color={iconColor} strokeWidth={2} />
              <Text className=" ml-3 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">
                {t('choose_image')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFilePick} className="py-1 flex-row items-center">
              <Folder height={24} width={24} color={iconColor} strokeWidth={2} />
              <Text className=" ml-3 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">
                {t('choose_file')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (reportStep === 1) {
      return (
        <View className="flex-1 px-7 pt-4">
          <Text className="text-center pb-5 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2] mb-4">{t('report_service_for')}</Text>
          <ScrollView className="flex-1 pb-5" showsVerticalScrollIndicator={false}>
            {reasonOptions.map((opt, idx) => (
              <TouchableOpacity key={idx} onPress={() => setReportReason(opt)} className="flex-row items-center py-2">
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' },
                    reportReason?.textKey === opt.textKey && {
                      backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                      borderWidth: 0,
                    },
                    { marginRight: 12 },
                  ]}
                >
                  {reportReason?.textKey === opt.textKey && (
                    <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                  )}
                </View>
                <Text className="flex-1 font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t(opt.textKey)}</Text>
              </TouchableOpacity>
            ))}
            {reportReason?.code === 'other' && (
              <TextInput
                className="mt-2 mb-4 font-inter-medium border border-[#e0e0e0] dark:border-[#3d3d3d] rounded-lg p-2 text-[#444343] dark:text-[#f2f2f2] bg-[#f2f2f2] dark:bg-[#3d3d3d]"
                placeholder={t('report_other_placeholder')}
                placeholderTextColor={placeHolderTextColorChange}
                value={reportOther}
                onChangeText={setReportOther}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              />
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() => setReportStep(2)}
            disabled={!reportReason || (reportReason.code === 'other' && !reportOther.trim())}
            className={`mt-3 mb-10 h-[52px] w-full rounded-full items-center justify-center ${!reportReason || (reportReason.code === 'other' && !reportOther.trim()) ? 'bg-[#d4d4d3] dark:bg-[#474646]' : 'bg-[#323131] dark:bg-[#fcfcfc]'}`}
          >
            <Text className={`font-inter-semibold text-[15px] ${!reportReason || (reportReason.code === 'other' && !reportOther.trim()) ? 'text-[#fcfcfc] dark:text-[#323131]' : 'text-[#fcfcfc] dark:text-[#323131]'}`}>{t('report_next')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (reportStep === 2) {
      return (
        <View className="flex-1 px-7 pt-4">
          <View className="mt-1 mb-4 flex-row justify-center items-center">
            <View className="flex-1 items-start">
              <TouchableOpacity onPress={() => setReportStep(1)} className="ml-1">
                <ChevronLeftIcon height={21} width={21} strokeWidth={2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center items-center">
              <Text className="text-center font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('description')}</Text>
            </View>
            <View className="flex-1" />
          </View>

          <TouchableWithoutFeedback onPress={() => reportDescInputRef.current?.focus()}>
            <View className="h-[150px] bg-[#f2f2f2] dark:bg-[#3d3d3d] rounded-2xl py-4 px-5">
              <BottomSheetTextInput
                ref={reportDescInputRef}
                placeholder={t('report_description_placeholder')}
                selectionColor={cursorColorChange}
                placeholderTextColor={placeHolderTextColorChange}
                multiline
                value={reportDescription}
                onChangeText={setReportDescription}
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className="w-full font-inter-medium text-[15px] text-[#515150] dark:text-[#d4d4d3]"
                style={{ textAlignVertical: 'top', height: 120 }}
              />
            </View>
          </TouchableWithoutFeedback>
          <View className="flex-row flex-wrap mt-4">
            {reportAttachments.map((att, idx) => (
              <View key={idx} className="relative mr-3 mb-3">
                {att.type === 'image' ? (
                  <Image source={{ uri: att.uri }} className="h-20 w-20 rounded-lg" />
                ) : (
                  <View className="h-20 w-20 rounded-lg bg-[#323131] dark:bg-[#fcfcfc] items-center justify-center">
                    <File height={24} width={24} color={colorScheme === 'dark' ? '#1f1f1f' : '#ffffff'} strokeWidth={2} />
                  </View>
                )}
                <TouchableOpacity onPress={() => removeAttachment(idx)} className="absolute -top-1 -right-1 bg-[#f2f2f2] dark:bg-[#474646] rounded-full p-[1px]">
                  <XMarkIcon height={16} width={16} color={iconColor} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}
            {reportAttachments.length < 3 && (
              <TouchableOpacity
                onPress={() => { Keyboard.dismiss(); setShowAttachOptions(true); }}
                className="h-20 w-20 rounded-lg bg-[#e0e0e0] dark:bg-[#3d3d3d] items-center justify-center"
              >
                <Plus height={28} width={28} color={iconColor} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setReportStep(3)}
            disabled={reportDescription.trim().length < 20}
            className={`mt-auto mb-10 h-[52px] w-full rounded-full items-center justify-center ${reportDescription.trim().length < 20 ? 'bg-[#d4d4d3] dark:bg-[#474646]' : 'bg-[#323131] dark:bg-[#fcfcfc]'}`}
          >
            <Text className={`font-inter-semibold text-[15px] ${reportDescription.trim().length < 20 ? 'text-[#fcfcfc] dark:text-[#323131]' : 'text-[#fcfcfc] dark:text-[#323131]'}`}>{t('report_next')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (reportStep === 3) {
      return (
        <View className="flex-1 px-7 pt-4">
          <View className="mt-1 mb-4 flex-row justify-center items-center">
            <View className="flex-1 items-start">
              <TouchableOpacity onPress={() => setReportStep(2)} className="ml-1">
                <ChevronLeftIcon height={21} width={21} strokeWidth={2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
              </TouchableOpacity>
            </View>
            <View className="flex-1" />
          </View>
          <View className="mt-3 flex-row justify-center items-center">
            <AlertTriangle height={70} width={70} color={'#979797'} strokeWidth={1.3} />
          </View>
          <Text className="text-center font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2] mt-6 mb-6">{t('report_warning')}</Text>
          <TouchableOpacity
            onPress={submitReport}
            className="mt-auto w-full mb-10 h-[52px] rounded-full items-center justify-center bg-[#323131] dark:bg-[#fcfcfc]"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('report_send')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View className="flex-1 justify-center items-center px-7">
        <View className="flex-1 justify-center items-center">
          <Text className=" font-inter-bold text-[22px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('report_success')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => reportSheetModalRef.current?.dismiss()}
          className="mb-10 h-[52px] w-full rounded-full items-center justify-center bg-[#323131] dark:bg-[#fcfcfc]"
        >
          <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('ok')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round((x + Number.EPSILON) * 100) / 100;
  };

  const languageTranslationKeys = {
    es: 'language_name_spanish',
    en: 'language_name_english',
    ca: 'language_name_catalan',
    fr: 'language_name_french',
    ar: 'language_name_arabic',
    de: 'language_name_german',
    zh: 'language_name_chinese',
    ja: 'language_name_japanese',
    ko: 'language_name_korean',
    pt: 'language_name_portuguese',
    ru: 'language_name_russian',
    it: 'language_name_italian',
    nl: 'language_name_dutch',
    tr: 'language_name_turkish',
    sv: 'language_name_swedish',
  };

  const getLanguageLabel = (code) => {
    const translationKey = languageTranslationKeys[code];
    if (!translationKey) {
      return code;
    }
    const translated = t(translationKey);
    return translated === translationKey ? code : translated;
  };

  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;
  const isServiceHidden = serviceData?.is_hidden === 1 || serviceData?.is_hidden === true;
  const serviceSheetBackgroundColor = colorScheme === 'dark' ? '#323131' : '#fcfcfc';
  const serviceSheetIndicatorColor = colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0';


  const verifyRegistered = async () => {
    const userData = await getDataLocally('user');

    if (!userData) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'GetStarted' }],
      });
      return;
    }

    try {
      const me = JSON.parse(userData);
      if (!me?.token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'GetStarted' }],
        });
        return;
      }

      if (me.id === serviceData.user_id) {
        if (cameFromListings) {
          handleOpenServiceOptions();
        } else {
          Alert.alert(t('cannot_book_own_service'));
        }
        return;
      }
    } catch (error) {
      console.error('Failed to parse user data', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'GetStarted' }],
      });
      return;
    }

    openSheetWithInput(700);
    setIsAddingDate(true);

  }


  const getServiceInfo = async () => {
    try {
      let viewerId;
      try {
        const userData = await getDataLocally('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser?.id) {
            viewerId = parsedUser.id;
            setUserId(parsedUser.id);
          }
        }
      } catch (storageError) {
        console.error('Error retrieving local user data:', storageError);
      }

      const config = viewerId ? { params: { viewerId } } : {};
      const response = await api.get(`/api/service/${serviceId}`, config);
      let service = response.data;
      const normalizeCoordinate = (value) => {
        if (value === null || value === undefined || value === '') {
          return null;
        }

        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
      };

      const normalizedService = {
        ...service,
        latitude: normalizeCoordinate(service?.latitude),
        longitude: normalizeCoordinate(service?.longitude),
        action_rate: normalizeCoordinate(service?.action_rate),
      };

      setServiceData(normalizedService);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const refreshData = async () => {
    await getServiceInfo();
  };

  useRefreshOnFocus(refreshData);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: 'AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY',
        },
      });

      if (response.data.status === "OK") {
        const addressComponents = response.data.results[0].address_components;
        const postcode = addressComponents.find(component => component.types.includes("postal_code"))?.long_name;
        const city = addressComponents.find(component => component.types.includes("locality"))?.long_name;
        const country = addressComponents.find(component => component.types.includes("country"))?.long_name;
        return `${postcode} ${city}, ${country}`;
      } else {
        console.error("Error en la geocodificación:", response.data.status);
        return null;
      }
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      return null;
    }
  };

  const getTimeZoneFromCoordinates = async (latitude, longitude) => {
    const timestamp = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=AIzaSyA9IKAf2YvpjiyNfDpPUUsv_Xz-flkJFCY`;
    try {
      const response = await axios.get(url);
      if (response.data.status === "OK") {
        const { dstOffset, rawOffset } = response.data;
        const localTime = new Date((timestamp + dstOffset + rawOffset) * 1000);
        return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }); // Devuelve la hora local como una cadena legible
      } else {
        console.error("Error en la respuesta de la API:", response.data);
        return null;
      }
    } catch (error) {
      console.error("Error al obtener la zona horaria:", error);
      return null;
    }
  };

  const fetchLists = async () => {
    const userData = await getDataLocally('user');
    const user = JSON.parse(userData);
    setUserId(user.id);
    try {
      const response = await api.get(`/api/user/${user.id}/lists`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const heartClicked = async (serviceId) => {

    const fetchedLists = await fetchLists();
    if (fetchedLists) {
      setLists(fetchedLists); // Aquí se asignan las listas obtenidas
    }
    openSheetWithInput(450);
    setIsAddingDate(false);
    setShowAddList(false);
  };

  const addItemList = async (listId) => {
    try {
      const response = await api.post(`/api/lists/${listId}/items`, {
        service_id: serviceId,
      });
      console.log('Item added:', response.data);
      setIsServiceLiked(true);
      sheet.current.close();

    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const createList = async () => {
    try {
      const response = await api.post('/api/lists', {
        user_id: userId,
        list_name: listName,

      });
      console.log('List created:', response.data);
      return response.data.listId

    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleDone = async () => {
    try {
      const listId = await createList();
      if (listId) {
        await addItemList(listId);
      }
    } catch (error) {
      console.error('Error adding item to new list:', error);
    } finally {
      sheet.current.close();
    }
  }

  const openSheetWithInput = (height) => {

    setSheetHeight(height);

    setTimeout(() => {
      sheet.current.open();
    }, 0);

  };

  useEffect(() => {
    getServiceInfo();
  }, []);

  useEffect(() => {

    const fetchAddress = async () => {
      if (serviceData.latitude && serviceData.longitude) {
        const addr = await getAddressFromCoordinates(serviceData.latitude, serviceData.longitude);
        setAddress(addr);

        const hour = await getTimeZoneFromCoordinates(serviceData.latitude, serviceData.longitude);
        setLocalHour(hour);
      }
    };

    const getCommentedReviews = () => {
      if (serviceData.reviews) {
        const filteredCommentReviews = serviceData.reviews.filter(review => review.comment);
        setFilteredReviews(filteredCommentReviews)
      }
      if (serviceData.reviews) {
        setWidth5(Math.min((serviceData.rating_5_count / serviceData.reviews.length) * 100, 100));
        setWidth4(Math.min((serviceData.rating_4_count / serviceData.reviews.length) * 100, 100));
        setWidth3(Math.min((serviceData.rating_3_count / serviceData.reviews.length) * 100, 100));
        setWidth2(Math.min((serviceData.rating_2_count / serviceData.reviews.length) * 100, 100));
        setWidth1(Math.min((serviceData.rating_1_count / serviceData.reviews.length) * 100, 100));
      } else {
        setWidth5(0);
        setWidth4(0);
        setWidth3(0);
        setWidth2(0);
        setWidth1(0);
      }
    }

    getCommentedReviews();
    fetchAddress();

  }, [serviceData]);

  const formatLanguages = (languagesArray) => {
    const languageNames = languagesArray.map(getLanguageLabel).filter(Boolean);
    if (languageNames.length === 0) {
      return '';
    }
    if (languageNames.length === 1) {
      return languageNames[0];
    }
    const conjunction = t('and') || 'and';
    const namesExceptLast = languageNames.slice(0, -1).join(', ');
    const lastLanguage = languageNames[languageNames.length - 1];
    return `${namesExceptLast} ${conjunction} ${lastLanguage}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);

    // Opciones para el formato de la fecha
    const options = {
      year: 'numeric',
      month: 'long', // Puedes usar 'numeric' para obtener el mes como número
      day: 'numeric',
    };

    // Formatea la fecha a una cadena legible
    return date.toLocaleString('en-US', options);
  };

  const onTextLayout = useCallback(
    (e) => {
      if (e.nativeEvent.lines.length > 3) {
        setShowMoreButton(true);
      } else {
        setShowMoreButton(false);
      }
    },
    []
  );

  const inputListNameChanged = (text) => {
    setListName(text);
  };

  const handleClearText = () => {
    setListName('');
  };

  const onDayPress = (day) => {
    setSelectedDate({
      [day.dateString]: {
        selected: true,
        selectedColor: colorScheme === 'dark' ? '#979797' : '#979797', // Color del fondo del círculo
        selectedTextColor: '#ffffff'
      },
    });
    setSelectedDay(day.dateString);
  };

  const handleHourSelected = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);

    // Formatear la hora seleccionada en formato HH:MM
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    setSelectedTime(formattedTime); // Guarda la hora seleccionada en el estado
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
  };

  const handleSliderChange = (value) => {
    // Limpiamos cualquier timeout previo
    if (sliderTimeoutId.current) {
      clearTimeout(sliderTimeoutId.current);
    }

    // Establecemos un nuevo timeout para aplicar el valor
    sliderTimeoutId.current = setTimeout(() => {
      const adjustedValue = sliderValueToMinutes(value); // Convertimos el valor del slider a minutos reales
      setSliderValue(value);
      setDuration(adjustedValue); // Actualizamos la duración basada en minutos reales
    }, 100); // Esperamos 100ms antes de actualizar el estado
  };

  const sliderValueToMinutes = (value) => {
    // Mapeamos el valor del slider a minutos según el segmento
    if (value <= 12) {
      return value * 5; // Primer tramo: 0-60 minutos (paso de 5 en 5)
    } else if (value <= 18) {
      return 60 + (value - 12) * 10; // Segundo tramo: 60-120 minutos (paso de 10 en 10)
    } else if (value <= 26) {
      return 120 + (value - 18) * 15; // Tercer tramo: 120-240 minutos (paso de 15 en 15)
    } else {
      return 240 + (value - 26) * 30; // Cuarto tramo: 240-480 minutos (paso de 30 en 30)
    }
  };

  const formatDuration = useCallback((value) => {
    const total = Math.max(0, Math.round(Number(value) || 0));
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    if (hours > 0 && minutes > 0) {
      return t('duration_hours_minutes', { hours, minutes });
    }
    if (hours > 0) {
      return t('duration_hours', { hours });
    }
    return t('duration_minutes', { minutes });
  }, [t]);

  const formatBookingMessage = () => {
    // Validaciones para mostrar mensajes cuando no hay valores seleccionados

    if (timeUndefined === true) {
      return t('book_without_date');
    }
    if (!selectedDay && !selectedTime && !duration) {
      return t('select_date_time_and_duration');
    }
    if (!selectedDay) {
      return t('select_a_date');
    }
    if (!selectedTime) {
      return t('select_a_time');
    }
    if (!duration) {
      return t('select_a_duration');
    }

    // 1. Crear un objeto Date combinando selectedDay y selectedTime
    const [year, month, day] = selectedDay.split('-'); // Dividimos la fecha "YYYY-MM-DD"
    const [hours, minutes] = selectedTime.split(':'); // Dividimos la hora "HH:mm"

    const startTime = new Date(year, month - 1, day, hours, minutes); // Crear el objeto Date
    const formattedDay = startTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' }); // Ej: "Friday 25 Oct"
    const formattedTime = startTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false }); // Ej: "12:58"

    // 2. Calcular la hora de finalización añadiendo la duración
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration); // Añadir la duración en minutos
    const formattedEndTime = endTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false }); // Ej: "14:28"

    // 3. Calcular el precio basado en el tipo de precio
    let totalPrice = parseFloat(serviceData.price);
    if (serviceData.price_type === 'hour') {
      const hours = duration / 60; // Duración en horas
      totalPrice = serviceData.price * hours;
    }

    // 4. Construir el mensaje de reserva final
    const priceLabel = serviceData.price_type === 'budget' ? t('budget') : `${round2(totalPrice)}€`; // Asegurarnos de que el precio tenga dos decimales si es necesario
    return t('book_for_summary', { day: formattedDay, startTime: formattedTime, endTime: formattedEndTime, price: priceLabel });
  };

  const startChat = async () => {
    try {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const me = JSON.parse(userData);
      const otherId = serviceData.user_id;
      if (!otherId) return;
      if (otherId === me.id) {
        Alert.alert(t('cannot_write_to_yourself'));
        return;
      }
      const participants = [me.id, otherId];
      const conversationId = [...participants].sort().join('_');
      const data = {
        participants,
        updatedAt: serverTimestamp(),
      };
      if (serviceData.first_name && serviceData.surname) {
        data.name = `${serviceData.first_name} ${serviceData.surname}`;
      } else if (serviceData.service_title) {
        data.name = serviceData.service_title;
      }
      await setDoc(
        doc(db, 'conversations', conversationId),
        { ...data, deletedFor: arrayRemove(me.id) },
        { merge: true }
      );
      navigation.navigate('Conversation', {
        conversationId,
        participants,
        name: data.name,
      });
    } catch (err) {
      console.error('startChat error:', err);
    }
  };



  return (
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1 bg-[#fcfcfc] dark:bg-[#323131]'>
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => { setShowAddList(false); setIsAddingDate(false); setSelectedDay(); setSelectedTime(); setDuration(60); setSliderValue(12); setTimeUndefined(false); setSelectedDate() }}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' }
        }}>


        {isAddingDate === true ? (

          <View className="flex-1 justify-start items-center">


            <View className="mt-4 mb-2 flex-row justify-center items-center">
              <Text className="text-center font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('select_a_date')}</Text>
            </View>

            <ScrollView
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              directionalLockEnabled
              bounces={false}
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
            >

              <View className="w-full px-6">
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={selectedDate}
                  firstDay={1}
                  theme={{
                    todayTextColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
                    monthTextColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                    textMonthFontSize: 15,
                    textMonthFontWeight: 'bold',
                    dayTextColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                    textDayFontWeight: 'bold',
                    textInactiveColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                    textSectionTitleColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                    textDisabledColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                    selectedDayBackgroundColor: colorScheme === 'dark' ? '#474646' : '#d4d4d3',
                    selectedDayTextColor: '#ffffff', // Color del texto del día seleccionado
                    arrowColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                    calendarBackground: 'transparent',
                  }}
                  style={{ backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', padding: 20, borderRadius: 20 }}
                />
              </View>

              <View className="mt-2 w-full px-6 ">

                <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Text className="ml-3 mb-2 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('start_time')}</Text>
                </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={tempDate}
                    mode="time" // Cambia a modo hora
                    display="spinner" // Puede ser 'default', 'spinner', 'clock', etc.
                    onChange={handleHourSelected}
                    style={{ width: 320, height: 150 }} // Puedes ajustar el estilo como prefieras
                  />
                )}
              </View>

              <View className="mt-6 mb-10 w-full px-6 ">

                <Text className="ml-3 mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('duration_label', { duration: formatDuration(duration) })}</Text>

                <View className="flex-1 px-4 justify-center items-center">
                  <Slider
                    style={{ width: '100%', height: 10 }}
                    minimumValue={1} // Ahora el valor mínimo del slider es 0
                    maximumValue={34} // Máximo valor (ajustado para abarcar el rango completo)
                    step={1} // Paso de 1 porque nosotros controlamos el salto
                    thumbImage={thumbImage}
                    minimumTrackTintColor="#b6b5b5"
                    maximumTrackTintColor="#474646"
                    value={sliderValue} // Convertimos los minutos reales al valor del slider
                    onValueChange={handleSliderChange}
                  />
                </View>
              </View>

              <View className="pl-10 flex-row w-full justify-start  items-center ">

                <TouchableOpacity
                  onPress={() => setTimeUndefined(!timeUndefined)}
                  style={[
                    styles.checkbox,
                    { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' },
                    timeUndefined && {
                      backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                      borderWidth: 0
                    }
                  ]}
                >
                  {timeUndefined && (
                    <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                  )}
                </TouchableOpacity>

                <Text className="ml-3 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('undefined_time')}</Text>

              </View>

              <View className="mt-6 pb-3 px-6 flex-row justify-center items-center ">

                <TouchableOpacity
                  disabled={!(selectedDay && selectedTime && duration) && !timeUndefined}
                  onPress={() => { sheet.current.close(); navigation.navigate('Booking', { serviceData, location, bookingStartDate: selectedDay, bookingStartTime: selectedTime, bookingDuration: timeUndefined ? null : duration, bookingDateUndefined: timeUndefined }) }}
                  style={{ opacity: !(selectedDay && selectedTime && duration) && !timeUndefined ? 0.5 : 1 }}
                  className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17px] rounded-full items-center justify-center"
                >
                  <Text className="text-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                      {formatBookingMessage()}
                    </Text>
                  </Text>
                </TouchableOpacity>

              </View>

              <View className="h-[20px]" />

            </ScrollView>

          </View>

        ) : (

          <View className="flex-1">
            {showAddList ? (

              <View className="flex-1 justify-start items-center">

                <View className="mt-3 mb-12 flex-row justify-center items-center">

                  <View className="flex-1 items-start">
                    <TouchableOpacity onPress={() => { setShowAddList(false); setListName(''); openSheetWithInput(450) }} className="ml-5">
                      <ChevronLeftIcon height={21} width={21} strokeWidth={2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-center items-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('new_list')}</Text>
                  </View>

                  <View className="flex-1 items-end">
                    {listName.length > 0 ? (
                      <TouchableOpacity onPress={handleDone}>
                        <Text className="mr-7 text-center font-inter-medium text-[14px] text-[#979797]">{t('done')}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                <View className="w-full px-5">

                  <View className="w-full h-[55px] px-4  bg-[#f2f2f2] dark:bg-[#272626] rounded-full flex-row justify-start items-center">

                    <TextInput
                      placeholder={t('list_name_placeholder')}
                      autoFocus={true}
                      selectionColor={cursorColorChange}
                      placeholderTextColor={placeHolderTextColorChange}
                      onChangeText={inputListNameChanged}
                      value={listName}
                      keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                      className="font-inter-medium flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                    />

                    {listName.length > 0 ? (
                      <TouchableOpacity onPress={handleClearText}>
                        <View className='h-[23px] w-[23px] justify-center items-center rounded-full bg-[#fcfcfc] dark:bg-[#323131]'>
                          <XMarkIcon height={13} color={iconColor} strokeWidth={2.6} />
                        </View>
                      </TouchableOpacity>
                    ) : null}

                  </View>

                </View>



              </View>

            ) : (

              <View className="flex-1 justify-center items-center">

                <View className="mt-3 mb-12 flex-row justify-center items-center">
                  <View className="flex-1" />

                  <View className="flex-row justify-center items-center">
                    <Text className="text-center font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('add_to_list')}</Text>
                  </View>

                  <View className="flex-1 items-end">
                    <TouchableOpacity onPress={() => { setShowAddList(true), openSheetWithInput(250) }} className="mr-5">
                      <Plus height={27} width={27} strokeWidth={1.7} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView className="flex-1 w-full px-7">
                  {lists.map((list, index) => (
                    <View key={list.id ? list.id : index} className="justify-center items-center" >

                      <TouchableOpacity onPress={() => addItemList(list.id)} className="mb-4 flex-row justify-between items-center w-full">

                        <View className="flex-row justify-start items-center">
                          <Image source={list.services[0] ? list.services[0].image_url ? { uri: list.services[0].image_url } : null : null} className="h-[50px] w-[50px] bg-[#E0E0E0] dark:bg-[#3D3D3D] rounded-lg mr-4" />
                          <View className="justify-center items-start">
                            <Text className="mb-1 text-center font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{list.title}</Text>
                            <Text className="text-center font-inter-medium text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('services_count', { count: list.item_count })}</Text>
                          </View>
                        </View>

                        <View className="p-[5px] rounded-full border-[1.8px] border-[#b6b5b5] dark:border-[#706f6e]">
                          <Plus height={15} width={15} strokeWidth={2.5} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} />
                        </View>

                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity onPress={() => { setShowAddList(true), openSheetWithInput(250) }} className="flex-row justify-start items-center w-full ">
                    <View className="h-[50px] w-[50px] bg-[#444343] dark:bg-[#f2f2f2] rounded-lg mr-4 justify-center items-center">
                      <Plus height={23} width={23} strokeWidth={2.5} color={colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2'} />
                    </View>
                    <View className="justify-center items-start">
                      <Text className="mb-1 text-center font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('new_list')}</Text>
                    </View>
                  </TouchableOpacity>

                </ScrollView>

              </View>
            )}
          </View>

        )}



      </RBSheet>

      <BottomSheetModal
        ref={reportSheetModalRef}
        enableDynamicSizing
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
        )}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        enablePanDownToClose
        onDismiss={handleReportSheetDismiss}
        backgroundStyle={{
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
        }}
        handleIndicatorStyle={{ backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <BottomSheetScrollView contentContainerStyle={{ minHeight: sheetMinHeight }} keyboardShouldPersistTaps="handled">
            {renderReportSheetContent()}
          </BottomSheetScrollView>
        </TouchableWithoutFeedback>
      </BottomSheetModal>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-6 flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Top FALTA */}

        <View className="flex-row justify-between items-start">

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
          </TouchableOpacity>

          <View className="flex-row justify-end items-start">

            <TouchableOpacity onPress={() => null} className="items-center justify-center mr-6">
              <Share height={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => heartClicked(serviceId)} className="mr-2">
              {isServiceLiked ? (
                <View className="justify-center items-center">
                  <HeartFill height={24} width={24} strokeWidth={1.7} color={'#ff633e'} />
                  <Text className="mt-1 font-inter-semibold text-center text-[10px] text-[#ff633e]">{serviceData.likes_count}</Text>
                </View>
              ) : (
                <View className="justify-center items-center">
                  <Heart height={24} width={24} strokeWidth={1.7} color={iconColor} />
                  <Text className="mt-[2px] font-inter-semibold text-center text-[10px] text-[#b6b5b5] dark:text-[#706F6E]">{serviceData.likes_count}</Text>
                </View>
              )}
            </TouchableOpacity>

          </View>

        </View>

        {/* Service and User info */}

        <View className="justify-start items-center mt-7">

          <Image source={serviceData.profile_picture ? { uri: serviceData.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[100px] w-[100px] bg-[#d4d4d3] dark:bg-[#474646] rounded-full" />

          <Text className="mt-3 font-inter-bold text-center text-[23px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.first_name} {serviceData.surname}</Text>

          <Text className="mt-2 font-inter-medium text-center text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
            <Text>@{serviceData.username}</Text>
            <Text> • </Text>
            <Text>{serviceData.service_title}</Text>
          </Text>

          {/* Service facts */}

          <View className="py-3 mt-7 mx-4 flex-row justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-3xl">

            <View className="flex-1 justify-center items-center border-r-[1px] border-[#d4d4d3] dark:border-[#474646]">
              <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.confirmed_booking_count}</Text>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">{t('bookings')}</Text>
            </View>
            {!!serviceData.average_rating && (
              <View className="flex-1 justify-center items-center ">
                <View className="flex-row justify-center items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1.3 }] }} />
                  <Text className="ml-[6px] font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.average_rating).toFixed(1)}</Text>
                </View>
                <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">{t('rating')}</Text>
              </View>
            )}

            <View className="flex-1 justify-center items-center border-l-[1px] border-[#d4d4d3] dark:border-[#474646]">
              <Text className="font-inter-bold text-center text-[22px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.repeated_bookings_count}</Text>
              <Text className="mt-1 font-inter-semibold text-center text-[11px] text-[#b6b5b5] dark:text-[#706F6E]">{t('repeats')}</Text>
            </View>

          </View>

        </View>

        {/* Description */}

        <View className="mt-9 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('about_the_service')}</Text>

          <Text onTextLayout={onTextLayout} numberOfLines={isDescriptionExpanded ? null : 4} className="break-all text-[14px] text-[#515150] dark:text-[#d4d4d3]">{serviceData.description}</Text>

          {showMoreButton && (

            <View>
              {!isDescriptionExpanded && (
                <TouchableOpacity onPress={() => setIsDescriptionExpanded(true)}>
                  <Text className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2] ">{t('read_more')}</Text>
                </TouchableOpacity>
              )}
              {isDescriptionExpanded && (
                <TouchableOpacity onPress={() => setIsDescriptionExpanded(false)}>
                  <Text className="mt-2 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{t('show_less')}</Text>
                </TouchableOpacity>
              )}
            </View>

          )}


        </View>

        {/* Gallery */}

        {Array.isArray(serviceData.images) && serviceData.images.length > 0 && (
          <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

            <View className="mb-5 w-full flex-row justify-between items-center">
              <Text className=" flex-1 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('gallery')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DisplayImages', { images: serviceData.images })} >
                <ChevronRightIcon size={20} color={colorScheme === 'dark' ? '#b6b5b5' : '#706F6E'} strokeWidth={2.1} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="w-full">

              {serviceData.images.slice(0, 10).map((image, index) => (

                <TouchableOpacity
                  key={image.id ? image.id : index}
                  onPress={() => navigation.navigate('EnlargedImage', { images: serviceData.images, index: index })}
                >
                  <Image source={{ uri: image.image_url }} className="mr-3 h-[110px] w-[100px] bg-[#d4d4d3] dark:bg-[#474646] rounded-2xl" />
                </TouchableOpacity>

              ))}

            </ScrollView>

          </View>
        )}

        {/* Service data */}

        <View className="mt-8 pl-6 justify-center items-center pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <View className="flex-row justify-center items-start">

            <View className="flex-1 justify-start items-start">

              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">{t('earned_money')}</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.total_earned_amount).toFixed(0)} €</Text>
              </View>
              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">{t('total_hours')}</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.total_hours_completed).toFixed(0)} h</Text>
              </View>
              <View className="justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">{t('repeat_bookings')}</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.repeated_bookings_count}</Text>
              </View>

            </View>

            <View className="flex-1 justify-start items-start">

              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">{t('success_rate')}</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.success_rate).toFixed(0)} %</Text>
              </View>
              <View className="mb-6 justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">{t('total_bookings')}</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{serviceData.confirmed_booking_count}</Text>
              </View>
              <View className="justify-start items-start">
                <Text className="font-inter-medium text-center text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">{t('response_time')}</Text>
                <Text className="mt-1 font-inter-bold text-center text-[17px] text-[#444343] dark:text-[#f2f2f2]">{formatResponseTime(serviceData?.response_time_minutes)}</Text>
              </View>

            </View>

          </View>

        </View>

        {/* Tags and skills */}

        {Array.isArray(serviceData.tags) && serviceData.tags.length > 0 && (

          <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

            <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('tags_and_skills')}</Text>

            <View className="flex-row justify-start items-center flex-wrap">
              {serviceData.tags.map((tag, index) => (
                <View key={index} className="flex-row py-2 px-3 bg-[#f2f2f2] dark:bg-[#272626] rounded-full mr-1 mb-1">
                  <Text className="font-inter-semibold text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">{tag}</Text>
                </View>
              ))}
            </View>

          </View>

        )}

        {/* Personal information */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('personal_information')}</Text>


          {Array.isArray(serviceData.languages) && serviceData.languages.length > 0 && (
            <Text>
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('languages_label')}</Text>
              <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatLanguages(serviceData.languages)}</Text>
            </Text>
          )}

          {typeof serviceData.hobbies === 'string' && serviceData.hobbies.trim().length > 0 && (
            <Text className="mt-4">
            <Text className="mt-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('hobbies_label')}</Text>
              <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{serviceData.hobbies}</Text>
            </Text>
          )}

          <Text className="mt-4">
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('verified_label')}</Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{t('identity')}</Text>
          </Text>

          <Text className="mt-4">
            <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('creation_date')}</Text>
            <Text className="font-inter-medium text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{formatDate(serviceData.service_created_datetime)}</Text>
          </Text>

          {/* Experiences */}

          {Array.isArray(serviceData.experiences) && serviceData.experiences.length > 0 && (

            <View >

              <View className="mt-8 mb-8 flex-row w-full justify-between items-center">
                <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('experience_section')}</Text>
                <Text className="mr-3 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706F6E]">
                  {serviceData.experiences.length} {serviceData.experiences.length === 1 ? "experience" : "experiences"}
                </Text>
              </View>

              {serviceData.experiences.map((experience, index) => (

                <View key={index} className="flex-row w-full justify-center items-center">

                  <View className="w-[30px] h-full items-center pr-5">
                    <View className={`flex-1  bg-[#b6b5b5] dark:bg-[#706F6E] ${index > 0 && 'w-[2]'}`} />
                    <View className={`w-4 h-4 rounded-full border-2 border-[#444343] dark:border-[#f2f2f2] ${experience.experience_end_date ? null : colorScheme == 'dark' ? 'bg-[#f2f2f2]' : 'bg-[#444343]'}`}>
                    </View>
                    <View className={`flex-1 w-[2] bg-[#b6b5b5] dark:bg-[#706F6E] ${index === serviceData.experiences.length - 1 ? 'w-[0]' : 'w-[2]'}`} />
                  </View>

                  <View className="flex-1 py-3 px-5 mb-3 bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">

                    <View className="mt-1 flex-row justify-between">
                      <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{experience.experience_title}</Text>
                    </View>

                    <View className="mt-3 flex-row justify-between items-center mb-[6px]">
                      <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{experience.place_name}</Text>
                      <Text>
                        <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(experience.experience_started_date).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}</Text>
                        <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]"> - </Text>
                        <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{experience.experience_end_date ? new Date(experience.experience_end_date).toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : t('experience_still_there')}</Text>
                      </Text>
                    </View>

                  </View>
                </View>
              ))}
            </View>




          )}

        </View>

        {/* Location */}

        <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

          {!serviceData.latitude ? (

            <View className="justify-center items-center w-full">
              <GlobeAltIcon height={80} width={80} strokeWidth={1.2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
              <Text className="mt-3 font-inter-semibold text-[18px] text-[#706F6E] dark:text-[#b6b5b5]">{t('unlocated_or_online_service')}</Text>
            </View>

          ) : (

            serviceData.action_rate === 100 ? (

              <View className="justify-center items-center w-full">
                <GlobeEuropeAfricaIcon height={80} width={80} strokeWidth={1.2} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                <Text className="mt-3 font-inter-semibold text-[18px] text-[#706F6E] dark:text-[#b6b5b5]">{t('unlimited_radius_of_action')}</Text>
              </View>

            ) : (
              <View className='w-full'>

              <Text className="mb-7 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('location')}</Text>

                <View className="justify-center items-center w-full">
                  <View style={{ position: 'relative' }}>
                    <MapView
                      style={{ height: 160, width: 280, borderRadius: 12 }}
                      region={mapRegion}
                    >
                      <View>
                        <Marker
                          coordinate={{ latitude: serviceData.latitude, longitude: serviceData.longitude }}
                          anchor={mapMarkerAnchor}
                          centerOffset={mapMarkerCenterOffset}
                        >
                          <Image
                            source={mapMarkerImage}
                            style={mapMarkerStyle}
                            resizeMode="contain"
                          />
                        </Marker>
                        {hasFiniteActionRate && serviceData.action_rate < 100 && (
                          <Circle
                            center={{ latitude: serviceData.latitude, longitude: serviceData.longitude }}
                            radius={serviceData.action_rate * 1000}
                            strokeColor="rgba(182,181,181,0.8)"
                            fillColor="rgba(182,181,181,0.5)"
                            strokeWidth={2}
                          />
                        )}
                      </View>
                    </MapView>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('FullScreenMap', { location: { latitude: serviceData.latitude, longitude: serviceData.longitude }, actionRate: serviceData.action_rate })}
                      style={{ position: 'absolute', top: 10, right: 10, backgroundColor: colorScheme === 'dark' ? '#3D3D3D' : '#FFFFFF', borderRadius: 20, padding: 8 }}
                    >
                      <Maximize2 width={18} height={18} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
                    </TouchableOpacity>
                  </View>

                  <View className="mt-3 px-3 w-full flex-row justify-between items-center">
                  <Text className="mt-3 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">{address ? address : t('loading')}</Text>
                  <Text className="mt-3 font-inter-semibold text-[14px] text-[#B6B5B5] dark:text-[#706F6E]">{localHour ? t('local_hour', { hour: localHour }) : ''}</Text>
                  </View>

                </View>
              </View>

            )

          )}

        </View>

        {/* Rating and reviews */}

        {Array.isArray(serviceData.reviews) && serviceData.reviews.length > 0 && (

          <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

        <Text className="mb-8 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('rating_and_reviews')}</Text>

            <View className="flex-row w-full justify-between items-center">
              <Text className="font-inter-bold text-[55px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(serviceData.average_rating).toFixed(1)}</Text>

              <View className="justify-start items-end">

                <View className="mb-[-5] flex-row justify-end items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: 8 }} />
                  <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                    <View style={{ width: `${width5}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`} />
                  </View>
                </View>
                <View className="mb-[-5] flex-row justify-end items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: 8 }} />
                  <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                    <View style={{ width: `${width4}%` }} className={`h-full   bg-[#444343] dark:bg-[#f2f2f2] rounded-full`} />
                  </View>
                </View>
                <View className="mb-[-5] flex-row justify-end items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: 8 }} />
                  <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                    <View style={{ width: `${width3}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`} />
                  </View>
                </View>
                <View className="mb-[-5] flex-row justify-end items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: -7 }} />
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: 8 }} />
                  <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                    <View style={{ width: `${width2}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`} />
                  </View>
                </View>
                <View className="flex-row justify-end items-center">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.45 }], marginRight: 8 }} />
                  <View className="w-[170px] h-[4px] bg-[#D4D4D3] dark:bg-[#474646] rounded-full justify-center items-start">
                    <View style={{ width: `${width1}%` }} className={`h-full bg-[#444343] dark:bg-[#f2f2f2] rounded-full`} />
                  </View>
                </View>

              </View >
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('DisplayReviews', { reviews: filteredReviews })} className="w-full justify-center items-end">
              <Text className="mt-3 font-inter-semibold text-[14px] text-[#B6B5B5] dark:text-[#706F6E]">{serviceData.reviews.length} ratings</Text>
            </TouchableOpacity>

            {/* Reviews */}


            {filteredReviews ? (
              <View className="w-full ">

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-5 w-full">

                  {filteredReviews.slice(0, 10).map((review, index) => (
                    <TouchableOpacity onPress={() => navigation.navigate('DisplayReviews', { reviews: filteredReviews })} key={index} className="mr-2 py-5 px-4 w-[300px] bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">

                      <View className="flex-row justify-between items-center">

                        <View className="flex-row justify-start items-center">
                          <Image source={{ uri: review.user.profile_picture }} className="mr-3 h-10 w-10 rounded-full bg-[#706F6E] dark:bg-[#b6b5b5]" />

                          <View className="justify-center items-start">
                            <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{review.user.first_name} {review.user.surname}</Text>
                            <Text className="mt-1 font-inter-medium text-[9px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(review.review_datetime).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                          </View>
                        </View>

                        <View className="flex-row justify-end items-center">
                          <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1 }] }} />
                          <Text className="ml-1 mr-2 font-inter-bold text-[15px] text-[#444343] dark:text-[#f2f2f2]">{review.rating}</Text>
                        </View>

                      </View>

                      <Text numberOfLines={3} className=" mt-5 mb-2 font-inter-medium text-[13px] text-[#706F6E] dark:text-[#b6b5b5]">{review.comment}</Text>

                      {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-5 w-full">
                    <View className="mr-1 w-12 h-12 bg-[#D4D4D3] dark:bg-[#474646] rounded-md" />
                  </ScrollView> */}

                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => navigation.navigate('DisplayReviews', { reviews: filteredReviews })}
                  style={{ opacity: 1 }}
                  className="mt-6 bg-[#F2F2F2] dark:bg-[#272626] w-full h-[45px] rounded-full items-center justify-center"
                >
                  <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{t('see_all_reviews')}</Text>
                </TouchableOpacity>

              </View>
            ) : null}



          </View>

        )}

        {/* Consult */}

        {!!(serviceData.user_can_ask === 1 || serviceData.user_can_consult === 1) && (

          <View className="mt-8 justify-center items-start pb-7 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">

            <View className="mr-2 py-5 px-4 w-full bg-[#F2F2F2] dark:bg-[#272626] rounded-2xl">
            <Text className="mb-4 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('consult_a_professional')}</Text>
              {serviceData.price_consult && (
                <Text className=" font-inter-semibold text-[13px] text-[#706F6E] dark:text-[#b6b5b5]">{t('consult_price_description', { price: parseFloat(serviceData.price_consult).toFixed(0) })}</Text>
              )}

              <View className="mt-8 flex-row justify-center items-center">

                {serviceData.user_can_ask === 1 && (

                  <TouchableOpacity
                    onPress={startChat}
                    style={{ opacity: 1 }}
                    className={`mr-2 bg-[#E0E0E0] dark:bg-[#3d3d3d] ${serviceData.user_can_consult === 0 ? 'w-full' : 'w-1/3'} h-[40] rounded-full items-center justify-center`}
                  >
                    <Text className="font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{t('write')}</Text>
                  </TouchableOpacity>

                )}

                {serviceData.user_can_consult === 1 && (

                  <TouchableOpacity
                    onPress={() => null}
                    style={{ opacity: 1 }}
                    className={`bg-[#444343] dark:bg-[#f2f2f2] ${serviceData.user_can_ask === 0 ? 'w-full' : 'w-2/3'} h-[40] rounded-full items-center justify-center`}
                  >
                    <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">{t('book_a_consult')}</Text>
                  </TouchableOpacity>
                )}

              </View>
            </View>

          </View>
        )}

        {/* Others */}

        <View className="mt-8 justify-center items-start pb-7">

          <Text className="mb-5 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('others')}</Text>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start" onPress={() => navigation.navigate('WisdomWarranty')}>
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <WisdomLogo width={23} height={23} color={iconColor} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('wisdom_warranty')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start" onPress={() => navigation.navigate('ReservationPolicy')}>
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <FileText width={23} height={23} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('reservation_policy')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start" onPress={() => navigation.navigate('CancellationPolicy')}>
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <XCircleIcon width={24} height={24} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('cancellation_policy')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start" onPress={() => navigation.navigate('Help')}>
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Info width={23} height={23} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('help')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start" onPress={() => Linking.openURL('mailto:wisdom.helpcontact@gmail.com')}>
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Phone width={22} height={22} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('contact_wisdom')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 flex-row w-full justify-between items-start" onPress={openReportSheet}>
            <View className="mr-4 py-2 px-3 h-11 w-11 justify-center items-center bg-[#f2f2f2] dark:bg-[#272626] rounded-full">
              <Flag width={23} height={23} color={iconColor} strokeWidth={1.6} />
            </View>
            <View className="pt-3 pb-7 flex-1 flex-row justify-between items-center">
              <Text className="font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('report_service')}</Text>
              <ChevronRightIcon size={20} color={'#979797'} strokeWidth={2} className="p-6" />
            </View>
          </TouchableOpacity>

        </View>

        <View className="h-[50px]" />
      </ScrollView >

      {/* Button book / service settings */}

      {(!isMyService || showServiceSettingsButton) && (
        <View className="flex-row justify-center items-center pb-3 px-6">
          {showServiceSettingsButton ? (
            <TouchableOpacity
              onPress={handleOpenServiceOptions}
              className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
            >
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('service_settings')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => { verifyRegistered(); }}
              style={{ opacity: 1 }}
              className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
            >
                <Text>
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
                    {serviceData?.price_type === 'hour' && (
                      <>
                        {t('book_for')}{' '}
                        <Text className="font-inter-semibold text-[15px] text-[#B6B5B5] dark:text-[#706f6e]">{parseFloat(serviceData?.price).toFixed(0)} €</Text>
                        {t('per_hour')}
                      </>
                    )}
                    {serviceData?.price_type === 'fix' && (
                      <>
                        {t('book_for')}{' '}
                        <Text className="font-inter-semibold text-[15px] text-[#B6B5B5] dark:text-[#706f6e]">{parseFloat(serviceData?.price).toFixed(0)} €</Text>
                      </>
                    )}
                    {serviceData?.price_type === 'budget' && t('book_on_budget')}
                  </Text>
                </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <BottomSheetModal
        ref={serviceOptionsSheetRef}
        onDismiss={handleServiceOptionsDismiss}
        backdropComponent={renderServiceOptionsBackdrop}
        backgroundStyle={{ backgroundColor: serviceSheetBackgroundColor, borderRadius: 25 }}
        handleIndicatorStyle={{ backgroundColor: serviceSheetIndicatorColor }}
      >
        <BottomSheetView className="py-5 px-7 ">
          <TouchableOpacity onPress={handleServiceEdit} className="pb-6 flex-row items-center">
            <Edit2 height={22} width={22} color={iconColor} strokeWidth={2} />
            <Text className="ml-3 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2]">{t('edit_service')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleServiceVisibility}
            disabled={updatingServiceVisibility}
            className="pt-1 pb-6 flex-row items-center"
          >
            {isServiceHidden ? (
              <Eye height={22} width={22} color={iconColor} strokeWidth={2} />
            ) : (
              <EyeOff height={22} width={22} color={iconColor} strokeWidth={2} />
            )}
            <Text className={`ml-3 text-[16px] font-inter-medium text-[#444343] dark:text-[#f2f2f2] ${updatingServiceVisibility ? 'opacity-60' : ''}`}>
              {isServiceHidden ? t('show_service') : t('hide_service')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleServiceDeletePress} className="pt-1 pb-9 flex-row items-center">
            <Trash2 height={22} width={22} color="#FF633E" strokeWidth={2} />
            <Text className=" ml-3 text-[16px] font-inter-medium text-[#FF633E]">{t('delete_service')}</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>

      <Message
        type="modal"
        visible={serviceDeleteConfirmVisible}
        title={t('delete_service_confirm_title')}
        description={t('delete_service_confirm_description')}
        confirmText={t('delete_service_confirm_confirm')}
        cancelText={t('delete_service_confirm_cancel')}
        onConfirm={handleConfirmServiceDelete}
        onCancel={handleCancelServiceDelete}
        onDismiss={handleCancelServiceDelete}
      />

      </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 4,
  },
});
