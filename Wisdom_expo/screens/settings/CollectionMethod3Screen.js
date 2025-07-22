import React, { useState, useRef } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, ScrollView, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import Triangle from '../../assets/triangle';

export default function CollectionMethod3Screen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { fullName, dni, dateOfBirth, iban } = route.params;
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [country, setCountry] = useState('');
  const countryBtnRef = useRef(null);
  const [countryAnchor, setCountryAnchor] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');

  const countries = [
    'US','CA','GB','ES','FR','DE','IT','NL','BE','PT','CH','AT','IE','DK','SE','NO','FI','PL','CZ','SK','HU','RO','BG','HR','SI','GR','CY','MT','LU','LT','LV','EE','AU','NZ','SG','HK','JP','KR','IN','MY','TH','VN','ID','PH','AE','SA','IL','BR','MX','AR'
  ];

  const openCountryDropdown = () => {
    countryBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setCountryAnchor({ x: pageX, y: pageY, width, height });
    });
    setShowCountryDropdown(!showCountryDropdown);
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity className="py-3" onPress={() => { setCountry(item); setShowCountryDropdown(false); }}>
      <Text className="ml-6 text-[15px] text-[#444343] dark:text-[#f2f2f2]">
        {t(`countries.${item}`)}
      </Text>
    </TouchableOpacity>
  );

  const dropdownTop = (anchor) => (anchor ? anchor.y + anchor.height : 0);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        <ScrollView contentContainerStyle={{flexGrow:1}}>
        <View className="flex-1 px-6 pt-5 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View className="flex-row justify-start">
                    <ChevronLeftIcon size={25} color={iconColor} strokeWidth={2} />
                </View>
            </TouchableOpacity>
            <View className="justify-center items-center">
              <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('confirm_your_direction')}</Text>
            </View>
            <View className="px-2 mt-10">
              <TouchableOpacity
                ref={countryBtnRef}
                onPress={openCountryDropdown}
                className="w-full h-[55px] mb-4 py-2 px-6 flex-row justify-between items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]"
              >
                <View>
                  {country.length>0 && <Text className="pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('country_region')}</Text>}
                  <Text className="font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                    {country ? t(`countries.${country}`) : t('country_region') + '...'}
                  </Text>
                </View>
                {showCountryDropdown ? (
                  <ChevronUpIcon size={20} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
                ) : (
                  <ChevronDownIcon size={20} color={colorScheme === 'dark' ? '#f2f2f2' : '#444343'} strokeWidth={2} />
                )}
              </TouchableOpacity>

              {showCountryDropdown && countryAnchor && (
                <View
                  style={{ position: 'absolute', top: dropdownTop(countryAnchor), left: countryAnchor.x, width: countryAnchor.width, zIndex: 1000 }}
                  className="justify-center items-center mt-2"
                >
                  <View className="flex-row w-full justify-end pr-5">
                    <Triangle fill={colorScheme === 'dark' ? '#3D3D3D' : '#E0E0E0'} width={30} height={14} />
                  </View>
                  <View className="w-full h-[190px] bg-[#E0E0E0] dark:bg-[#3D3D3D] rounded-xl px-2 pt-3">
                    <FlatList
                      data={countries}
                      renderItem={renderCountryItem}
                      keyExtractor={(item) => item}
                      showsVerticalScrollIndicator
                    />
                  </View>
                </View>
              )}

              <View className="w-full h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {state.length>0 && <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('state')}</Text>}
                <TextInput
                  placeholder={t('state') + '...'}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={setState}
                  value={state}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                />
              </View>

              <View className="w-full h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {city.length>0 && <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('city_town')}</Text>}
                <TextInput
                  placeholder={t('city_town') + '...'}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={setCity}
                  value={city}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                />
              </View>

              <View className="w-full h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {street.length>0 && <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('street')}</Text>}
                <TextInput
                  placeholder={t('street') + '...'}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={setStreet}
                  value={street}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                />
              </View>
              <View className="flex-row w-full justify-between items-center">
                <View className="flex-1 h-[55px] mr-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                  {postalCode.length>0 && <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('postal_code')}</Text>}
                  <TextInput
                    placeholder={t('postal_code') + '...'}
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeHolderTextColorChange}
                    onChangeText={setPostalCode}
                    value={postalCode}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                  />
                </View>
                <View className="flex-1 h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                  {streetNumber.length>0 && <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('street_number')}</Text>}
                  <TextInput
                    placeholder={t('street_number') + '...'}
                    selectionColor={cursorColorChange}
                    placeholderTextColor={placeHolderTextColorChange}
                    onChangeText={setStreetNumber}
                    value={streetNumber}
                    keyboardType="number-pad"
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                  />
                </View>
              </View>
              <View className="w-full h-[55px] mb-10 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                {address2.length>0 && <Text className=" pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]">{t('floor_door_stair_optional')}</Text>}
                <TextInput
                  placeholder={t('floor_door_stair_optional') + '...'}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={setAddress2}
                  value={address2}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                />
              </View>
            </View>
            <View className="flex-row justify-center items-center pb-10">
              <TouchableOpacity
              disabled={false}
              onPress={() => navigation.goBack()}
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
              disabled={streetNumber.length < 1}
              onPress={() => navigation.navigate('CollectionMethod4', { fullName, dni, dateOfBirth, iban, country, state, city, street, postalCode, streetNumber, address2 })}
              style={{opacity: streetNumber.length < 1 ? 0.5 : 1.0}}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
    </SafeAreaView>
  );
}
