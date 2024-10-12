
import { View, Text, TouchableOpacity, Platform, NativeModules, Animated, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getDataLocally } from '../../utils/asyncStorage';
import * as Font from 'expo-font';

const WelcomeVideoScreen = () => {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [token, setToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

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

  const [animatedValues, setAnimatedValues] = useState([]);

  useEffect(() => {
    
    const animateImages = () => {
      const newAnimatedValues = categoriesArray.map((category, index) => {
        const animatedValue = new Animated.Value(0);
        const randomDuration = 10000; // Duración aleatoria entre 0.1s y 2s
        const randomHeight = Math.random() * 2000; // Altura aleatoria
        const randomDelay = Math.random() * 4000; // Retardo aleatorio para la aparición

        Animated.loop(
          Animated.sequence([
            Animated.delay(randomDelay),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: randomDuration,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: randomDuration,
              useNativeDriver: false,
            }),
          ]),
        ).start();

        return { animatedValue, randomHeight };
      });

      setAnimatedValues(newAnimatedValues);
    };

    animateImages();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <View className='flex-1 justify-end items-center bg-[#272626]'>
      <StatusBar style={'light'} />
      <TouchableOpacity onPress={() => navigation.navigate('Loading')}>
        <Text className='text-[#f2f2f2] font-inter-semibold m-[75]'>{t('skip_intro')}</Text>
      </TouchableOpacity>

      {/* Nivel 1 - Imágenes Frontales */}
      {animatedValues.map(({ animatedValue, randomHeight }, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            height: 150,
            width: 270,
            top: randomHeight,
            left: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [600, -400], // Se mueve de derecha a izquierda
            }),
          }}>
          <Image
            source={{ uri: categoriesArray[index % categoriesArray.length].url }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            className="rounded-xl"
          />
        </Animated.View>
      ))}

    </View>
  );
};

export default WelcomeVideoScreen;
