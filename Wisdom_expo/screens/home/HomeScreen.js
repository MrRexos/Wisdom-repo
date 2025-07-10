
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, ImageBackground, Button, TouchableWithoutFeedback, RefreshControl } from 'react-native';
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
import { format } from 'date-fns';


export default function HomeScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedCategoryID, setSelectedCategoryID] = useState(null);
  const [suggestedProfessionals, setSuggestedProfessionals] = useState({});

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

      if (route.params && route.params.blurVisible !== undefined) {
        setSearchOptionsVisible(route.params.blurVisible);
        loadSearchedDirection();
        loadSearchedService();

      } else {
        setSearchOptionsVisible(false);
      }
    }, [route.params])
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

  suggestions = [
    {
      label: 'All',
      categoryID: null,
    },
    {
      label: 'Home Cleaner',
      categoryID: 1,
    },
    {
      label: 'AI Developer',
      categoryID: 89,
    },
    {
      label: 'Plumber',
      categoryID: 2,
    },
    {
      label: 'Personal Trainer',
      categoryID: 31,
    },
    {
      label: 'Auditor',
      categoryID: 225,
    },
    {
      label: '3D Designer',
      categoryID: 100,
    },
    {
      label: 'Wedding Planner',
      categoryID: 172,
    },
    {
      label: 'Web Developer',
      categoryID: 84,
    },
    {
      label: 'Graphic Designer',
      categoryID: 330,
    },
    {
      label: 'In-home Pet Care Provider',
      categoryID: 320,
    },

  ]

  //AÑADIR MAS EN EL FUTURO
  const serviceFamilies = [
    {
      family: "For You",
      categories: [
        { id: 2, category: "Plumbing", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174847.png" },
        { id: 89, category: "AI development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20201215.png" },
        { id: 1, category: "Home cleaning", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174733.png" },
        { id: 31, category: "Personal trainers", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175621.png" },
        { id: 317, category: "Dog walkers", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 318, category: "Pet care at home", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190446.png" },
        { id: 5, category: "Masonry", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 83, category: "Mobile app development", url: "https://storage.googleapis.com/wisdom-images/451067aa-4bd3-43d8-874d-ff8b5e50ce7e.jpeg" },
        { id: 84, category: "Web development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181853.png" },
        { id: 151, category: "Architects", url: "https://storage.googleapis.com/wisdom-images/526bda5b-c0c2-4170-b552-12a17db69fa9.jpeg" },
        { id: 8, category: "Painting and decoration", url: "https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" }
      ]
    },
    {
      family: "Suggested professionals:",
      categories: [

      ]
    },
    {
      family: "Home and Maintenance",
      description: "Services to maintain and improve your home, including plumbing, electrical work, cleaning, and repairs.",
      categories: [
        { id: 1, category: "Home cleaning", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174733.png" },
        { id: 2, category: "Plumbing", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174847.png" },
        { id: 3, category: "Electrical work", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175034.png" },
        { id: 5, category: "Masonry", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 6, category: "Gardening", url: "https://storage.googleapis.com/wisdom-images/4a4881ba-a06f-4bb1-be9d-016d2b49eae4.jpeg" },
        { id: 8, category: "Painting and decoration", url: "https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" }
      ]
    },
    {
      family: "Health and Wellbeing",
      description: "Health and wellness services including personal trainers, nutritionists, and various types of therapy.",
      categories: [
        { id: 31, category: "Personal trainers", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175621.png" },
        { id: 32, category: "Nutritionists", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175812.png" },
        { id: 34, category: "Psychology", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180032.png" },
        { id: 35, category: "Yoga", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180113.png" },
        { id: 36, category: "Guided meditation", url: "https://storage.googleapis.com/wisdom-images/53a50b05-32d7-4e90-86ce-62702bc97d65.jpeg" },
        { id: 37, category: "Therapeutic massages", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180612.png" },
        { id: 54, category: "Couples therapy", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180656.png" }
      ]
    },
    {
      family: "Education and Training",
      description: "Educational and training services such as private tutoring, language classes, and exam preparation.",
      categories: [
        { id: 56, category: "Private tutors", url: "https://storage.googleapis.com/wisdom-images/77502ab75202d6b38aa0df57113b6746.jpg" },
        { id: 57, category: "Math classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180933.png" },
        { id: 58, category: "Language classes", url: "https://storage.googleapis.com/wisdom-images/6f1a64adbbe28f7d572a9fef189ea542.jpg" },
        { id: 59, category: "Science classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181138.png" },
        { id: 68, category: "Job interview preparation", url: "https://storage.googleapis.com/wisdom-images/36548671ef1476a260d9e3dbb8fe4706.jpg" },
        { id: 65, category: "Music classe", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181310.png" },
        { id: 61, category: "Programming classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181628.png" }
      ]
    },
    {
      family: "Digital and Online",
      description: "Digital and online services such as web development, graphic design, and content creation.",
      categories: [
        { id: 83, category: "Mobile app development", url: "https://storage.googleapis.com/wisdom-images/451067aa-4bd3-43d8-874d-ff8b5e50ce7e.jpeg" },
        { id: 84, category: "Web development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181853.png" },
        { id: 89, category: "AI development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20201215.png" },
        { id: 85, category: "Frontend development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182501.png" },
        { id: 86, category: "Backend development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182034.png" },
        { id: 90, category: "Graphic design", url: "https://storage.googleapis.com/wisdom-images/a2b2c958-2d21-4308-8b07-51a1820f6faa.jpeg" },
        { id: 94, category: "Video editing", url: "https://storage.googleapis.com/wisdom-images/ad3a9403cb4273ff3bfb2ab24429bb62.jpg" },
        { id: 100, category: "3D design", url: "https://storage.googleapis.com/wisdom-images/4475f6e7e9766c27834ae79e308907db2d4fe361f741e26a2e9357b0a6c63082_1920x1080.webp" },
        { id: 101, category: "Social media content creation", url: "https://storage.googleapis.com/wisdom-images/contentcretor.png" },
      ]
    },
    {
      family: "Construction and Renovations",
      description: "Construction and renovation services including architecture, painting, and general contracting.",
      categories: [
        { id: 151, category: "Architects", url: "https://storage.googleapis.com/wisdom-images/526bda5b-c0c2-4170-b552-12a17db69fa9.jpeg" },
        { id: 152, category: "Masons", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 170, category: "Building rehabilitation", url: "https://storage.googleapis.com/wisdom-images/5964b65c-a2f6-4638-9024-6b38b2e0f42a.jpeg" }
      ]
    },
    {
      family: "Events and Entertainment",
      description: "Services for events and entertainment, including catering, photography, and event planning.",
      categories: [
        { id: 172, category: "Wedding planners", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184608.png" },
        { id: 173, category: "Event Catering", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184635.png" },
        { id: 174, category: "Event photography", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184808.png" },
        { id: 175, category: "Party DJs", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184853.png" },
        { id: 178, category: "Children's entertainers", url: "https://storage.googleapis.com/wisdom-images/1.webp" },
        { id: 181, category: "Event security", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185110.png" }
      ]
    },
    {
      family: "Finance and Administration",
      description: "Finance and administration services including tax advice, payroll management, and financial consulting.",
      categories: [
        { id: 225, category: "Auditing", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185810.png" },
        { id: 240, category: "Investment advice", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185958.png" },
        { id: 229, category: "Budget planning", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 224, category: "Financial consulting", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185443.png" }
      ]
    },
    {
      family: "Personal and Pet Care",
      description: "Services related to personal care and pet care, including dog walking and pet grooming.",
      categories: [
        { id: 317, category: "Dog walkers", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 318, category: "Pet care at home", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190446.png" },
        { id: 319, category: "Dog trainers", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190602.png" },
        { id: 320, category: "Home veterinarians", url: "https://storage.googleapis.com/wisdom-images/9974f022598c393f68479bcb39efd4e5.jpg" },
        { id: 321, category: "Pet grooming", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190349.png" },
      ]
    },
  ];

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
            <TouchableOpacity onPress={() => navigation.navigate('CreateService1')} className="py-2 px-5 justify-center items-center bg-[#444343] dark:bg-[#f2f2f2] rounded-lg" >
              <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">{t('create')}</Text>
            </TouchableOpacity>
          </View>
        </View>

      ) : (

        <View className="p-3 mr-4 justify-start items-center">
          <TouchableOpacity onPress={() => removeProfessional(item.service_id)} className="w-full justify-start items-end">
            <XMarkIcon height={19} color={iconColor} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile', { serviceId: item.service_id })} className="justify-center items-center">
            <Image source={{ uri: item.profile_picture }} className="mb-4 w-[90px] h-[90px] rounded-full bg-slate-500" />
            <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
            <Text className="mb-3 font-inter-medium text-[10px] text-[#706F6E] dark:text-[#b6b5b5]">{item.first_name} {item.surname}</Text>
          </TouchableOpacity>
          <View className="justify-center items-center">
            <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile', { serviceId: item.service_id })} className="py-2 px-5 justify-center items-center bg-[#444343] dark:bg-[#f2f2f2] rounded-lg" >
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
                keyExtractor={(category) => category.service_id.toString()}
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

  const formatDuration = () => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} h ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${minutes} min`;
    }
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

  const loadSearchedDirection = async () => {

    const searchedDirectionRaw = await getDataLocally('searchedDirection');
    console.log(searchedDirectionRaw)
    if (searchedDirectionRaw) {
      searchedDirectionData = JSON.parse(searchedDirectionRaw);
      setSearchedDirection(searchedDirectionData)
    }
  };

  const loadSearchedService = async () => {

    const searchedServiceRaw = await getDataLocally('searchedService');
    if (searchedServiceRaw) {
      searchedServiceData = JSON.parse(searchedServiceRaw);
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

  const formatDate = () => {
    let formattedDay = '';
    let formattedTime = '';
    let formattedDuration = '';

    // 1. Formatear el día si `selectedDay` está presente
    if (selectedDay) {
      const [year, month, day] = selectedDay.split('-'); // Dividir la fecha "YYYY-MM-DD"
      if (year && month && day) {
        const tempDate = new Date(year, month - 1, day);
        formattedDay = tempDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }); // Ej: "Friday 25 Oct"
      }
    }

    // 2. Usar `selectedTime` directamente si está presente
    if (selectedTime) {
      formattedTime = selectedTime; // Ya está en formato "HH:MM"
    }

    // 3. Calcular la duración si `duration` está presente
    if (duration) {
      const hoursDuration = Math.floor(duration / 60);
      const minutesDuration = duration % 60;
      formattedDuration = `${hoursDuration > 0 ? `${hoursDuration}h` : ''} ${minutesDuration > 0 ? `${minutesDuration}min` : ''}`.trim();
    }

    // Usar un array para los valores disponibles y unir con comas
    const parts = [];
    if (formattedDay) parts.push(formattedDay);
    if (formattedTime) parts.push(formattedTime);
    if (formattedDuration) parts.push(formattedDuration);

    // Unir las partes con comas y devolver el resultado
    return parts.length > 0 ? parts.join(', ') : 'No hay información disponible';
  };

  const getValue = (arr) => {
    const key = Object.keys(arr[0])[0];
    return arr[0][key]
  };





  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />


      {isSearchOptionsVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 flex-1 z-10">

          <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.1)' }}>

            <TouchableWithoutFeedback onPress={() => setSearchOptionsVisible(false)}>
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
                      <TouchableOpacity onPress={() => { setSearchOptionsVisible(false); setSearchDateOptionSelected('frequency'); setSearchOption('service') }}>
                        <ChevronLeftIcon size={24} strokeWidth={1.8} color={iconColor} />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-1 justify-center items-center ">
                      <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('search')}</Text>
                    </View>

                    <View className="flex-1"></View>
                  </View>

                  {searchOption === 'service' ? (

                    <TouchableOpacity onPress={() => { navigation.navigate('SearchService', { blurVisible: true, prevScreen: 'HomeScreen' }); setSearchOptionsVisible(false); }} className="mt-8 mb-7 w-full justify-center items-center ">
                      <View className="py-[20px] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#f2f2f2] dark:bg-[#3D3D3D]">
                        <Search height={19} color={iconColor} strokeWidth={2} />
                        <Text className="ml-2 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{searchedService ? getValue(searchedService) : t('search_a_service')}</Text>
                      </View>
                    </TouchableOpacity>

                  ) : (

                    <TouchableOpacity onPress={() => setSearchOption('service')} className="mt-8 mb-7 w-full justify-center items-center">
                      <Text className="ml-2 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
                        Service
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

                      <TouchableOpacity onPress={() => { setSearchOptionsVisible(false); navigation.navigate('SearchDirection', { blurVisible: true, prevScreen: 'HomeScreen' }) }} className="mt-8 mb-6 w-full justify-center items-center ">
                        <View className="py-[20px] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#f2f2f2] dark:bg-[#3D3D3D]">
                          <Search height={19} color={iconColor} strokeWidth={2} />
                          <Text className="ml-2 font-inter-medium text-[14px] text-[#444343] dark:text-[#f2f2f2]">{searchedDirection ? searchedDirection.address_1 : t('search_a_location')}</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity className="mb-6 px-4 py-2 rounded-full bg-[#e0e0e0] dark:bg-[#3D3D3D]">
                        <Text className=" font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{t('unlocated')}</Text>
                      </TouchableOpacity>

                    </View>

                  ) : (

                    <TouchableOpacity onPress={() => setSearchOption('direction')} className="mt-7 mb-7 w-full justify-center items-center">
                      <Text className="ml-2 font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">
                        {t('location')}
                        {searchedDirection && (
                          <>
                            <Text className="font-inter-semibold text-[14px] text-[#706F6E] dark:text-[#b6b5b5]">: </Text>
                            <Text className="font-inter-bold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{searchedDirection.address_1}</Text>
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

                      <View className="flex-row space-x-2">

                        <TouchableOpacity onPress={() => setSearchDateOptionSelected('frequency')} className={`px-4 py-[11] rounded-full ${searchDateOptionSelected === 'frequency' ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#f2f2f2] dark:bg-[#3d3d3d]'}`}>
                          <Text className={`font-inter-semibold text-[12px] ${searchDateOptionSelected === 'frequency' ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>Frequency</Text>
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
                          <Text className={`font-inter-semibold text-[12px] ${searchDateOptionSelected === 'duration' ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>Duration</Text>
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
                          <Text className={`font-inter-semibold text-[12px] ${searchDateOptionSelected === 'start' ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>Start</Text>
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

                          <View className="mt-2 w-full px-6 ">
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
                        Date
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

                        Search

                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}


            </View>



          </View>

        </View>
      )}

      <TouchableOpacity onPress={() => { removeSearchedDirection(); removeSearchedService(); setSearchedDirection(); setSearchedService(); setSearchOptionsVisible(true); toggleTabs(); setDuration(); setSelectedDay(), setSelectedTime() }} className="justify-center items-center pt-8 px-10">
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