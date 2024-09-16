import React, { useState } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, ScrollView, Image, StyleSheet, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon} from 'react-native-heroicons/outline'; // Asegúrate de importar PlusIcon o el ícono que prefieras
import AddMainImage from '../../assets/AddMainImage';
import AddServiceImages from '../../assets/AddServiceImages';
import * as ImagePicker from 'expo-image-picker';

const patternImages = (images, colorScheme, onRemoveImage) => {
  const patternSize = 6; // Número de imágenes en el patrón
  const totalImages = images.length;
  const verticalSpacing = 190; // Espacio vertical entre filas de imágenes
  const horizontalSpacing = 165; // Espacio horizontal entre columnas de imágenes
  
  const pattern = images.map((image, i) => {
    const imgIndex = i % patternSize; // Usa módulo para repetir el patrón

    let transformStyle = {};
    let topPosition = 0;
    let leftPosition = 0;

    // Ajusta la posición y rotación de las imágenes
    switch (imgIndex) {
      case 0:
        transformStyle = { transform: [{ rotate: '-3deg' }] };
        topPosition = Math.floor(i / patternSize) * 3 * verticalSpacing;
        leftPosition = 0;
        break;
      case 1:
        transformStyle = { transform: [{ rotate: '4.4deg' }] };
        topPosition = Math.floor(i / patternSize) * 3 * verticalSpacing ;
        leftPosition = horizontalSpacing;
        break;
      case 2:
        transformStyle = { transform: [{ rotate: '3.7deg' }] };
        topPosition = Math.floor(i / patternSize) * 3 * verticalSpacing + verticalSpacing;
        leftPosition = 0;
        break;
      case 3:
        transformStyle = { transform: [{ rotate: '-2.5deg' }] };
        topPosition = Math.floor(i / patternSize ) * 3 * verticalSpacing + verticalSpacing;
        leftPosition = horizontalSpacing;
        break;
      case 4:
        transformStyle = { transform: [{ rotate: '2.2deg' }] };
        topPosition = Math.floor(i / patternSize) * 3 * verticalSpacing + 2 * verticalSpacing;
        leftPosition = 0;
        break;
      case 5:
        transformStyle = { transform: [{ rotate: '-2.4deg' }] };
        topPosition = Math.floor(i / patternSize) * 3 * verticalSpacing + 2 * verticalSpacing;
        leftPosition = horizontalSpacing;
        break;
      default:
        break;
    }

    return (
      <View
        key={i}
        style={[styles.imageContainer, { top: topPosition, left: leftPosition }]}
      >
        <Image
          source={{ uri: image.uri }}
          style={[
            styles.image,
            { borderColor: colorScheme === 'dark' ? '#202020' : '#fcfcfc' },
            transformStyle,
            { width: 130 + (imgIndex % 2) * 20, height: 160 },
          ]}
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveImage(i+1)}
        >
          <XMarkIcon size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  });

  return pattern;
};

export default function CreateService8Screen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const route = useRoute();
  const {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences} = route.params;
  const [serviceImages, setServiceImages] = useState([]);
  const patternHeight = Math.ceil(serviceImages.length / 6) * 3 * 160;

  const handlePickMainImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert(
            "Permission Denied",
            "You need to allow access to your gallery to select a profile picture. ",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Settings", onPress: () => Linking.openSettings() }
            ],
            { cancelable: true }
        );
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        setServiceImages(prevImages => [result.assets[0], ...prevImages]);   
    }
  };

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert(
            "Permission Denied",
            "You need to allow access to your gallery to select a profile picture. ",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Settings", onPress: () => Linking.openSettings() }
            ],
            { cancelable: true }
        );
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        quality: 1,
        allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setServiceImages(prevImages => [...prevImages, ...result.assets]);      
    }
  };

  const handleRemoveImage = (index) => {
    setServiceImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <View className="flex-1 px-6 pt-5 pb-6">

          <TouchableOpacity onPress={() => navigation.pop(8)}>
            <View className="flex-row justify-start">
              <XMarkIcon size={30} color={iconColor} strokeWidth="1.7" />
            </View>
          </TouchableOpacity>

          <View className="justify-center items-center">
            <Text className="mt-[55] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">Upload some photos</Text>
            <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">We recommend you to upload at least 5 images</Text>
          </View>

          {serviceImages.length < 2 ? null : (
            <TouchableOpacity onPress={handlePickImages}>
              <Text className="mt-10 font-inter-medium text-[16px] text-center text-[#444343] dark:text-[#f2f2f2]">+ Add More</Text>
            </TouchableOpacity>
          )}

          {serviceImages.length < 2 ? ( <View className="h-[30]"/>) : null}

          <View className="flex-1 w-full mt-[20] justify-start items-center">

            {serviceImages.length < 1 ? (

              <TouchableOpacity onPress={handlePickMainImage} className="justify-center items-center relative ">
                <AddMainImage fill={iconColor} width={257} height={118} />
                <Text className="absolute bottom-4 left-1/2 inset-x-0 font-inter-semibold text-[14px] text-center text-[#e0e0e0] dark:text-[#3d3d3d]">Main photo</Text>
              </TouchableOpacity>

            ) : (

              <View className="justify-center items-center">

                <TouchableOpacity onPress={handlePickMainImage}>
                  <Image source={{ uri: serviceImages[0].uri }} className="w-[260] h-[148] rounded-xl border-[3px] border-[#fcfcfc] dark:border-[#202020]" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(0)}>
                  <XMarkIcon size={20} color="white" />
                </TouchableOpacity>

              </View>
            )}

            {serviceImages.length < 2 ? (

              <TouchableOpacity onPress={handlePickImages}>
                <AddServiceImages stroke={iconColor} className="mt-12" />
              </TouchableOpacity>

            ) : (

              <View style={[styles.patternContainer, { height: patternHeight }]}>
                {patternImages(serviceImages.slice(1), colorScheme, handleRemoveImage)}
              </View>

            )}

          </View>

        </View>

      </ScrollView>

      {/* Botones fijos abajo */}

      <View className="flex-row justify-center items-center pt-4 pb-6 px-6">

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ opacity: 1 }} className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55] rounded-full items-center justify-center">
          <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!description}
          onPress={() => navigation.navigate('CreateService9', {title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences})}
          style={{ opacity: description ? 1.0 : 0.5 }}
          className="ml-[10] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55] rounded-full items-center justify-center"
        >
          <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">Continue</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  patternContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 40,
  },
  imageContainer: {
    position: 'absolute',
  },
  image: {
    borderRadius: 10,
    borderWidth: 3,
    marginBottom: 30,
  },
  removeButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15,
    padding: 3,
  },
});
