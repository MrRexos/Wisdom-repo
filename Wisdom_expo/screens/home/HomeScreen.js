
import React, { useEffect, useState, useCallback, useRef} from 'react'
import {View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, ImageBackground} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import i18n from '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon} from 'react-native-heroicons/outline';
import {Search} from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';



export default function HomeScreen() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [selectedCategoryID, setSelectedCategoryID] = useState(null);
  const [suggestedProfessionals, setSuggestedProfessionals] = useState(null);

  const fetchProfessionals = async () => {
    try {
      const response = await api.get(`/api/suggested_professional`);
      return response.data;        
    } catch (error) {
      console.error('Error fetching lists:', error);
    } 
  };

  useEffect(() => {
    const loadProfessionals = async () => {
      const professionals = await fetchProfessionals();
      setSuggestedProfessionals([{service_id:0}, ...professionals]);
    };
    loadProfessionals();
  }, []);

  const removeProfessional = (id) => {
    setSuggestedProfessionals((prevProfessionals) => 
      prevProfessionals.filter(professional => professional.service_id !== id)
    );
  };


  suggestions  = [
    {
      label: 'All',
      categoryID:null,
    },
    {
      label: 'Home Cleaner',
      categoryID:1,
    },
    {
      label: 'AI Developer',
      categoryID:89,
    },
    {
      label: 'Plumber',
      categoryID:2,
    },
    {
      label: 'Personal Trainer',
      categoryID:31,
    },
    {
      label: 'Auditor',
      categoryID:225,
    },
    {
      label: '3D Designer',
      categoryID:100,
    },
    {
      label: 'Wedding Planner',
      categoryID:172,
    },
    {
      label: 'Web Developer',
      categoryID:84,
    },
    {
      label: 'Graphic Designer',
      categoryID:330,
    },
    {
      label: 'In-home Pet Care Provider',
      categoryID:320,
    },

  ]

  //AÑADIR MAS EN EL FUTURO
  const serviceFamilies = [
    {
      family: "For You",
      categories: [
        { id: 2, category: "Plumbing", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174847.png" },
        { id: 89, category: "AI development", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20201215.png" },
        { id: 1, category: "Home cleaning", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174733.png" },
        { id: 31, category: "Personal trainers", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175621.png" },
        { id: 317, category: "Dog walkers", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 318, category: "Pet care at home", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190446.png" },
        { id: 5, category: "Masonry", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 83, category: "Mobile app development", url:"https://storage.googleapis.com/wisdom-images/451067aa-4bd3-43d8-874d-ff8b5e50ce7e.jpeg" },
        { id: 84, category: "Web development", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181853.png" },
        { id: 151, category: "Architects", url:"https://storage.googleapis.com/wisdom-images/526bda5b-c0c2-4170-b552-12a17db69fa9.jpeg" },
        { id: 8, category: "Painting and decoration", url:"https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" }
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
        { id: 1, category: "Home cleaning", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174733.png" },
        { id: 2, category: "Plumbing", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20174847.png" },
        { id: 3, category: "Electrical work", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175034.png" },
        { id: 5, category: "Masonry", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 6, category: "Gardening", url:"https://storage.googleapis.com/wisdom-images/4a4881ba-a06f-4bb1-be9d-016d2b49eae4.jpeg" },
        { id: 8, category: "Painting and decoration", url:"https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" }
      ]
    },
    {
      family: "Health and Wellbeing",
      description: "Health and wellness services including personal trainers, nutritionists, and various types of therapy.",
      categories: [
        { id: 31, category: "Personal trainers", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175621.png" },
        { id: 32, category: "Nutritionists", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175812.png" },
        { id: 34, category: "Psychology", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180032.png" },
        { id: 35, category: "Yoga", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180113.png" },
        { id: 36, category: "Guided meditation", url:"https://storage.googleapis.com/wisdom-images/53a50b05-32d7-4e90-86ce-62702bc97d65.jpeg" },    
        { id: 37, category: "Therapeutic massages", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180612.png" },
        { id: 54, category: "Couples therapy", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180656.png" }
      ]
    },
    {
      family: "Education and Training",
      description: "Educational and training services such as private tutoring, language classes, and exam preparation.",
      categories: [
        { id: 56, category: "Private tutors", url:"https://storage.googleapis.com/wisdom-images/77502ab75202d6b38aa0df57113b6746.jpg" },
        { id: 57, category: "Math classes", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180933.png" },
        { id: 58, category: "Language classes", url:"https://storage.googleapis.com/wisdom-images/6f1a64adbbe28f7d572a9fef189ea542.jpg" },
        { id: 59, category: "Science classes", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181138.png" },
        { id: 68, category: "Job interview preparation", url:"https://storage.googleapis.com/wisdom-images/36548671ef1476a260d9e3dbb8fe4706.jpg" },
        { id: 65, category: "Music classe", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181310.png" },
        { id: 61, category: "Programming classes", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181628.png" }
      ]
    },
    {
      family: "Digital and Online",
      description: "Digital and online services such as web development, graphic design, and content creation.",
      categories: [
        { id: 83, category: "Mobile app development", url:"https://storage.googleapis.com/wisdom-images/451067aa-4bd3-43d8-874d-ff8b5e50ce7e.jpeg" },
        { id: 84, category: "Web development", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181853.png" },
        { id: 89, category: "AI development", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20201215.png" },
        { id: 85, category: "Frontend development", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182501.png" },
        { id: 86, category: "Backend development", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182034.png" },
        { id: 90, category: "Graphic design", url:"https://storage.googleapis.com/wisdom-images/a2b2c958-2d21-4308-8b07-51a1820f6faa.jpeg" },
        { id: 94, category: "Video editing", url:"https://storage.googleapis.com/wisdom-images/ad3a9403cb4273ff3bfb2ab24429bb62.jpg" },
        { id: 100, category: "3D design", url:"https://storage.googleapis.com/wisdom-images/4475f6e7e9766c27834ae79e308907db2d4fe361f741e26a2e9357b0a6c63082_1920x1080.webp" },
        { id: 101, category: "Social media content creation", url:"https://storage.googleapis.com/wisdom-images/contentcretor.png" },
      ]
    },
    {
      family: "Construction and Renovations",
      description: "Construction and renovation services including architecture, painting, and general contracting.",
      categories: [
        { id: 151, category: "Architects", url:"https://storage.googleapis.com/wisdom-images/526bda5b-c0c2-4170-b552-12a17db69fa9.jpeg" },
        { id: 152, category: "Masons", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
        { id: 170, category: "Building rehabilitation", url:"https://storage.googleapis.com/wisdom-images/5964b65c-a2f6-4638-9024-6b38b2e0f42a.jpeg" }
      ]
    },
    {
      family: "Events and Entertainment",
      description: "Services for events and entertainment, including catering, photography, and event planning.",
      categories: [
        { id: 172, category: "Wedding planners", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184608.png" },
        { id: 173, category: "Event Catering", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184635.png" },
        { id: 174, category: "Event photography", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184808.png" },
        { id: 175, category: "Party DJs", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184853.png" },
        { id: 178, category: "Children's entertainers", url:"https://storage.googleapis.com/wisdom-images/1.webp" },
        { id: 181, category: "Event security", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185110.png" }
      ]
    },
    {
      family: "Finance and Administration",
      description: "Finance and administration services including tax advice, payroll management, and financial consulting.",
      categories: [
        { id: 225, category: "Auditing", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185810.png" },
        { id: 240, category: "Investment advice", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185958.png" },
        { id: 229, category: "Budget planning", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 224, category: "Financial consulting", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185443.png" }
      ]
    },
    {
      family: "Personal and Pet Care",
      description: "Services related to personal care and pet care, including dog walking and pet grooming.",
      categories: [
        { id: 317, category: "Dog walkers", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190223.png" },
        { id: 318, category: "Pet care at home", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190446.png" },
        { id: 319, category: "Dog trainers", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190602.png" },
        { id: 320, category: "Home veterinarians", url:"https://storage.googleapis.com/wisdom-images/9974f022598c393f68479bcb39efd4e5.jpg" },
        { id: 321, category: "Pet grooming", url:"https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190349.png" },
      ]
    },
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Results', {category:item.id})}>
      <ImageBackground
        source={{ uri: item.url }}
        className="mr-2 w-[270] h-[145] p-4 flex-row justify-between items-end "
        imageStyle={{ borderRadius: 12, opacity:0.6}}
      >
        <Text className="ml-2 font-inter-semibold text-[18px] text-[#e0e0e0]">{item.category}</Text>
        <Text className="ml-2 font-inter-semibold text-[18px] text-[#e0e0e0]">→</Text>
      </ImageBackground>
      
    </TouchableOpacity>
  );

  const renderProfile = ({ item, index }) => (

    <View>

      {index===0? (

        <View className="p-3 mr-4 justify-start items-center rounded-2xl bg-[#d4d4d3] dark:bg-[#474646]">
          <View className="w-full justify-start items-end">
            <View className="h-[19]"/>
          </View>
          <Image source={require('../../assets/defaultProfilePic.jpg')} className="mb-4 w-[90] h-[90] rounded-full bg-slate-500"/>
          <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">Become a professional</Text>
          <Text className="mb-3 font-inter-medium text-[10px] text-[#706F6E] dark:text-[#b6b5b5]">And make money serving</Text>
          <View className="justify-center items-center">
            <TouchableOpacity onPress={() => navigation.navigate('CreateService1')} className="py-2 px-5 justify-center items-center bg-[#444343] dark:bg-[#f2f2f2] rounded-lg" >
              <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">Create</Text>
            </TouchableOpacity>
          </View>
        </View>

      ) : (

        <View className="p-3 mr-4 justify-start items-center">
          <TouchableOpacity onPress={()=> removeProfessional(item.service_id)} className="w-full justify-start items-end">
            <XMarkIcon height={19} color={iconColor} strokeWidth="2"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile', {serviceId: item.service_id})} className="justify-center items-center">
            <Image source={{ uri: item.profile_picture }} className="mb-4 w-[90] h-[90] rounded-full bg-slate-500"/>
            <Text className="mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]">{item.service_title}</Text>
            <Text className="mb-3 font-inter-medium text-[10px] text-[#706F6E] dark:text-[#b6b5b5]">{item.first_name} {item.surname}</Text>
          </TouchableOpacity>
          <View className="justify-center items-center">
            <TouchableOpacity onPress={() => navigation.navigate('ServiceProfile', {serviceId: item.service_id})}  className="py-2 px-5 justify-center items-center bg-[#444343] dark:bg-[#f2f2f2] rounded-lg" >
              <Text className="font-inter-semibold text-[13px] text-[#f2f2f2] dark:text-[#272626]">Visit</Text>
            </TouchableOpacity>
          </View>
        </View>

      )}

    </View>
  );

  // Función para renderizar cada familia
  const renderFamily = ({ item, index }) => (

    <View>

    {index===1? (

    <View className="mb-6">
      <Text className="mb-3 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{item.family}</Text>
      <FlatList
        data={suggestedProfessionals}
        horizontal
        renderItem={renderProfile}
        keyExtractor={(category) => category.service_id.toString()}
        showsHorizontalScrollIndicator={false}
      />
    </View>

    ) : (

    <View className="mb-10">
      <Text className="mb-3 font-inter-semibold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{item.family}</Text>
      <FlatList
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

  
  
   
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
      

        <TouchableOpacity onPress={() => navigation.navigate('Results', {category:2})} className="justify-center items-center pt-8 px-10">
          <View className="h-[55] pl-5 pr-3 w-full flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
            <Search height={19} color={iconColor} strokeWidth="2"/>
            <Text className="ml-2 font-inter-medium text-[14px] text-[#979797]">Search a service...</Text>
          </View>
        </TouchableOpacity>

        <View className="mt-5 pb-5 border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]">
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
            {suggestions.map((item, index) => (
              <View key={index} className="pl-2">
                <TouchableOpacity
                  className={`px-4 py-3 rounded-full ${selectedCategoryID === item.categoryID ? 'bg-[#323131] dark:bg-[#fcfcfc]' : 'bg-[#e0e0e0] dark:bg-[#3d3d3d]'}`}
                  onPress={() => setSelectedCategoryID(item.categoryID)}
                >
                  <Text className={`font-inter-medium text-[14px] ${selectedCategoryID === item.categoryID ? 'text-[#e0e0e0] dark:text-[#3d3d3d]' : 'text-[#323131] dark:text-[#fcfcfc]'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="flex-1 mt-3">

          <FlatList
            data={serviceFamilies}
            renderItem={renderFamily}
            keyExtractor={(family) => family.family}
            showsVerticalScrollIndicator={false}
            className="p-5 pr-0"
          />

        </View>
        
      
    </SafeAreaView>
  );
}