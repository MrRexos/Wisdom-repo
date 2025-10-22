import { View, Text, TouchableOpacity, Animated, Image, useWindowDimensions, Easing } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { getDataLocally, storeDataLocally } from '../../utils/asyncStorage';
import { applyLanguagePreference, detectDeviceLanguage } from '../../utils/language';

const WelcomeVideoScreen = () => {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImagesDown, setCurrentImagesDown] = useState([]);
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const MAIN_IMAGE_WIDTH = 240;
  const MAIN_IMAGE_HEIGHT = 130;
  const BLURRED_IMAGE_WIDTH = 180;
  const BLURRED_IMAGE_HEIGHT = 100;
  const HORIZONTAL_OFFSET = 40;

  // Constantes para controlar TODO
  const DURATION_UP = 40000;
  const DURATION_DOWN = 60000;
  const SPAWN_UP = [3000, 6000];     // apariciones menos frecuentes
  const SPAWN_DOWN = [7000, 12000];  // borrosas aún menos

  const MAX_UP = 6;
  const MAX_DOWN = 5;

  const timersRef = useRef({ up: null, down: null });
  const stoppedRef = useRef(false);

  const rand = (min, max) => min + Math.random() * (max - min);

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
    { id: 32, category: "Nutritionists", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175812.png" },
    { id: 34, category: "Psychology", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180032.png" },
    { id: 35, category: "Yoga", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180113.png" },
    { id: 36, category: "Guided meditation", url: "https://storage.googleapis.com/wisdom-images/53a50b05-32d7-4e90-86ce-62702bc97d65.jpeg" },
    { id: 37, category: "Therapeutic massages", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180612.png" },
    { id: 54, category: "Couples therapy", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180656.png" },
    { id: 56, category: "Private tutors", url: "https://storage.googleapis.com/wisdom-images/77502ab75202d6b38aa0df57113b6746.jpg" },
    { id: 57, category: "Math classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20180933.png" },
    { id: 58, category: "Language classes", url: "https://storage.googleapis.com/wisdom-images/6f1a64adbbe28f7d572a9fef189ea542.jpg" },
    { id: 59, category: "Science classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181138.png" },
    { id: 68, category: "Job interview preparation", url: "https://storage.googleapis.com/wisdom-images/36548671ef1476a260d9e3dbb8fe4706.jpg" },
    { id: 65, category: "Music classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181310.png" },
    { id: 61, category: "Programming classes", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20181628.png" },
    { id: 85, category: "Frontend development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182501.png" },
    { id: 86, category: "Backend development", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20182034.png" },
    { id: 90, category: "Graphic design", url: "https://storage.googleapis.com/wisdom-images/a2b2c958-2d21-4308-8b07-51a1820f6faa.jpeg" },
    { id: 94, category: "Video editing", url: "https://storage.googleapis.com/wisdom-images/ad3a9403cb4273ff3bfb2ab24429bb62.jpg" },
    { id: 100, category: "3D design", url: "https://storage.googleapis.com/wisdom-images/4475f6e7e9766c27834ae79e308907db2d4fe361f741e26a2e9357b0a6c63082_1920x1080.webp" },
    { id: 101, category: "Social media content creation", url: "https://storage.googleapis.com/wisdom-images/contentcretor.png" },
    { id: 152, category: "Masons", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20175117.png" },
    { id: 170, category: "Building rehabilitation", url: "https://storage.googleapis.com/wisdom-images/5964b65c-a2f6-4638-9024-6b38b2e0f42a.jpeg" },
    { id: 172, category: "Wedding planners", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184608.png" },
    { id: 173, category: "Event Catering", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184635.png" },
    { id: 174, category: "Event photography", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184808.png" },
    { id: 175, category: "Party DJs", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20184853.png" },
    { id: 178, category: "Children's entertainers", url: "https://storage.googleapis.com/wisdom-images/1.webp" },
    { id: 181, category: "Event security", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185110.png" },
    { id: 225, category: "Auditing", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185537.png" },
    { id: 226, category: "IT consulting", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20185839.png" },
    { id: 228, category: "Business analysis", url: "https://storage.googleapis.com/wisdom-images/Captura%20de%20pantalla%202024-09-27%20190143.png" },
  ];

  const getRandomY = (imgH) => {
    const minY = Math.max(insets.top + 8, 8); // evita y=0 exacto
    const maxY = Math.max(winH - insets.bottom - imgH - 8, minY);
    return minY + Math.random() * (maxY - minY);
  };

  useEffect(() => {
    stoppedRef.current = false;

    const loopUp = () => {
      if (stoppedRef.current) return;
      // tope de simultáneas
      setCurrentImages(prev => {
        if (prev.length >= MAX_UP) return prev;
        startAnimation(); // usa DURATION_UP internamente
        return prev;
      });
      timersRef.current.up = setTimeout(loopUp, rand(...SPAWN_UP));
    };

    const loopDown = () => {
      if (stoppedRef.current) return;
      setCurrentImagesDown(prev => {
        if (prev.length >= MAX_DOWN) return prev;
        startAnimationDown(); // usa DURATION_DOWN internamente
        return prev;
      });
      timersRef.current.down = setTimeout(loopDown, rand(...SPAWN_DOWN));
    };

    loopUp();
    loopDown();

    return () => {
      stoppedRef.current = true;
      if (timersRef.current.up) clearTimeout(timersRef.current.up);
      if (timersRef.current.down) clearTimeout(timersRef.current.down);
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await getDataLocally('user');
      if (userData) {
        let user = null;
        try {
          user = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data', error);
        }

        if (user) {
          setToken(user.token);
          await applyLanguagePreference(user, async (updatedUser) => {
            await storeDataLocally('user', JSON.stringify(updatedUser));
          });

          if (user.token) {
            navigation.navigate('Loading');
            return;
          }

          setShowSkip(true);
          setIsLoading(false);
          return;
        }
      }

      const language = detectDeviceLanguage();
      if (language !== i18n.language) {
        await i18n.changeLanguage(language);
      }

      setShowSkip(true);
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const startAnimation = () => {
    // Seleccionar una imagen aleatoria
    const randomIndex = Math.floor(Math.random() * categoriesArray.length);
    const randomImage = categoriesArray[randomIndex];

    // Crear valores animados para la nueva imagen
    const newTranslateX = new Animated.Value(winW + MAIN_IMAGE_WIDTH + HORIZONTAL_OFFSET);
    const newTranslateY = new Animated.Value(getRandomY(MAIN_IMAGE_HEIGHT));

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
      toValue: -(MAIN_IMAGE_WIDTH + HORIZONTAL_OFFSET),
      duration: DURATION_UP,   // o DURATION_DOWN
      useNativeDriver: true,
      easing: Easing.linear,
    }).start(() => {
      // Eliminar la imagen una vez que termina la animación
      setCurrentImages((prevImages) => prevImages.filter((img) => img.id !== newImage.id));
    });
  };

  useEffect(() => {

    const startAnimationLoop = () => {

      startAnimation();

      // Generar un intervalo aleatorio entre 500ms y 2000ms
      const randomInterval = Math.random() * (5000 - 2000) + 7000;

      // Establecer el siguiente intervalo
      const intervalId = setTimeout(startAnimationLoop, randomInterval);

      return intervalId;
    };

    const intervalId = startAnimationLoop();

    return () => clearTimeout(intervalId);
  }, []);

  const startAnimationDown = () => {
    // Seleccionar una imagen aleatoria
    const randomIndex = Math.floor(Math.random() * categoriesArray.length);
    const randomImage = categoriesArray[randomIndex];

    // Crear valores animados para la nueva imagen
    const newTranslateX = new Animated.Value(winW + BLURRED_IMAGE_WIDTH + HORIZONTAL_OFFSET);
    const newTranslateY = new Animated.Value(getRandomY(BLURRED_IMAGE_HEIGHT));

    const newImage = {
      id: Math.random().toString(),
      image: randomImage,
      translateX: newTranslateX,
      translateY: newTranslateY,
    };

    // Añadir la nueva imagen al estado
    setCurrentImagesDown((prevImages) => [...prevImages, newImage]);

    // Animación de desplazamiento de derecha a izquierda
    Animated.timing(newTranslateX, {
      toValue: -(BLURRED_IMAGE_WIDTH + HORIZONTAL_OFFSET), // Mover a la izquierda fuera de la pantalla
      duration: DURATION_DOWN, // Duración de la animación
      useNativeDriver: true,
      easing: Easing.linear,
    }).start(() => {
      // Eliminar la imagen una vez que termina la animación
      setCurrentImagesDown((prevImages) => prevImages.filter((img) => img.id !== newImage.id));
    });
  };

  useEffect(() => {
    const startAnimationLoop = () => {

      startAnimationDown();

      // Generar un intervalo aleatorio entre 500ms y 2000ms
      const randomInterval = Math.random() * (10000 - 5000) + 9000;

      // Establecer el siguiente intervalo
      const intervalId = setTimeout(startAnimationLoop, randomInterval);

      return intervalId;
    };

    const intervalId = startAnimationLoop();

    return () => clearTimeout(intervalId);
  }, []);



  return (
    <View className='flex-1 justify-end items-center bg-[#111111]'>
      <StatusBar style={'light'} />

      {/* Renderizar todas las imágenes borrosas */}
      {currentImagesDown.map((imgObj) => (
        <Animated.View
          key={imgObj.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: [
              { translateX: imgObj.translateX }, // Movimiento horizontal
              { translateY: imgObj.translateY }, // Movimiento vertical
            ],
          }}
        >
          <Image
            source={{ uri: imgObj.image.url }}
            style={{ width: 180, height: 100, opacity: 0.4 }}
            blurRadius={5}
            className="rounded-xl z-0"
          />
        </Animated.View>
      ))}

      {/* Renderizar todas las imágenes animadas */}
      {currentImages.map((imgObj) => (
        <Animated.View
          key={imgObj.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: [
              { translateX: imgObj.translateX }, // Movimiento horizontal
              { translateY: imgObj.translateY }, // Movimiento vertical
            ],
          }}
        >
          <Image
            source={{ uri: imgObj.image.url }}
            style={{ width: 240, height: 130 }}
            className="rounded-xl"
          />
        </Animated.View>
      ))}
      {showSkip ?
        <TouchableOpacity onPress={() => navigation.navigate('Loading')}>
          <Text className='text-[#f2f2f2] font-inter-semibold m-[75px]'>{t('skip_intro')}</Text>
        </TouchableOpacity>
        : null}

    </View>
  );
};

export default WelcomeVideoScreen;
