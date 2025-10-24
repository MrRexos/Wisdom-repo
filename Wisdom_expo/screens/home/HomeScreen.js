
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, ImageBackground, Button, TouchableWithoutFeedback, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { Search } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import api from '../../utils/api.js';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';


const DATE_LOCALE_MAP = {
  en: 'en-GB',
  es: 'es-ES',
  ca: 'ca-ES',
  ar: 'ar',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

export default function HomeScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedCategoryID, setSelectedCategoryID] = useState(null);
  const [suggestedProfessionals, setSuggestedProfessionals] = useState([]);

  const [isSearchOptionsVisible, setSearchOptionsVisible] = useState(false);

  const [searchOption, setSearchOption] = useState('service');
  const [searchDateOptionSelected, setSearchDateOptionSelected] = useState('frequency');
  const route = useRoute();
  const isFocused = useIsFocused();

  const [selectedDate, setSelectedDate] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState();
  const [duration, setDuration] = useState();
  const [sliderValue, setSliderValue] = useState();
  const sliderTimeoutId = useRef(null);
  const [showTab, setShowTab] = useState(true);

  const [searchedDirection, setSearchedDirection] = useState();
  const [searchedService, setSearchedService] = useState();
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

  const fetchProfessionals = async () => {
    try {
      const response = await api.get(`/api/suggested_professional`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const loadProfessionals = async () => {
    const professionals = await fetchProfessionals();
    if (Array.isArray(professionals)) {
      setSuggestedProfessionals([{ service_id: 0 }, ...professionals]);
    }
  };

  const toggleTabs = () => {
    setShowTab(false); // Solo cambia el estado local
  };

  useEffect(() => {
    navigation.setParams({ showTab });
  }, [showTab]);

  useFocusEffect(
    useCallback(() => {
      const blurVisible = route.params?.blurVisible;
      if (blurVisible === true) {
        setSearchOptionsVisible(true);
        if (route.params?.selectedDirection) {
          setSearchedDirection(route.params.selectedDirection);
        } else {
          loadSearchedDirection();
        }
        if (route.params?.selectedService) {
          setSearchedService([route.params.selectedService]);
        } else {
          loadSearchedService();
        }
      } else {
        setSearchOptionsVisible(false);
      }
    }, [route.params?.blurVisible, route.params?.selectedService, route.params?.selectedDirection])
  );


  useEffect(() => {
    loadProfessionals();
  }, []);

  useRefreshOnFocus(loadProfessionals);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfessionals();
    setRefreshing(false);
  };

  const removeProfessional = (id) => {
    setSuggestedProfessionals((prevProfessionals) =>
      prevProfessionals.filter(professional => professional.service_id !== id)
    );
  };

  const suggestions = useMemo(() => ([
    {
      label: t('all'),
      categoryID: null,
    },
    {
      label: t('home_category_home_cleaning'),
      categoryID: 1,
    },
    {
      label: t('home_category_ai_development'),
      categoryID: 89,
    },
    {
      label: t('home_category_plumbing'),
      categoryID: 2,
    },
    {
      label: t('home_category_personal_training'),
      categoryID: 31,
    },
    {
      label: t('home_category_auditing'),
      categoryID: 225,
    },
    {
      label: t('home_category_3d_design'),
      categoryID: 100,
    },
    {
      label: t('home_category_wedding_planning'),
      categoryID: 172,
    },
    {
      label: t('home_category_web_development'),
      categoryID: 84,
    },
    {
      label: t('home_category_graphic_design'),
      categoryID: 330,
    },
    {
      label: t('home_category_in_home_pet_care_provider'),
      categoryID: 320,
    },

  ]), [t]);

  //AÑADIR MAS EN EL FUTURO
  const serviceFamilies = useMemo(() => ([
    {
      family: t('home_family_for_you'),
      categories: [
        { id: 2, category: t('home_category_plumbing'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174847.png" },
        { id: 89, category: t('home_category_ai_development'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20201215.png" },
        { id: 1, category: t('home_category_home_cleaning'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174733.png" },
        { id: 31, category: t('home_category_personal_training'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175621.png" },
        { id: 317, category: t('home_category_dog_walkers'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 318, category: t('home_category_pet_care_at_home'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190446.png" },
        { id: 5, category: t('home_category_masonry'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 83, category: t('home_category_mobile_app_development'), url: "https://storage.googleapis.com/wisdom-images/451067aa-4bd3-43d8-874d-ff8b5e50ce7e.jpeg" },
        { id: 84, category: t('home_category_web_development'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181853.png" },
        { id: 151, category: t('home_category_architects'), url: "https://storage.googleapis.com/wisdom-images/526bda5b-c0c2-4170-b552-12a17db69fa9.jpeg" },
        { id: 8, category: t('home_category_painting_and_decoration'), url: "https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" }
      ]
    },
    {
      family: t('home_family_suggested_professionals'),
      categories: [

      ]
    },
    {
      family: t('home_family_home_and_maintenance'),
      description: t('home_family_home_and_maintenance_description'),
      categories: [
        { id: 1, category: t('home_category_home_cleaning'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174733.png" },
        { id: 2, category: t('home_category_plumbing'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174847.png" },
        { id: 3, category: t('home_category_electrical_work'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175034.png" },
        { id: 5, category: t('home_category_masonry'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 6, category: t('home_category_gardening'), url: "https://storage.googleapis.com/wisdom-images/4a4881ba-a06f-4bb1-be9d-016d2b49eae4.jpeg" },
        { id: 8, category: t('home_category_painting_and_decoration'), url: "https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" }
      ]
    },
    {
      family: t('home_family_health_and_wellbeing'),
      description: t('home_family_health_and_wellbeing_description'),
      categories: [
        { id: 31, category: t('home_category_personal_training'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175621.png" },
        { id: 32, category: t('home_category_nutritionists'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175812.png" },
        { id: 34, category: t('home_category_psychology'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180032.png" },
        { id: 35, category: t('home_category_yoga'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180113.png" },
        { id: 36, category: t('home_category_guided_meditation'), url: "https://storage.googleapis.com/wisdom-images/53a50b05-32d7-4e90-86ce-62702bc97d65.jpeg" },
        { id: 37, category: t('home_category_therapeutic_massages'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180612.png" },
        { id: 54, category: t('home_category_couples_therapy'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180656.png" }
      ]
    },
    {
      family: t('home_family_education_and_training'),
      description: t('home_family_education_and_training_description'),
      categories: [
        { id: 56, category: t('home_category_private_tutors'), url: "https://storage.googleapis.com/wisdom-images/77502ab75202d6b38aa0df57113b6746.jpg" },
        { id: 57, category: t('home_category_math_classes'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180933.png" },
        { id: 58, category: t('home_category_language_classes'), url: "https://storage.googleapis.com/wisdom-images/6f1a64adbbe28f7d572a9fef189ea542.jpg" },
        { id: 59, category: t('home_category_science_classes'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181138.png" },
        { id: 68, category: t('home_category_job_interview_preparation'), url: "https://storage.googleapis.com/wisdom-images/36548671ef1476a260d9e3dbb8fe4706.jpg" },
        { id: 65, category: t('home_category_music_classes'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181310.png" },
        { id: 61, category: t('home_category_programming_classes'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181628.png" }
      ]
    },
    {
      family: t('home_family_digital_and_online'),
      description: t('home_family_digital_and_online_description'),
      categories: [
        { id: 83, category: t('home_category_mobile_app_development'), url: "https://storage.googleapis.com/wisdom-images/451067aa-4bd3-43d8-874d-ff8b5e50ce7e.jpeg" },
        { id: 84, category: t('home_category_web_development'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181853.png" },
        { id: 89, category: t('home_category_ai_development'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20201215.png" },
        { id: 85, category: t('home_category_frontend_development'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182501.png" },
        { id: 86, category: t('home_category_backend_development'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182034.png" },
        { id: 90, category: t('home_category_graphic_design'), url: "https://storage.googleapis.com/wisdom-images/a2b2c958-2d21-4308-8b07-51a1820f6faa.jpeg" },
        { id: 94, category: t('home_category_video_editing'), url: "https://storage.googleapis.com/wisdom-images/ad3a9403cb4273ff3bfb2ab24429bb62.jpg" },
        { id: 100, category: t('home_category_3d_design'), url: "https://storage.googleapis.com/wisdom-images/4475f6e7e9766c27834ae79e308907db2d4fe361f741e26a2e9357b0a6c63082_1920x1080.webp" },
        { id: 101, category: t('home_category_social_media_content_creation'), url: "https://storage.googleapis.com/wisdom-images/contentcretor.png" },
      ]
    },
    {
      family: t('home_family_construction_and_renovations'),
      description: t('home_family_construction_and_renovations_description'),
      categories: [
        { id: 151, category: t('home_category_architects'), url: "https://storage.googleapis.com/wisdom-images/526bda5b-c0c2-4170-b552-12a17db69fa9.jpeg" },
        { id: 152, category: t('home_category_masons'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 170, category: t('home_category_building_rehabilitation'), url: "https://storage.googleapis.com/wisdom-images/5964b65c-a2f6-4638-9024-6b38b2e0f42a.jpeg" }
      ]
    },
    {
      family: t('home_family_events_and_entertainment'),
      description: t('home_family_events_and_entertainment_description'),
      categories: [
        { id: 172, category: t('home_category_wedding_planners'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184608.png" },
        { id: 173, category: t('home_category_event_catering'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184635.png" },
        { id: 174, category: t('home_category_event_photography'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184808.png" },
        { id: 175, category: t('home_category_party_djs'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184853.png" },
        { id: 178, category: t('home_category_childrens_entertainers'), url: "https://storage.googleapis.com/wisdom-images/1.webp" },
        { id: 181, category: t('home_category_event_security'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185110.png" }
      ]
    },
    {
      family: t('home_family_finance_and_administration'),
      description: t('home_family_finance_and_administration_description'),
      categories: [
        { id: 225, category: t('home_category_auditing'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185810.png" },
        { id: 240, category: t('home_category_investment_advice'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185958.png" },
        { id: 229, category: t('home_category_budget_planning'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 224, category: t('home_category_financial_consulting'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185443.png" }
      ]
    },
    {
      family: t('home_family_personal_and_pet_care'),
      description: t('home_family_personal_and_pet_care_description'),
      categories: [
        { id: 317, category: t('home_category_dog_walkers'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 318, category: t('home_category_pet_care_at_home'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190446.png" },
        { id: 319, category: t('home_category_dog_trainers'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190602.png" },
        { id: 320, category: t('home_category_home_veterinarians'), url: "https://storage.googleapis.com/wisdom-images/9974f022598c393f68479bcb39efd4e5.jpg" },
        { id: 321, category: t('home_category_pet_grooming'), url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190349.png" },
      ]
    },
  ]), [t]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Results', { category: item.id, category_name: item.category })}>
      <ImageBackground
        source={{ uri: item.url }}
        className="mr-2 w-[270px] h-[145px] p-4 flex-row justify-between items-end "
        imageStyle={{ borderRadius: 12, opacity: colorScheme === 'dark' ? 0.6 : 0.8 }}
      >
        <Text className="ml-2 font-inter-semibold text-[18px] text-[#ffffff] dark:text-[#e0e0e0]" style={{ textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4, }}>{item.category}</Text>
        <Text className="ml-2 font-inter-semibold text-[18px] text-[#ffffff] dark:text-[#e0e0e0]">→</Text>
      </ImageBackground>

    </TouchableOpacity>
  );

  const renderProfile = ({ item, index }) => (

    <View>

      {index === 0 ? (

        <View className="p-3 mr-4 justify-start items-center rounded-2xl bg-[#d4d4d3] dark:bg-[#474646]">
          <View className="w-full justify-start items-end">
            <View className="h-[19px]" />
          </View>
          <Image source={require('../../assets/defaultProfilePic.jpg')} className="mb-4 w-[90px] h-[90px] rounded-full bg-slate-500" />
          <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{t('become_a_professional')}</Text>
          <Text className="mb-3 font-inter-medium text-[10px] text-[#706F6E] dark:text-[#b6b5b5]">{t('make_money_serving')}</Text>
          <View className="justify-center items-center">
            <TouchableOpacity onPress={() => navigation.navigate('CreateServiceStart')} className="py-2 px-5 justify-center items-center bg-[#444343] dark:bg-[#f2f2f2] rounded-lg" >
              <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">{t('create')}</Text>
            </TouchableOpacity>
          </View>
        </View>

      ) : (

        <View className="p-3 mr-4 justify-start items-center">
          <TouchableOpacity onPress={() => removeProfessional(item.best_service_id)} className="w-full justify-start items-end">
            <XMarkIcon height={19} color={iconColor} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile', { serviceId: item.best_service_id })} className="justify-center items-center">
            <Image source={{ uri: item.profile_picture }} className="mb-4 w-[90px] h-[90px] rounded-full bg-slate-500" />
            <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.best_service_title}</Text>
            <Text className="mb-3 font-inter-medium text-[10px] text-[#706F6E] dark:text-[#b6b5b5]">{item.first_name} {item.surname}</Text>
          </TouchableOpacity>
          <View className="justify-center items-center">
            <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile', { serviceId: item.best_dservice_id })} className="py-2 px-5 justify-center items-center bg-[#444343] dark:bg-[#f2f2f2] rounded-lg" >
              <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">{t('visit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

      )}

    </View>
  );

  const renderFamily = ({ item, index }) => (

    <View>

      {index === 1 ? (

        <View>
          {Array.isArray(suggestedProfessionals) && suggestedProfessionals.length > 0 && (
            <View className="mb-6">
              <Text className="ml-5 mb-3 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{item.family}</Text>
              <FlatList
                data={suggestedProfessionals}
                className="px-5"
                horizontal
                renderItem={renderProfile}
                keyExtractor={(category, idx) => String(category?.service_id ?? idx)}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>

      ) : (

        <View className="mb-10">
          <Text className="ml-5 mb-3 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{item.family}</Text>
          <FlatList
            className="px-5"
            data={item.categories}
            horizontal
            renderItem={renderCategory}
            keyExtractor={(category) => category.id.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>

  );

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

  const formatDuration = useCallback(() => {
    const total = Math.max(0, Math.round(Number(duration) || 0));
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    if (hours > 0 && minutes > 0) {
      return t('duration_hours_minutes', { hours, minutes });
    }
    if (hours > 0) {
      return t('duration_hours', { hours });
    }
    return t('duration_minutes', { minutes });
  }, [duration, t]);

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

  const loadSearchedDirection = async () => {

    const searchedDirectionRaw = await getDataLocally('searchedDirection');
    console.log(searchedDirectionRaw)
    if (searchedDirectionRaw) {
      const searchedDirectionData = JSON.parse(searchedDirectionRaw);
      setSearchedDirection(searchedDirectionData)
    }
  };

  const loadSearchedService = async () => {

    const searchedServiceRaw = await getDataLocally('searchedService');
    if (searchedServiceRaw) {
      const searchedServiceData = JSON.parse(searchedServiceRaw);
      setSearchedService([searchedServiceData])
    }
  };

  const removeSearchedDirection = async () => {

    try {
      await AsyncStorage.removeItem('searchedDirection');
    } catch (error) {
      console.error('Error al eliminar searchedDirection:', error);
    }
  };

  const removeSearchedService = async () => {

    try {
      await AsyncStorage.removeItem('searchedService');
    } catch (error) {
      console.error('Error al eliminar searchedService:', error);
    }
  };

  const resetSearchParameters = async () => {
    setSearchOption('service');
    setSearchDateOptionSelected('frequency');
    setSelectedDate({});
    setSelectedDay(null);
    setTempDate(new Date());
    setSelectedTime(undefined);
    setDuration(undefined);
    setSliderValue(undefined);
    setShowPicker(false);
    setSearchedDirection(undefined);
    setSearchedService(undefined);
    try {
      await removeSearchedDirection();
      await removeSearchedService();
    } catch (e) {
      console.error('Error al reiniciar parámetros de búsqueda:', e);
    }
  };

  const closeSearchOverlay = async () => {
    setSearchOptionsVisible(false);
    await resetSearchParameters();
    navigation.setParams({ blurVisible: false, selectedDirection: undefined, selectedService: undefined });
  };

  const formatDate = () => {
    let formattedDay = '';
    let formattedTime = '';
    let formattedDuration = '';

    // 1. Formatear el día si `selectedDay` está presente
    if (selectedDay) {
      const [year, month, day] = selectedDay.split('-'); // Dividir la fecha "YYYY-MM-DD"
      if (year && month && day) {
        const tempDate = new Date(year, month - 1, day);
        const locale = DATE_LOCALE_MAP[i18n.language] || DATE_LOCALE_MAP.en;
        formattedDay = tempDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' }); // Ej: "Friday 25 Oct"
      }
    }

    // 2. Usar `selectedTime` directamente si está presente
    if (selectedTime) {
      formattedTime = selectedTime; // Ya está en formato "HH:MM"
    }

    // 3. Calcular la duración si `duration` está presente
    if (duration) {
      const total = Math.max(0, Math.round(Number(duration) || 0));
      const hoursDuration = Math.floor(total / 60);
      const minutesDuration = total % 60;
      if (hoursDuration > 0 && minutesDuration > 0) {
        formattedDuration = t('duration_hours_minutes', { hours: hoursDuration, minutes: minutesDuration });
      } else if (hoursDuration > 0) {
        formattedDuration = t('duration_hours', { hours: hoursDuration });
      } else {
        formattedDuration = t('duration_minutes', { minutes: minutesDuration });
      }
    }

    // Usar un array para los valores disponibles y unir con comas
    const parts = [];
    if (formattedDay) parts.push(formattedDay);
    if (formattedTime) parts.push(formattedTime);
    if (formattedDuration) parts.push(formattedDuration);

    // Unir las partes con comas y devolver el resultado
    return parts.length > 0 ? parts.join(', ') : t('home_no_information_available');
  };

  const getValue = (arr) => {
    const key = Object.keys(arr[0])[0];
    return arr[0][key]
  };





  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />


      {isSearchOptionsVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 flex-1 z-10">

          <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)' }}>

            <TouchableWithoutFeedback onPress={() => { closeSearchOverlay(); }}>
              <BlurView style={styles.blur} blurType="light" blurAmount={10} intensity={70} />
            </TouchableWithoutFeedback>

            <View className="flex-1 w-full justify-between items-center ">
              <View className="flex-1 w-full justify-start items-center ">

                {/* Service */}

                <View style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  shadowRadius: 15,
                  elevation: 5,
                }}
                  className="px-5 w-full justify-center items-center rounded-3xl bg-[#fcfcfc] dark:bg-[#323131]">

                  <View className="mt-[70px] flex-row justify-between items-center pb-4 ">
                    <View className="flex-1 ">
                      <TouchableOpacity onPress={() => { closeSearchOverlay(); }}>
                        <ChevronLeftIcon size={24} strokeWidth={1.8} color={iconColor} />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-1 justify-center items-center ">
                      <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('search')}</Text>
                    </View>

                    <View className="flex-1"></View>
                  </View>

                  {searchOption === 'service' ? (

                    <TouchableOpacity onPress={() => navigation.navigate('SearchService', { blurVisible: true, prevScreen: 'HomeScreen' })} className="mt-8 mb-7 w-full justify-center items-center ">
                      <View className="py-[20px] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#f2f2f2] dark:bg-[#3D3D3D]">
                        <Search height={19} color={iconColor} strokeWidth={2} />
                        <Text className="ml-2 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{searchedService ? getValue(searchedService) : t('search_a_service')}</Text>
                      </View>
                    </TouchableOpacity>

                  ) : (

                    <TouchableOpacity onPress={() => setSearchOption('service')} className="mt-8 mb-7 w-full justify-center items-center">
                      <Text className="ml-2 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
                        {t('service')}
                        {searchedService && (
                          <>
                            <Text className="font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">: </Text>
                            <Text className="font-inter-bold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{getValue(searchedService)}</Text>
                          </>
                        )}
                      </Text>
                    </TouchableOpacity>

                  )}




                </View>

                {/* Direction */}

                <View style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  shadowRadius: 15,
                  elevation: 5,
                }}
                  className="mt-2 px-5 w-full justify-center items-center rounded-3xl bg-[#fcfcfc] dark:bg-[#323131]">

                  {searchOption === 'direction' ? (

                    <View className="w-full justify-start items-center">

                      <TouchableOpacity onPress={() => navigation.navigate('SearchDirection', { blurVisible: true, prevScreen: 'HomeScreen' })} className="mt-8 mb-6 w-full justify-center items-center ">
                        <View className="py-[20px] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#f2f2f2] dark:bg-[#3D3D3D]">
                          <Search height={19} color={iconColor} strokeWidth={2} />
                          <Text numberOfLines={1} className="truncate flex-1 ml-2 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">
                            {searchedDirection
                              ? `${searchedDirection?.address_1 ?? ''}${searchedDirection?.street_number ? ' ' + searchedDirection.street_number : ''
                              }, ${searchedDirection?.city ?? ''}, ${searchedDirection?.state ?? ''}, ${searchedDirection?.country ?? ''}`
                              : t('search_a_location')}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity className="mb-6 px-4 py-2 rounded-full bg-[#e0e0e0] dark:bg-[#3D3D3D]">
                        <Text className=" font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{t('unlocated')}</Text>
                      </TouchableOpacity>

                    </View>

                  ) : (

                    <TouchableOpacity onPress={() => setSearchOption('direction')} className="mt-7 mb-7 w-full justify-center items-center">
                      <Text numberOfLines={1} className="truncate ml-2 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
                        {t('location')}
                        {searchedDirection && (
                          <>
                            <Text className="font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">: </Text>
                            <Text numberOfLines={1} className="truncate font-inter-bold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{searchedDirection.address_1}, {searchedDirection.street_number}, {searchedDirection.city}, {searchedDirection.state}, {searchedDirection.country}</Text>
                          </>
                        )}
                      </Text>
                    </TouchableOpacity>

                  )}

                </View>

                {/* Date */}

                <View style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  shadowRadius: 15,
                  elevation: 5,
                }}
                  className="mt-2 px-[20px] w-full justify-center items-center rounded-3xl bg-[#fcfcfc] dark:bg-[#323131]">

                  {searchOption === 'date' ? (

                    <View className="mt-7 mb-3 w-full justify-start items-center">

                      <View className="flex-row gap-x-2">

                        <TouchableOpacity onPress={() => setSearchDateOptionSelected('frequency')} className={`px-4 py-[11] rounded-full ${searchDateOptionSelected === 'frequency' ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#f2f2f2] dark:bg-[#3d3d3d]'}`}>
                          <Text className={`font-inter-semibold text-[12px] ${searchDateOptionSelected === 'frequency' ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>{t('frequency')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            if (!duration && !sliderValue) { // Verifica que ambos sean null, undefined o falsos
                              setDuration(60);
                              setSliderValue(12);
                            }
                            setSearchDateOptionSelected('duration');
                          }}
                          className={`px-4 py-[11] rounded-full ${searchDateOptionSelected === 'duration' ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#f2f2f2] dark:bg-[#3d3d3d]'}`}
                        >
                          <Text className={`font-inter-semibold text-[12px] ${searchDateOptionSelected === 'duration' ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>{t('duration')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                          if (!selectedTime) {
                            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            setSelectedTime(currentTime);
                          }
                          setSearchDateOptionSelected('start');
                          setShowPicker(true)
                        }}
                          className={`px-4 py-[11] rounded-full ${searchDateOptionSelected === 'start' ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#f2f2f2] dark:bg-[#3d3d3d]'}`}
                        >
                          <Text className={`font-inter-semibold text-[12px] ${searchDateOptionSelected === 'start' ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>{t('start')}</Text>
                        </TouchableOpacity>

                      </View>

                      <View className="w-full">

                        {searchDateOptionSelected === 'frequency' ? (

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


                        ) : searchDateOptionSelected === 'duration' ? (

                          <View className=" w-full mt-8 px-4 justify-center items-center">

                            <Text className="mb-4 font-inter-bold text-[24px] text-[#444343] dark:text-[#f2f2f2]">{formatDuration()}</Text>

                            <View className="w-full">
                              <Slider
                                style={{ width: '100%', height: 10 }}
                                minimumValue={1}
                                maximumValue={34}
                                step={1}
                                thumbImage={thumbImage}
                                minimumTrackTintColor="#b6b5b5"
                                maximumTrackTintColor="#474646"
                                value={sliderValue}
                                onValueChange={handleSliderChange}
                              />
                            </View>

                          </View>

                        ) : (

                          <View className="mt-2 w-full px-6 items-center justify-center ">
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

                        )}

                      </View>

                    </View>

                  ) : (

                    <TouchableOpacity onPress={() => setSearchOption('date')} className="mt-7 mb-7 w-full justify-center items-center">
                      <Text className="ml-2 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
                        {t('date')}
                        {(selectedDay || selectedTime || duration) && (
                          <>
                            <Text className="font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">: </Text>
                            <Text className="font-inter-bold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{selectedDay || selectedTime || duration ? formatDate() : ''}</Text>
                          </>
                        )}
                      </Text>
                    </TouchableOpacity>

                  )}

                </View>

              </View>

              {/* Button book */}
              {!(searchOption === 'date' && searchDateOptionSelected === 'frequency') && (
                <View className="flex-row justify-center items-center pb-5 px-6">

                  <TouchableOpacity
                    disabled={!searchedService}
                    onPress={() => { navigation.navigate('Results', { searchedService: searchedService, duration, selectedTime, selectedDay, searchedDirection }) }}
                    style={{ opacity: searchedService ? 1 : 0.3 }}
                    className="bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center"
                  >
                    <Text>
                      <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">

                        {t('search')}

                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}


            </View>



          </View>

        </View>
      )}

      <TouchableOpacity
        onPress={() => {
          setSearchOptionsVisible(true);
          toggleTabs();
        }}
        className="justify-center items-center pt-8 px-10"
      >
        <View className="h-[55px] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
          <Search height={19} color={iconColor} strokeWidth={2} />
          <Text className="ml-2 font-inter-medium text-[14px] text-[#979797]">{t('search_a_service')}</Text>
        </View>
      </TouchableOpacity>

      <View className="mt-5 pb-5 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
          {suggestions.map((item, index) => (
            <View key={index} className="pl-2">
              <TouchableOpacity
                className={`px-4 py-3 rounded-full ${selectedCategoryID === item.categoryID ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#e0e0e0] dark:bg-[#3d3d3d]'}`}
                onPress={() => { setSelectedCategoryID(item.categoryID); navigation.navigate('Results', { category: item.categoryID, category_name: item.label }) }}
              >
                <Text className={`font-inter-medium text-[14px] ${selectedCategoryID === item.categoryID ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1">

        <FlatList
          data={serviceFamilies}
          renderItem={renderFamily}
          keyExtractor={(family) => family.family}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          className="py-5"
        />

      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(151, 151, 151, 0.5)', // Blanco con poca opacidad
  },
  blur: {
    ...StyleSheet.absoluteFillObject, // Ocupa todo el fondo
  },
});