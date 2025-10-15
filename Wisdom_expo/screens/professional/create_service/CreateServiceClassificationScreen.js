import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import Triangle from '../../../assets/triangle';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../utils/api.js';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';


const matchById = (first, second) => {
  if (first == null || second == null) return false;
  return String(first) === String(second);
};

export default function CreateServiceClassificationScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const { title } = prevParams;

  const initialFamily = prevParams.family || prevParams.category?.family || null;
  const initialCategory = prevParams.category || null;

  // ---------- state general ----------
  const [family, setFamily] = useState(initialFamily);
  const [category, setCategory] = useState(initialCategory);

  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [families, setFamilies] = useState([]);
  const [categories, setCategories] = useState([]);

  // ---------- anclas calculadas ----------
  const [familyAnchor, setFamilyAnchor] = useState(null);
  const [categoryAnchor, setCategoryAnchor] = useState(null);

  // ---------- refs ----------
  const familyBtnRef = useRef(null);
  const categoryBtnRef = useRef(null);
  const formContainerRef = useRef(null); // contenedor sobre el que posicionamos

  // ---------- data ----------
  const getFamilies = async () => {
    try {
      const { data } = await api.get('/api/service-family');
      setFamilies(data);
    } catch (e) {
      console.error('Error al obtener familias', e);
    }
  };

  const getCategories = async (familyId) => {
    try {
      const { data } = await api.get(`/api/service-family/${familyId}/categories`);
      setCategories(data);
    } catch (e) {
      console.error('Error al obtener categorías', e);
    }
  };

  useEffect(() => {
    getFamilies();
  }, []);

  const selectedFamilyId = family?.id ?? family?.service_family_id ?? null;
  const selectedCategoryId = category?.service_category_id ?? category?.id ?? null;

  useEffect(() => {
    if (family || families.length === 0 || prevParams.familyId == null) return;
    const defaultFamily = families.find((item) => {
      const itemId = item?.id ?? item?.service_family_id;
      return matchById(itemId, prevParams.familyId);
    });
    if (defaultFamily) {
      setFamily(defaultFamily);
    }
  }, [families, family, prevParams.familyId]);

  useEffect(() => {
    if (!selectedFamilyId) return;
    getCategories(selectedFamilyId);
  }, [selectedFamilyId]);

  useEffect(() => {
    if (prevParams.categoryId == null) return;
    if (selectedCategoryId && !matchById(selectedCategoryId, prevParams.categoryId)) return;
    if (categories.length === 0) return;
    const defaultCategory = categories.find((item) => {
      const itemId = item?.service_category_id ?? item?.id;
      return matchById(itemId, prevParams.categoryId);
    });
    if (defaultCategory && category !== defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [categories, category, prevParams.categoryId, selectedCategoryId]);

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
  } = useServiceFormEditing({
    prevParams,
    currentValues: {
      family,
      category,
      familyId: selectedFamilyId ?? prevParams.familyId ?? null,
      categoryId: selectedCategoryId ?? prevParams.categoryId ?? null,
    },
    t,
  });

  // ---------- handlers ----------
  const handleFamilyPress = (item) => {
    setFamily(item);
    setShowFamilyDropdown(false);
    setCategory(null);
  };

  const handleCategoryPress = (item) => {
    setCategory(item);
    setShowCategoryDropdown(false);
  };

  const openFamilyDropdown = () => {
    setShowCategoryDropdown(false);
    familyBtnRef.current?.measureLayout(
      formContainerRef.current,
      (x, y, width, height) => {
        setFamilyAnchor({ x, y, width, height });
        setShowFamilyDropdown((prev) => !prev);
      },
      (err) => console.log('measureLayout error', err)
    );
  };

  const openCategoryDropdown = () => {
    if (!family) return;
    setShowFamilyDropdown(false);
    categoryBtnRef.current?.measureLayout(
      formContainerRef.current,
      (x, y, width, height) => {
        setCategoryAnchor({ x, y, width, height });
        setShowCategoryDropdown((prev) => !prev);
      },
      (err) => console.log('measureLayout error', err)
    );
  };

  const renderFamilyItem = ({ item }) => (
    <TouchableOpacity className="py-3" onPress={() => handleFamilyPress(item)}>
      <Text className="ml-6 text-[15px] text-[#444343] dark:text-[#f2f2f2]">
        {item.service_family || item.name || item.family_name || ''}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity className="py-3" onPress={() => handleCategoryPress(item)}>
      <Text className="ml-6 text-[15px] text-[#444343] dark:text-[#f2f2f2]">
        {item.service_category_name || item.name || ''}
      </Text>
    </TouchableOpacity>
  );

  // posición top relativa al contenedor
  const dropdownTop = (anchor) => (anchor ? anchor.y + anchor.height : 0);

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]"
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View className="flex-1 px-6 pt-5 pb-6">
        <ServiceFormHeader
          onBack={requestBack}
          onSave={handleSave}
          showSave={isEditing && hasChanges}
          saving={saving}
        />

        <View className="justify-center items-center">
          <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">
            {t('what_family_and_category_does_it_belong_to')}
          </Text>
        </View>

        {/* ---------- Form ---------- */}
        <View ref={formContainerRef} className="flex-1 px-9 pb-[80px] justify-center items-center">
          {/* ----- Family selector ----- */}
          <TouchableOpacity
            ref={familyBtnRef}
            onPress={openFamilyDropdown}
            className="w-full px-6 py-4 bg-[#fcfcfc] dark:bg-[#323131] rounded-xl flex-row justify-between items-center"
          >
            <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">
              {family ? family.service_family || family.name || family.family_name || '' : t('choose_family')}
            </Text>
            {showFamilyDropdown ? (
              <ChevronUpIcon size={20} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
            ) : (
              <ChevronDownIcon size={20} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
            )}
          </TouchableOpacity>

          {showFamilyDropdown && familyAnchor && (
            <View
              style={{
                position: 'absolute',
                top: dropdownTop(familyAnchor),
                left: familyAnchor.x,
                width: familyAnchor.width,
                zIndex: 1000,
              }}
              className="justify-center items-center mt-2"
            >
              <View className="flex-row w-full justify-end pr-5">
                <Triangle fill={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} width={30} height={14} />
              </View>
              <View className="w-full h-[190px] bg-[#fcfcfc] dark:bg-[#323131] rounded-xl px-2 pt-3">
                <FlatList
                  data={families}
                  renderItem={renderFamilyItem}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator
                />
              </View>
            </View>
          )}

          {/* ----- Category selector ----- */}
          <TouchableOpacity
            ref={categoryBtnRef}
            onPress={openCategoryDropdown}
            disabled={!family}
            style={{ opacity: family ? 1 : 0.4 }}
            className="mt-8 w-full px-6 py-4 bg-[#fcfcfc] dark:bg-[#323131] rounded-xl flex-row justify-between items-center"
          >
            <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">
              {category
                ? category.service_category_name || category.name || ''
                : t('choose_category')}
            </Text>
            {showCategoryDropdown ? (
              <ChevronUpIcon size={20} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
            ) : (
              <ChevronDownIcon size={20} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
            )}
          </TouchableOpacity>

          {showCategoryDropdown && categoryAnchor && (
            <View
              style={{
                position: 'absolute',
                top: dropdownTop(categoryAnchor),
                left: categoryAnchor.x,
                width: categoryAnchor.width,
                zIndex: 1000,
              }}
              className="justify-center items-center mt-2"
            >
              <View className="flex-row w-full justify-end pr-5">
                <Triangle fill={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} width={30} height={14} />
              </View>
              <View className="w-full h-[190px] bg-[#fcfcfc] dark:bg-[#323131] rounded-xl px-2 pt-3">
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator
                />
              </View>
            </View>
          )}
        </View>

        {/* ---------- Footer ---------- */}
        <View className="flex-row justify-center items-center">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CreateServiceTitle', {
                prevParams: {
                  ...prevParams,
                  family,
                  familyId: selectedFamilyId,
                  category,
                  categoryId: selectedCategoryId,
                },
              })
            }
            className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center"
          >
            <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">
              {t('back')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!family || !category}
            onPress={() =>
              navigation.navigate('CreateServiceDescription', {
                prevParams: {
                  ...prevParams,
                  family,
                  familyId: selectedFamilyId,
                  category,
                  categoryId: selectedCategoryId,
                },
              })
            }
            style={{ opacity: family && category ? 1 : 0.5 }}
            className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center"
          >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">
              {t('continue')}
            </Text>
          </TouchableOpacity>
        </View>
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