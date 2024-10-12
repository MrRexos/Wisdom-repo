import { View, Text, TouchableOpacity, Platform, NativeModules, Animated, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getDataLocally } from '../../utils/asyncStorage';

const WelcomeVideoScreen = () => {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [token, setToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();
  const [currentImages, setCurrentImages] = useState([]);

  const categoriesArray = [
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
    { id: 8, category: "Painting and decoration", url: "https://storage.googleapis.com/wisdom-images/237ee01c-4454-4d81-8f27-f502f74ac9d3.jpeg" },
    { id: 3, category: "Electrical work", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175034.png" },
    { id: 6, category: "Gardening", url: "https://storage.googleapis.com/wisdom-images/4a4881ba-a06f-4bb1-be9d-016d2b49eae4.jpeg" },
  ];

  useEffect(() => {
    const changeDefaultLanguage = () => {
      const deviceLanguage =
        Platform.OS === 'ios'
          ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
          : NativeModules.I18nManager.localeIdentifier;

      const language = deviceLanguage.split(/[_-]/)[0];
      i18n.changeLanguage(language);
    };

    const loadUserData = async () => {
      const userData = await getDataLocally('user');
      if (userData) {
        const user = JSON.parse(userData);
        setToken(user.userToken);
        if (user.userToken) {
          navigation.navigate('Loading');
        } else {
          changeDefaultLanguage();
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const startAnimation = () => {
    // Seleccionar una imagen aleatoria
    const randomIndex = Math.floor(Math.random() * categoriesArray.length);
    const randomImage = categoriesArray[randomIndex];

    // Crear valores animados para la nueva imagen
    const newTranslateX = new Animated.Value(500); // Inicializar fuera de la pantalla a la derecha
    const newTranslateY = new Animated.Value(Math.floor(Math.random() * 801) - 800); // Valor entre -150 y 150

    const newImage = {
      id: Math.random().toString(),
      image: randomImage,
      translateX: newTranslateX,
      translateY: newTranslateY,
    };

    // Añadir la nueva imagen al estado
    setCurrentImages((prevImages) => [...prevImages, newImage]);

    // Animación de desplazamiento de derecha a izquierda
    Animated.timing(newTranslateX, {
      toValue: -500, // Mover a la izquierda fuera de la pantalla
      duration: 8000, // Duración de la animación
      useNativeDriver: true,
    }).start(() => {
      // Eliminar la imagen una vez que termina la animación
      setCurrentImages((prevImages) => prevImages.filter((img) => img.id !== newImage.id));
    });
  };

  useEffect(() => {
    const startAnimationLoop = () => {

      startAnimation();

      // Generar un intervalo aleatorio entre 500ms y 2000ms
      const randomInterval = Math.random() * (2000 - 1000) + 1000;

      // Establecer el siguiente intervalo
      const intervalId = setTimeout(startAnimationLoop, randomInterval);

      return intervalId;
    };

    const intervalId = startAnimationLoop();

    return () => clearTimeout(intervalId);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <View className='flex-1 justify-end items-center bg-[#272626]'>
      <StatusBar style={'light'} />

      {/* Renderizar todas las imágenes animadas */}
      {currentImages.map((imgObj) => (
        <Animated.View
          key={imgObj.id}
          style={{
            position: 'absolute',
            transform: [
              { translateX: imgObj.translateX }, // Movimiento horizontal
              { translateY: imgObj.translateY }, // Movimiento vertical
            ],
          }}
        >
          <Image
            source={{ uri: imgObj.image.url }}
            style={{ width: 270, height: 150 }}
          />
        </Animated.View>
      ))}

      <TouchableOpacity onPress={() => navigation.navigate('Loading')}>
        <Text className='text-[#f2f2f2] font-inter-semibold m-[75]'>{t('skip_intro')}</Text>
      </TouchableOpacity>
    </View> 
  );
};

export default WelcomeVideoScreen;
