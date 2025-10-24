import React, { useEffect, useState, useCallback } from 'react'
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { Search, Check, Maximize2 } from "react-native-feather";
import MapView, { Marker, Circle } from 'react-native-maps';
import { getRegionForRadius } from '../../../utils/mapUtils';
import { storeDataLocally, getDataLocally } from '../../../utils/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import SliderThumbDark from '../../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../../assets/SliderThumbLight.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';
import {
  mapMarkerAnchor,
  mapMarkerCenterOffset,
  mapMarkerImage,
  mapMarkerStyle,
} from '../../../utils/mapMarkerAssets';





export default function CreateServiceLocationScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const rawParams = route.params?.prevParams || route.params || {};
  const { blurVisible, ...prevParams } = rawParams;
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags } = prevParams;
  const [isUnlocated, setIsUnlocated] = useState(prevParams.isUnlocated || false);

  const [direction, setDirection] = useState(prevParams.direction || '');
  const [currentLocation, setCurrentLocation] = useState(prevParams.location || { lat: 41.5421100, lng: 2.4445000 });
  const isFocused = useIsFocused();

  const [country, setCountry] = useState(prevParams.country || '');
  const [street, setStreet] = useState(prevParams.street || '');
  const [city, setCity] = useState(prevParams.city || '');
  const [state, setState] = useState(prevParams.state || '');
  const [postalCode, setPostalCode] = useState(prevParams.postalCode || '');
  const [streetNumber, setStreetNumber] = useState(prevParams.streetNumber || '');
  const [address2, setAddress2] = useState(prevParams.address2 || '');
  const [location, setLocation] = useState(prevParams.location);
  // Preserve explicit 0 values when coming back from other screens
  const [actionRate, setActionRate] = useState(prevParams.actionRate ?? 1);

  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;

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
      isUnlocated,
      direction,
      country,
      street,
      city,
      state,
      postalCode,
      streetNumber,
      address2,
      location,
      actionRate,
    },
    t,
  });

  const loadSearchedDirection = async () => {

    const searchedDirectionData = await getDataLocally('searchedDirection');

    if (searchedDirectionData) {
      const searchedDirection = JSON.parse(searchedDirectionData);
      setCountry(searchedDirection.country);
      setState(searchedDirection.state);
      setCity(searchedDirection.city);
      setStreet(searchedDirection.address_1);
      setPostalCode(searchedDirection.postal_code);
      setStreetNumber(searchedDirection.street_number);
      setAddress2(searchedDirection.address_2);
      setLocation(searchedDirection.location);
      setIsUnlocated(false);
      console.log(searchedDirection.location)
      // Construir y mostrar la dirección aunque no exista location
      const parts = [];
      if (searchedDirection.address_1) parts.push(searchedDirection.address_1);
      if (searchedDirection.street_number) parts.push(String(searchedDirection.street_number));
      if (searchedDirection.address_2) parts.push(searchedDirection.address_2);
      if (searchedDirection.city) parts.push(searchedDirection.city);
      if (searchedDirection.postal_code) parts.push(String(searchedDirection.postal_code));
      if (searchedDirection.state) parts.push(searchedDirection.state);
      if (searchedDirection.country) parts.push(searchedDirection.country);
      setDirection(parts.join(', '));
      if (searchedDirection.location) {
        setCurrentLocation(searchedDirection.location);
      }
      removeSearchedDirection();
    }
  };

  const removeSearchedDirection = async () => {

    try {
      await AsyncStorage.removeItem('searchedDirection');
    } catch (error) {
      console.error('Error al eliminar searchedDirection:', error);
    }
  };

  const buildAddressString = () => {
    const parts = [];

    if (street) parts.push(street);
    if (streetNumber) parts.push(streetNumber);
    if (address2) parts.push(address2);
    if (city) parts.push(city);
    if (postalCode) parts.push(postalCode);
    if (state) parts.push(state);
    if (country) parts.push(country);

    return parts.join(', ');
  };

  useFocusEffect(
    useCallback(() => {
      loadSearchedDirection();
    }, [isFocused])
  );

  useFocusEffect(
    useCallback(() => {
      if (location) {
        setDirection(buildAddressString());
        setCurrentLocation(location);
      }
    }, [location])
  );

  const mapRegion = actionRate < 100
    ? getRegionForRadius(currentLocation.lat, currentLocation.lng, actionRate)
    : {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.03,
      };

  const hasDirection = typeof direction === 'string' && direction.trim().length > 0;
  const hasLocation = Boolean(
    location &&
    typeof location === 'object' &&
    (location.lat !== null && location.lat !== undefined) &&
    (location.lng !== null && location.lng !== undefined)
  );
  const canContinue = isUnlocated || hasDirection || hasLocation;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <View className="flex-1 px-6 pt-5 pb-6">

        <ServiceFormHeader
          onBack={requestBack}
          onSave={handleSave}
          showSave={isEditing && hasChanges}
          saving={saving}
        />

        <View className=" justify-center items-center ">
          <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('locate_your_service')}</Text>
          <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('exact_location_never_public')}</Text>
        </View>

        <View className="flex-1 pb-[80px] justify-start items-center ">

          <TouchableOpacity onPress={() => navigation.navigate('SearchDirectionCreateService', { prevScreen: 'CreateServiceLocation', prevParams: { ...prevParams, isUnlocated, direction, country, street, city, state, postalCode, streetNumber, address2, location, actionRate } })} className="mt-5 px-3 justify-center items-center w-full">
            <View className="mt-7 h-[50px] px-4 w-full flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
              <Search height={20} color={colorScheme == 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
              <Text
                className="pl-2 truncate text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                style={{ flexShrink: 1 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {direction || t('search_a_direction')}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="mb-2 justify-center items-center">
            <View style={{ marginTop: 20, position: 'relative' }}>
              <MapView
                style={{ height: 250, width: 300, borderRadius: 12 }}
                region={mapRegion}
              >
                {location && (
                  <View>
                    <Marker
                      coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                      anchor={mapMarkerAnchor}
                      centerOffset={mapMarkerCenterOffset}
                    >
                      <Image
                        source={mapMarkerImage}
                        style={mapMarkerStyle}
                        resizeMode="contain"
                      />
                    </Marker>
                    {actionRate < 100 && (
                      <Circle
                        center={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                        radius={actionRate * 1000}
                        strokeColor="rgba(182,181,181,0.8)"
                        fillColor="rgba(182,181,181,0.5)"
                        strokeWidth={2}
                      />
                    )}
                  </View>
                )}
              </MapView>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('FullScreenMap', {
                    location: { latitude: currentLocation.lat, longitude: currentLocation.lng },
                    actionRate,
                    showMarker: !!location,
                  })
                }
                style={{ position: 'absolute', top: 10, right: 10, backgroundColor: colorScheme === 'dark' ? '#3D3D3D' : '#FFFFFF', borderRadius: 20, padding: 8 }}
              >
                <Maximize2 width={18} height={18} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} />
              </TouchableOpacity>
            </View>
          </View>

          {!isUnlocated && (direction || location) ? (
            <View className="w-full mt-1 px-4 flex-row items-center mb-2">
              <Text className="shrink-0 mr-3">
                <Text className="font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">
                  {t('action_rate_dash')}{" "}
                </Text>
                <Text className="font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">
                  {actionRate === 100
                    ? t('full')
                    : actionRate === 0
                      ? t('fixed_site')
                      : `${actionRate} km`}
                </Text>
              </Text>

              <Slider
                style={{ flex: 1, height: 10 }}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={actionRate}
                thumbImage={thumbImage}
                minimumTrackTintColor="#b6b5b5"
                maximumTrackTintColor="#474646"
                onValueChange={value => setActionRate(value)}
              />
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => {
              const newValue = !isUnlocated;
              setIsUnlocated(newValue);
              if (newValue) {
                // Clear previously selected address and radius when switching to unlocated
                setDirection('');
                setCountry('');
                setStreet('');
                setCity('');
                setState('');
                setPostalCode('');
                setStreetNumber('');
                setAddress2('');
                setLocation(null);
                setActionRate(1);
                setCurrentLocation({ lat: 41.5421100, lng: 2.4445000 });
              }
            }}
            className="flex-row w-full justify-start pl-4 items-center mt-1"
          >
            <Text className="mr-5 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]">{t('unlocated_service')}</Text>
            <View
              style={[
                styles.checkbox,
                { borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E' },
                isUnlocated && {
                  backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                  borderWidth: 0
                }
              ]}
            >
              {isUnlocated && (
                <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
              )}
            </View>
          </TouchableOpacity>



        </View>

        <View className="flex-row justify-center items-center">

          <TouchableOpacity
            disabled={false}
            onPress={() => navigation.navigate('CreateServiceDetails', { prevParams: { ...prevParams, isUnlocated, direction, country, street, city, state, postalCode, streetNumber, address2, location, actionRate } })}
            style={{ opacity: 1 }}
            className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
            <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canContinue}
            onPress={() => navigation.navigate('CreateServiceExperiences', { prevParams: { ...prevParams, isUnlocated, direction, country, street, city, state, postalCode, streetNumber, address2, location, actionRate } })}
            style={{ opacity: canContinue ? 1.0 : 0.5 }}
            className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
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

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
    borderRadius: 4,
  },
});
