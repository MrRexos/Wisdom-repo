
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import { Search, Sliders, Heart, Plus, Check } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import SuitcaseFill from "../../assets/SuitcaseFill.tsx"
import HeartFill from "../../assets/HeartFill.tsx"
import WisdomLogo from '../../assets/wisdomLogo.tsx'
import api from '../../utils/api.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView, BottomSheetScrollView, BottomSheetFooter } from '@gorhom/bottom-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Slider from '@react-native-community/slider';

const DEFAULT_PRICE_RANGE = [0, 120];
const DEFAULT_DISTANCE = 30;
const DEFAULT_RATING = 0;
const DEFAULT_COMPANY_ONLY = false;
const DEFAULT_VERIFIED_ONLY = false;
const COUNT_DEBOUNCE_MS = 350;


const DATE_LOCALE_MAP = {
  en: 'en-US',
  es: 'es-ES',
  ca: 'ca-ES',
  ar: 'ar',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedOrderBy, setSelectedOrderBy] = useState('recommend');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState();
  const [userId, setUserId] = useState();
  const [showAddList, setShowAddList] = useState(false);
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState();
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);
  const [addedServices, setAddedServices] = useState([]);
  const route = useRoute();
  const [categoryId, setCategoryId] = useState();
  const [categoryName, setCategoryName] = useState();
  const [searchedService, setSearchedService] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [duration, setDuration] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchedDirection, setSearchedDirection] = useState(null);
  const filterSheetModalRef = useRef(null);
  const filterSnapPoints = useMemo(() => ['75%'], []);
  const initialCategoryIdRef = useRef(
    route.params?.category !== null &&
      route.params?.category !== undefined &&
      Number.isFinite(Number(route.params?.category))
      ? Number(route.params?.category)
      : null
  );
  const [priceRange, setPriceRange] = useState([...DEFAULT_PRICE_RANGE]);
  const [distanceValue, setDistanceValue] = useState(DEFAULT_DISTANCE);
  const [ratingValue, setRatingValue] = useState(DEFAULT_RATING);
  const [businessProfileOnly, setBusinessProfileOnly] = useState(DEFAULT_COMPANY_ONLY);
  const [verifiedProfileOnly, setVerifiedProfileOnly] = useState(DEFAULT_VERIFIED_ONLY);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const initial = initialCategoryIdRef.current;
    return Number.isFinite(initial) ? [initial] : [];
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [activeFamilyId, setActiveFamilyId] = useState(null);
  const [filtersCount, setFiltersCount] = useState(null);
  const [isCountingFilters, setIsCountingFilters] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const hasLoadedRef = useRef(false);
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    minPrice: null,
    maxPrice: null,
    distanceKm: null,
    minRating: null,
    requireCompany: DEFAULT_COMPANY_ONLY,
    requireVerified: DEFAULT_VERIFIED_ONLY,
    selectedCategories: Number.isFinite(initialCategoryIdRef.current) ? [initialCategoryIdRef.current] : [],
  }));
  const sliderWidth = useMemo(() => Math.max(Dimensions.get('window').width - 90, 160), []);
  const [activeSliderInteractions, setActiveSliderInteractions] = useState(0);

  const beginSliderInteraction = useCallback(() => {
    setActiveSliderInteractions((count) => count + 1);
  }, []);

  const endSliderInteraction = useCallback(() => {
    setActiveSliderInteractions((count) => (count > 0 ? count - 1 : 0));
  }, []);

  const formatRatingValue = useCallback((value) => {
    const rounded = Math.round(value * 10) / 10;
    if (Number.isInteger(rounded)) {
      return String(rounded);
    }
    return rounded.toFixed(1);
  }, []);

  const renderFilterBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  const renderFilterFooter = useCallback(
    (props) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom + 12}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
          }}
        >
          <TouchableOpacity
            className="h-[55px] items-center justify-center rounded-full py-4 dark:bg-[#fcfcfc] bg-[#323131]"
            onPress={handleApplyFilters}
            disabled={isApplyingFilters}
            style={{ opacity: isApplyingFilters ? 0.6 : 1 }}
          >
            <Text className="text-center font-inter-semibold text-[15px] text-[#f2f2f2] dark:text-[#3d3d3d] ">
              {t('filters_show_results', { count: isCountingFilters ? '…' : (filtersCount ?? '—') })}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [
      insets.bottom,
      handleApplyFilters,
      isApplyingFilters,
      t,
      isCountingFilters,
      filtersCount,
    ]
  );

  const syncControlsWithFilters = useCallback(
    (filtersSnapshot) => {
      if (!filtersSnapshot) {
        setPriceRange([...DEFAULT_PRICE_RANGE]);
        setDistanceValue(DEFAULT_DISTANCE);
        setRatingValue(DEFAULT_RATING);
        setBusinessProfileOnly(DEFAULT_COMPANY_ONLY);
        setVerifiedProfileOnly(DEFAULT_VERIFIED_ONLY);
        setSelectedCategories(Number.isFinite(initialCategoryIdRef.current) ? [initialCategoryIdRef.current] : []);
        return;
      }

      const nextMinPrice = Number.isFinite(filtersSnapshot.minPrice) ? Number(filtersSnapshot.minPrice) : DEFAULT_PRICE_RANGE[0];
      const nextMaxPrice = Number.isFinite(filtersSnapshot.maxPrice) ? Number(filtersSnapshot.maxPrice) : DEFAULT_PRICE_RANGE[1];
      setPriceRange([nextMinPrice, nextMaxPrice]);
      setDistanceValue(Number.isFinite(filtersSnapshot.distanceKm) ? Number(filtersSnapshot.distanceKm) : DEFAULT_DISTANCE);
      setRatingValue(Number.isFinite(filtersSnapshot.minRating) ? Number(filtersSnapshot.minRating) : DEFAULT_RATING);
      setBusinessProfileOnly(Boolean(filtersSnapshot.requireCompany));
      setVerifiedProfileOnly(Boolean(filtersSnapshot.requireVerified));

      if (Array.isArray(filtersSnapshot.selectedCategories) && filtersSnapshot.selectedCategories.length > 0) {
        const normalized = Array.from(new Set(
          filtersSnapshot.selectedCategories
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id))
        ));
        setSelectedCategories(normalized);
      } else {
        setSelectedCategories(Number.isFinite(initialCategoryIdRef.current) ? [initialCategoryIdRef.current] : []);
      }
    },
    [initialCategoryIdRef]
  );

  const handleOpenFilters = useCallback(() => {
    syncControlsWithFilters(appliedFilters);
    setFiltersCount(null);
    setIsFilterSheetOpen(true);
    filterSheetModalRef.current?.present();
  }, [appliedFilters, syncControlsWithFilters]);

  const closeFiltersSheet = useCallback((filtersSnapshot) => {
    syncControlsWithFilters(filtersSnapshot ?? appliedFilters);
    setIsFilterSheetOpen(false);
    setFiltersCount(null);
    setIsCountingFilters(false);
    setActiveSliderInteractions(0);
    filterSheetModalRef.current?.dismiss();
  }, [appliedFilters, syncControlsWithFilters]);

  const handleCloseFilters = useCallback(() => {
    closeFiltersSheet();
  }, [closeFiltersSheet]);

  const handleClearFilters = useCallback(() => {
    setPriceRange([...DEFAULT_PRICE_RANGE]);
    setDistanceValue(DEFAULT_DISTANCE);
    setRatingValue(DEFAULT_RATING);
    setBusinessProfileOnly(DEFAULT_COMPANY_ONLY);
    setVerifiedProfileOnly(DEFAULT_VERIFIED_ONLY);
    setSelectedCategories(Number.isFinite(initialCategoryIdRef.current) ? [initialCategoryIdRef.current] : []);
    setFiltersCount(null);
  }, [initialCategoryIdRef]);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUser = await getDataLocally('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id) {
            setUserId(parsedUser.id);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserId();
  }, []);

  useEffect(() => {
    if (route.params?.category !== undefined) {
      const categoryParam = route.params.category;
      const numericCategory = Number(categoryParam);
      setCategoryId(Number.isFinite(numericCategory) ? numericCategory : undefined);
      setCategoryName(route.params.category_name);
      setSearchedService(undefined);
      setDuration(null);
      setSelectedTime(null);
      setSelectedDay(null);
      setSearchedDirection(null);

      const categoriesSelection = Number.isFinite(numericCategory) ? [numericCategory] : [];
      setSelectedCategories(categoriesSelection);

      setAppliedFilters((prev) => {
        const next = { ...prev, selectedCategories: categoriesSelection };
        loadResults(next);
        return next;
      });
    } else if (route.params?.searchedService !== undefined) {
      const {
        duration: durationParam,
        selectedTime: selectedTimeParam,
        selectedDay: selectedDayParam,
        searchedDirection: directionParam,
      } = route.params;
      setCategoryId(undefined);
      setCategoryName(undefined);
      setSearchedService(route.params.searchedService);
      setDuration(durationParam);
      setSelectedTime(selectedTimeParam);
      setSelectedDay(selectedDayParam);
      setSearchedDirection(directionParam);
      setSelectedCategories([]);

      setAppliedFilters((prev) => {
        const next = { ...prev, selectedCategories: [] };
        loadResults(next);
        return next;
      });
    } else if (!hasLoadedRef.current) {
      loadResults();
    }
  }, [
    route.params?.category,
    route.params?.category_name,
    route.params?.searchedService,
    route.params?.duration,
    route.params?.selectedTime,
    route.params?.selectedDay,
    route.params?.searchedDirection,
    loadResults
  ]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    loadResults();
  }, [selectedOrderBy, loadResults]);

  useEffect(() => {
    if (!userId || !hasLoadedRef.current) return;
    loadResults();
  }, [userId, loadResults]);

  const orderByOptions = useMemo(() => ([
    { label: t('order_option_recommend'), type: 'recommend' },
    { label: t('order_option_cheapest'), type: 'cheapest' },
    { label: t('order_option_best_rated'), type: 'bestRated' },
    { label: t('order_option_most_expensive'), type: 'mostExpensive' },
    { label: t('order_option_nearest'), type: 'nearest' },
    { label: t('order_option_availability'), type: 'availability' },
  ]), [t]);

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  const inputListNameChanged = (text) => {
    setListName(text);
  };

  const handleClearText = () => {
    setListName('');
  };

  const getValue = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) {
      return '';
    }
    const first = arr[0] ?? {};
    const key = Object.keys(first)[0];
    return first?.[key] ?? '';
  };

  const getPendingFiltersSnapshot = useCallback(() => {
    const rawMin = Number(priceRange?.[0]);
    const rawMax = Number(priceRange?.[1]);
    const rawDistance = Number(distanceValue);
    const rawRating = Number(ratingValue);

    const sanitizedCategories = Array.from(new Set(
      selectedCategories
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
    ));

    return {
      minPrice: Number.isFinite(rawMin) && rawMin !== DEFAULT_PRICE_RANGE[0] ? rawMin : null,
      maxPrice: Number.isFinite(rawMax) && rawMax !== DEFAULT_PRICE_RANGE[1] ? rawMax : null,
      distanceKm: Number.isFinite(rawDistance) && rawDistance !== DEFAULT_DISTANCE ? rawDistance : null,
      minRating: Number.isFinite(rawRating) && rawRating > 0 ? rawRating : null,
      requireCompany: businessProfileOnly,
      requireVerified: verifiedProfileOnly,
      selectedCategories: sanitizedCategories,
    };
  }, [priceRange, distanceValue, ratingValue, businessProfileOnly, verifiedProfileOnly, selectedCategories]);

  const buildParamsFromFilters = useCallback((filtersSnapshot = appliedFilters, extra = {}) => {
    const params = {};

    if (searchedService) {
      const queryValue = getValue(searchedService);
      if (queryValue) {
        params.query = queryValue;
      }
    }

    if (userId) {
      params.viewer_id = userId;
    }

    if (Number.isFinite(Number(duration))) {
      params.duration_minutes = Number(duration);
    }

    if (selectedOrderBy) {
      params.order_by = selectedOrderBy;
    }

    let categoryIds = Array.isArray(filtersSnapshot.selectedCategories)
      ? filtersSnapshot.selectedCategories
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
      : [];

    if (!categoryIds.length && Number.isFinite(categoryId)) {
      categoryIds = [Number(categoryId)];
    }

    if (availableCategories.length > 0) {
      const allowed = new Set(
        availableCategories
          .map((cat) => Number(cat?.service_category_id))
          .filter((id) => Number.isFinite(id))
      );
      const filtered = categoryIds.filter((id) => allowed.has(id));
      if (filtered.length > 0) {
        categoryIds = filtered;
      }
    }

    if (categoryIds.length > 0) {
      params.category_ids = categoryIds.join(',');
    }

    if (Number.isFinite(filtersSnapshot.minPrice)) {
      params.min_price = Number(filtersSnapshot.minPrice);
    }

    if (Number.isFinite(filtersSnapshot.maxPrice)) {
      params.max_price = Number(filtersSnapshot.maxPrice);
    }

    if (Number.isFinite(filtersSnapshot.minRating)) {
      params.min_rating = Number(filtersSnapshot.minRating);
    }

    if (filtersSnapshot.requireCompany) {
      params.require_company = 1;
    }

    if (filtersSnapshot.requireVerified) {
      params.require_verified = 1;
    }

    const hasLocation =
      searchedDirection?.location?.lat !== undefined &&
      searchedDirection?.location?.lng !== undefined;

    if (hasLocation && Number.isFinite(filtersSnapshot.distanceKm)) {
      params.max_distance_km = Number(filtersSnapshot.distanceKm);
      params.origin_lat = searchedDirection.location.lat;
      params.origin_lng = searchedDirection.location.lng;
    }

    return { ...params, ...extra };
  }, [appliedFilters, searchedService, userId, duration, selectedOrderBy, availableCategories, categoryId, searchedDirection, getValue]);

  const fetchCategoriesForFamily = useCallback(async (familyId) => {
    if (!Number.isFinite(familyId)) {
      return [];
    }
    try {
      const response = await api.get(`/api/service-family/${familyId}/categories`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      return [];
    }
  }, []);

  const loadResults = useCallback(async (filtersOverride) => {
    const filtersToUse = filtersOverride ?? appliedFilters;
    try {
      const params = buildParamsFromFilters(filtersToUse);
      const response = await api.get(`/api/services`, { params });
      const data = response.data;

      if (Array.isArray(data)) {
        const parseCollection = (value, fallback = []) => {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : fallback;
            } catch {
              return fallback;
            }
          }
          return fallback;
        };

        const normalized = data.map((service) => ({
          ...service,
          tags: parseCollection(service.tags),
          images: parseCollection(service.images),
          languages: parseCollection(service.languages),
          distance_km: service?.distance_km !== undefined && service?.distance_km !== null
            ? Number(service.distance_km)
            : null,
        }));

        setResults(normalized);

        const likedIds = normalized
          .filter((service) => service?.is_liked === 1)
          .map((service) => service.service_id);
        setAddedServices(likedIds);

        const familyCandidate = normalized.find((service) => Number.isFinite(service?.service_family_id));
        setActiveFamilyId(familyCandidate ? Number(familyCandidate.service_family_id) : null);
      } else {
        setResults(data);
        setAddedServices([]);
        setActiveFamilyId(null);
      }

      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error al obtener los resultados:', error);
      setResults([]);
      setAddedServices([]);
      setActiveFamilyId(null);
    }
  }, [appliedFilters, buildParamsFromFilters]);

  const fetchFiltersCount = useCallback(async (filtersSnapshot) => {
    if (!isFilterSheetOpen) return;
    const snapshot = filtersSnapshot ?? getPendingFiltersSnapshot();
    try {
      setIsCountingFilters(true);
      const params = buildParamsFromFilters(snapshot);
      const response = await api.get('/api/services/count', { params });
      const total = response.data?.count;
      setFiltersCount(Number.isFinite(total) ? Number(total) : 0);
    } catch (error) {
      console.error('Error al contar los resultados:', error);
    } finally {
      setIsCountingFilters(false);
    }
  }, [isFilterSheetOpen, getPendingFiltersSnapshot, buildParamsFromFilters]);

  useEffect(() => {
    if (!isFilterSheetOpen || activeSliderInteractions > 0) {
      return undefined;
    }
    const timeoutId = setTimeout(() => {
      fetchFiltersCount();
    }, COUNT_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [
    isFilterSheetOpen,
    priceRange,
    distanceValue,
    ratingValue,
    businessProfileOnly,
    verifiedProfileOnly,
    selectedCategories,
    activeSliderInteractions,
    fetchFiltersCount
  ]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!Number.isFinite(activeFamilyId)) {
        setAvailableCategories([]);
        return;
      }

      const categories = await fetchCategoriesForFamily(activeFamilyId);
      if (cancelled) return;
      setAvailableCategories(categories);

      if (categories.length) {
        const allowed = new Set(
          categories
            .map((cat) => Number(cat?.service_category_id))
            .filter((id) => Number.isFinite(id))
        );

        setSelectedCategories((prev) => {
          if (!prev.length) return prev;
          const filtered = prev.filter((id) => allowed.has(Number(id)));
          if (filtered.length === prev.length) return prev;
          return filtered.length ? filtered : prev;
        });

        setAppliedFilters((prev) => {
          if (!Array.isArray(prev.selectedCategories) || !prev.selectedCategories.length) {
            return prev;
          }
          const filtered = prev.selectedCategories.filter((id) => allowed.has(Number(id)));
          if (filtered.length === prev.selectedCategories.length) {
            return prev;
          }
          return { ...prev, selectedCategories: filtered };
        });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [activeFamilyId, fetchCategoriesForFamily]);

  const handleApplyFilters = useCallback(async () => {
    const nextFilters = getPendingFiltersSnapshot();
    setIsApplyingFilters(true);
    try {
      await loadResults(nextFilters);
      setAppliedFilters(nextFilters);
      closeFiltersSheet(nextFilters);
    } catch (error) {
      console.error('Error al aplicar los filtros:', error);
    } finally {
      setIsApplyingFilters(false);
    }
  }, [getPendingFiltersSnapshot, loadResults, closeFiltersSheet]);

  const toggleCategory = useCallback((categoryToToggle) => {
    const numericId = Number(categoryToToggle);
    if (!Number.isFinite(numericId)) return;
    setSelectedCategories((prev) => {
      const exists = prev.includes(numericId);
      if (exists) {
        return prev.filter((id) => id !== numericId);
      }
      return [...prev, numericId];
    });
  }, []);

  const fetchLists = async () => {
    try {
      const userData = await getDataLocally('user');
      const user = userData ? JSON.parse(userData) : null;
      if (user?.id) {
        setUserId(user.id);
        const response = await api.get(`/api/user/${user.id}/lists`);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
    return null;
  };

  const refreshResults = useCallback(() => loadResults(), [loadResults]);

  useRefreshOnFocus(refreshResults);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const heartClicked = async (serviceId) => {
    console.log(serviceId);
    setSelectedServiceId(serviceId);
    const fetchedLists = await fetchLists();
    if (fetchedLists) {
      setLists(fetchedLists); // Aquí se asignan las listas obtenidas
    }
    sheet.current.open();
  };

  const addItemList = async (listId) => {
    try {
      const response = await api.post(`/api/lists/${listId}/items`, {
        service_id: selectedServiceId,
      });
      console.log('Item added:', response.data);
      setAddedServices((prevServices) => [...prevServices, selectedServiceId]);
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

  const renderItem = ({ item, index }) => {
    const isServiceAdded = addedServices.includes(item.service_id) || item.is_liked === 1;
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const images = Array.isArray(item.images) ? item.images : [];
    const getFormattedPrice = () => {
      const numericPrice = parseFloat(item.price);
      const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
      if (item.price_type === 'hour') {
        return (
          <>
            <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]} €</Text>
            <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">{t('per_hour')}</Text>
          </>
        );
      } else if (item.price_type === 'fix') {
        return (
          <>
            <Text className="font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">{t('fixed_price_prefix')}</Text>
            <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{formattedPrice}{currencySymbols[item.currency]} €</Text>
          </>
        );
      } else {
        return <Text className="font-inter-bold text-[13px] text-[#706F6E] dark:text-[#B6B5B5]">{t('price_on_budget')}</Text>;
      }
    };

    return (
      <TouchableOpacity style={{ zIndex: 10 }} onPress={() => navigation.navigate('ServiceProfile', { serviceId: item.service_id })} className="mt-5 mx-5 z-10 rounded-3xl bg-[#fcfcfc] dark:bg-[#323131] ">

        <View className="flex-row justify-between items-center mt-5">
          <Text className="ml-5 mt-1 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
          <TouchableOpacity onPress={() => heartClicked(item.service_id)}>
            {isServiceAdded ? (
              <HeartFill height={23} width={23} strokeWidth={1.7} color={'#ff633e'} style={{ marginRight: 20 }} />
            ) : (
              <Heart height={23} width={23} strokeWidth={1.7} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} style={{ marginRight: 20 }} />
            )}

          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mt-4">

          <Text className="ml-5 mr-5">{getFormattedPrice()}</Text>

          {tags.length > 0 && (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-1">
              {tags.map((tag, index) => (
                <View key={index} className="pr-[6px]">
                  <TouchableOpacity className='px-3 py-1 rounded-full bg-[#f2f2f2] dark:bg-[#272626]'>
                    <Text className='font-inter-medium text-[12px] text-[#979797] '>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

        </View>

        <View className="flex-row justify-between items-end mx-5 mt-4 mb-6">

          <View className="flex-row justify-start items-center">
            <Image source={item.profile_picture ? { uri: item.profile_picture } : require('../../assets/defaultProfilePic.jpg')} className="h-[45px] w-[45px] bg-[#706B5B] rounded-lg" />
            <View className="ml-3 justify-center items-start">
              <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.first_name} {item.surname}</Text>
              <Text className="font-inter-semibold text-[11px] text-[#706F6E] dark:text-[#b6b5b5]">{t('place')}</Text>
            </View>
          </View>

          {item.review_count > 0 && (
            <View className="flex-row items-center ">
              <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
              <Text className="ml-[3px]">
                <Text className="font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{parseFloat(item.average_rating).toFixed(1)}</Text>
                <Text> </Text>
                <Text className="font-inter-medium text-[11px] text-[#706F6E] dark:text-[#B6B5B5]">({item.review_count} {item.review_count === 1 ? t('review') : t('reviews')})</Text>
              </Text>
            </View>
          )}

        </View>

        {images.length > 0 && (
          <View className="px-6 pb-6">
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-1 roundex-lg">
              {images.map((image, index) => (
                <View key={index} className="pr-[6px]">

                  <TouchableOpacity activeOpacity={1} className='ml-1'>
                    <Image source={image.image_url ? { uri: image.image_url } : null} className="h-[65px] w-[55px] bg-[#706B5B] rounded-lg" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}


      </TouchableOpacity>
    );
  };

  const buildDisplayText = () => {
    const parts = [];

    // Función para formatear selectedDay
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { month: 'long', day: 'numeric' }; // Formato: "July 12"
      const locale = DATE_LOCALE_MAP[i18n.language] || DATE_LOCALE_MAP.en;
      return date.toLocaleDateString(locale, options);
    };

    // Agregar searchedDirection si no es null
    if (searchedDirection) {
      parts.push(searchedDirection.address_1);
    }

    // Formatear selectedDay si no es null
    if (selectedDay) {
      const formattedDay = formatDate(selectedDay);
      parts.push(formattedDay);
    }

    // Agregar selectedTime si no es null
    if (selectedTime) {
      parts.push(selectedTime);
    }

    // Unir las partes
    let displayText = '';

    if (parts.length === 3) {
      displayText = `${parts[0]} • ${parts[1]}, ${parts[2]}`; // Forma: "Place • July 12, 19:00"
    } else if (parts.length === 2) {
      displayText = `${parts[0]} • ${parts[1]}`; // Forma: "Place • July 12"
    } else if (parts.length === 1) {
      displayText = parts[0]; // Solo "Place"
    }

    return displayText;
  };


  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        onClose={() => setShowAddList(false)}
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
                <View key={index} className="justify-center items-center" >

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


      </RBSheet>

      <View className="flex-row items-center justify-center pt-8 relative">

        <View className="w-10 justify-center items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} >
            <ChevronLeftIcon size={25} strokeWidth={1.8} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <View className="h-[55px] pl-5 pr-1 w-full flex-row items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            <TouchableOpacity onPress={() => navigation.navigate('Results')} activeOpacity={0.8} className="flex-row items-center flex-1">
              <Search height={19} color={iconColor} strokeWidth={2} />
              <View className="flex-1 justify-center items-center px-2">
                <Text className="mb-1 font-inter-semibold text-center text-[14px] text-[#444343] dark:text-[#f2f2f2]">{searchedService ? getValue(searchedService) : categoryName ? categoryName : ''}</Text>
                {searchedService && (
                  <Text numberOfLines={1} className="font-inter-medium text-center text-[11px] text-[#706F6E] dark:text-[#b6b5b5] truncate">{buildDisplayText()}</Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleOpenFilters} activeOpacity={0.9} className="ml-2 mr-1 h-[40px] w-[40px] rounded-full bg-[#fcfcfc] dark:bg-[#323131] items-center justify-center">
              <Sliders height={17} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="w-10" />

      </View>

      <BottomSheetModal
        ref={filterSheetModalRef}
        index={0}
        snapPoints={filterSnapPoints}
        enablePanDownToClose
        enableContentPanningGesture={activeSliderInteractions === 0}
        backgroundStyle={{
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
        }}
        handleIndicatorStyle={{ backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0' }}
        backdropComponent={renderFilterBackdrop}
        footerComponent={renderFilterFooter}
        >
  
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={activeSliderInteractions === 0}
          >

            <View style={{ paddingHorizontal: 8 }}>

              <View className="flex-row items-center justify-center mb-[50px]">
                <View className="flex-1"></View>
                <View className="flex-1 items-center justify-center">
                  <Text className="flex-1 font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_title')}</Text>
                </View>
                <View className="flex-1 items-end justify-center">
                  <TouchableOpacity onPress={handleClearFilters} accessibilityRole="button" className="px-3 py-[6px] bg-[#f2f2f2] dark:bg-[#3d3d3d] rounded-full items-center justify-center">
                    <Text className="font-inter-semibold text-[10px] text-[#706F6E] dark:text-[#b6b5b5 ] uppercase">{t('filters_clear')}</Text>
                  </TouchableOpacity>
                </View>
                
              </View>

              <View className="mb-8 mt-1">

                <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_price_range')}</Text>

                <View style={{ alignItems: 'center', marginTop: 16 }}>

                  <MultiSlider
                    values={priceRange}
                    min={0}
                    max={120}
                    step={1}
                    sliderLength={sliderWidth}
                    onValuesChangeStart={beginSliderInteraction}
                    onValuesChange={(values) => setPriceRange(values)}
                    onValuesChangeFinish={(values) => {
                      setPriceRange(values);
                      endSliderInteraction();
                    }}
                    selectedStyle={{ backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }}
                    unselectedStyle={{ backgroundColor: colorScheme === 'dark' ? '#474646' : '#d4d4d3' }}
                    containerStyle={{ alignItems: 'center' }}
                    trackStyle={{ height: 4, borderRadius: 2 }}
                    markerStyle={{
                      height: 22,
                      width: 22,
                      backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                      borderWidth: 0,
                    }}
                    pressedMarkerStyle={{
                      height: 22,
                      width: 22,
                      backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                    }}
                  />

                  <View className="flex-row justify-between mt-4">
                    <Text className="font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{priceRange[0]}€</Text>
                    <Text className="mx-8 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">-</Text>
                    <Text className="font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{priceRange[1]}€</Text>
                  </View>

                </View>

                <View className="flex-row justify-center items-center mt-1">
                  <Text style={{ marginRight: 20 }} className="font-inter-medium text-[13px] text-[#b6b5b5] dark:text-[#706F6E]">{t('filters_min_label')}</Text>
                  <Text style={{ marginLeft: 20 }} className="font-inter-medium text-[13px] text-[#b6b5b5] dark:text-[#706F6E]">{t('filters_max_label')}</Text>
                </View>

              </View>

              
              <View className="mb-8">

                <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_distance')}</Text>
                <View className="items-center justify-center px-5">
                  <MultiSlider
                    values={[distanceValue]}
                    min={0}
                    max={30}
                    step={1}
                    sliderLength={sliderWidth}
                    onValuesChangeStart={beginSliderInteraction}
                    onValuesChange={(values) => setDistanceValue(values[0])}
                    onValuesChangeFinish={(values) => {
                      setDistanceValue(values[0]);
                      endSliderInteraction();
                    }}
                    selectedStyle={{ backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }}
                    unselectedStyle={{ backgroundColor: colorScheme === 'dark' ? '#474646' : '#d4d4d3' }}
                    containerStyle={{ alignItems: 'center', marginTop: 16 }}
                    trackStyle={{ height: 4, borderRadius: 2 }}
                    markerStyle={{
                      height: 22,
                      width: 22,
                      backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                      borderWidth: 0,
                    }}
                    pressedMarkerStyle={{
                      height: 22,
                      width: 22,
                      backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                    }}
                  />
                  <View className="mt-2 flex-row items-end">
                    <Text className="font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">
                      {t('filters_distance_value_distance', { distance: Math.round(distanceValue) })}
                    </Text>
                    <Text
                      className="font-inter-medium text-[16px] text-[#b6b5b5] dark:text-[#706F6E]"
                      style={{ marginStart: 6 }}
                    >
                      {t('filters_distance_suffix')}
                    </Text>
                  </View>
                </View>

              </View>

              <View className="mb-8">
                <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_rating')}</Text>
                <View className="items-center justify-center px-5">
                  <MultiSlider
                    values={[ratingValue]}
                    min={0}
                    max={5}
                    step={0.5}
                    sliderLength={sliderWidth}
                    onValuesChangeStart={beginSliderInteraction}
                    onValuesChange={(values) => setRatingValue(values[0])}
                    onValuesChangeFinish={(values) => {
                      setRatingValue(values[0]);
                      endSliderInteraction();
                    }}
                    selectedStyle={{ backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' }}
                    unselectedStyle={{ backgroundColor: colorScheme === 'dark' ? '#474646' : '#d4d4d3' }}
                    containerStyle={{ alignItems: 'center', marginTop: 16 }}
                    trackStyle={{ height: 4, borderRadius: 2 }}
                    markerStyle={{
                      height: 22,
                      width: 22,
                      backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                      borderWidth: 0,
                    }}
                    pressedMarkerStyle={{
                      height: 22,
                      width: 22,
                      backgroundColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                    }}
                  />
                </View>
                <View className="flex-row items-center w-full justify-center mt-2">
                  <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 1.3 }] }} />
                  <Text className="ml-2 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]">{formatRatingValue(ratingValue)}</Text>
                </View>
              </View>

              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_business_profile')}</Text>
                  <TouchableOpacity
                    onPress={() => setBusinessProfileOnly(!businessProfileOnly)}
                    activeOpacity={0.8}
                    className="ml-4"
                  >
                    <View
                      className="h-[24px] w-[24px] border-[1px] justify-center items-center"
                      style={{
                        borderColor: businessProfileOnly ? colorScheme === 'dark' ? '#fcfcfc' : '#323131' : colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                        backgroundColor: businessProfileOnly ? colorScheme === 'dark' ? '#fcfcfc' : '#323131' : '',
                        borderRadius: 4,
                        marginRight: 23
                      }}
                    >
                      {businessProfileOnly && <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />}
                    </View>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_verified_profile')}</Text>
                  <TouchableOpacity
                    onPress={() => setVerifiedProfileOnly(!verifiedProfileOnly)}
                    activeOpacity={0.8}
                    className="ml-4"
                  >
                    <View
                      className="h-[24px] w-[24px] border-[1px] justify-center items-center"
                      style={{
                        borderColor: verifiedProfileOnly ? colorScheme === 'dark' ? '#fcfcfc' : '#323131' : colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                        backgroundColor: verifiedProfileOnly ? colorScheme === 'dark' ? '#fcfcfc' : '#323131' : '',
                        borderRadius: 4,
                        marginRight: 23
                      }}
                    >
                      {verifiedProfileOnly && <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {availableCategories.length > 0 && (
                <View className="mb-8">
                  <Text className="font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('filters_categories')}</Text>
                  <View className="flex-row flex-wrap mt-6">
                    {availableCategories.map((category) => {
                      const id = Number(category.service_category_id);
                      const isSelected = selectedCategories.includes(id);
                      return (
                        <TouchableOpacity
                          key={category.service_category_id}
                          onPress={() => toggleCategory(id)}
                          className={`mr-2 mb-2 px-4 py-2 rounded-full ${isSelected ? 'bg-[#444343] dark:bg-[#f2f2f2]' : 'bg-[#E0E0E0] dark:bg-[#3D3D3D]'}`}
                        >
                          <Text className={`font-inter-medium text-[12px] ${isSelected ? 'text-[#f2f2f2] dark:text-[#272626]' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>
                            {category.service_category_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}


            </View>

          </BottomSheetScrollView>
        
      </BottomSheetModal>

      {/* Contenedor del botón "Order by" */}

      <View style={{ zIndex: 10 }} className="flex-row p-5 justify-between items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <Text className="mb-1 font-inter-bold text-center text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('order_by')}</Text>

        {/* Botón desplegable */}
        <TouchableOpacity
          onPress={() => setIsDropdownOpen(!isDropdownOpen)} // Cambia el estado del dropdown
          className="py-3 bg-[#e0e0e0] dark:bg-[#3d3d3d] rounded-3xl"
        >
          <View className="flex-row px-4 justify-center items-center">
            <Text className="mr-1 font-inter-medium text-center text-[12px] text-[#444343] dark:text-[#f2f2f2]">
              {orderByOptions.find(option => option.type === selectedOrderBy)?.label || t('select_option')}
            </Text>
            {isDropdownOpen ? (
              <ChevronUpIcon size={15} strokeWidth={1.8} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
            ) : (
              <ChevronDownIcon size={15} strokeWidth={1.8} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
            )}
          </View>

          {/* Opciones desplegables */}
          {isDropdownOpen && (
            <View
              style={{
                position: 'absolute',
                top: 50, // Ajusta la posición verticalmente
                left: 0,
                right: 0,
                zIndex: 9999, // Asegura que esté por encima de otros elementos
                elevation: 5, // Para dispositivos Android
                backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#e0e0e0',
                borderRadius: 15,
                shadowColor: "#000", // Sombras para iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 3.84,
                overflow: 'hidden',
              }}
            >
              <ScrollView className="max-h-[200px] rounded-2xl pb-1">
                {orderByOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedOrderBy(option.type);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3  rounded-2xl ${selectedOrderBy === option.type ? 'bg-[#d4d3d3] dark:bg-[#474646]' : 'bg-[#e0e0e0] dark:bg-[#3d3d3d]'}`}
                  >
                    {index > 0 && (<View className="mx-1 border-t-[1px] border-[#b6b5b5] dark:border-[#706f6e]" />)}
                    <Text className={`py-2 text-center font-inter-medium text-[12px] ${selectedOrderBy === option.type ? 'text-white' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!hasLoadedRef.current && results === undefined ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
        </View>
      ) : (!results || results?.notFound || (Array.isArray(results) && results.length === 0)) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <SuitcaseFill height={60} width={60} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
          <Text className="mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]">
            {t('services_not_found')}
          </Text>
          <Text className="font-inter-medium text-center text-[15px] text-[#706F6E] dark:text-[#B6B5B5] pt-4 w-[250px]">
            {t('try_later')}
          </Text>
        </View>
      ) : (
        <View style={{ zIndex: 1 }}>
          <FlatList
            data={Array.isArray(results) ? results : []}
            keyExtractor={(item, index) => (item?.service_id ? `${item.service_id}` : `${index}`)}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: 'space-between',
              paddingBottom: 200,
              zIndex: 1,
            }}
          />
        </View>
      )}

    </View>
  );
}