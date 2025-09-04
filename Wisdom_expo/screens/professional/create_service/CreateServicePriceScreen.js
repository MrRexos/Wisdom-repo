import React, { useEffect, useState, useRef } from 'react';
import { View, StatusBar, SafeAreaView, Platform, TouchableOpacity, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { Edit3 } from 'react-native-feather';

export default function CreateServicePriceScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, priceValue: prevPrice } = prevParams;
  const [priceValue, setPriceValue] = useState(prevPrice || '10');
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef(null);

  // Helpers y pricing (mismo criterio que BookingScreen)
  const round1 = (x) => Number((Math.round(Number(x) * 10) / 10).toFixed(1));
  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round((x + Number.EPSILON) * 100) / 100;
  };

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    MAD: 'د.م.',
    RMB: '¥',
  };

  const formatCurrency = (value, currency = 'EUR') => {
    if (value === null || value === undefined) return '';
    const symbol = (typeof currencySymbols === 'object' && currencySymbols[currency]) ? currencySymbols[currency] : '€';

    const n = Number(value);
    if (!Number.isFinite(n)) return '';

    const s = n.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    const unitSymbol = priceType === 'hour' ? `${symbol}/h` : symbol;
    return `${s} ${unitSymbol}`;
  };


  const computePricing = (unitStr) => {
    const type = priceType;
    const unit = Number.parseFloat(unitStr) || 0;
    let base = round2(unit);
    const commission = type === 'budget' ? 1 : Math.max(1, round1(base * 0.1));
    const final = type === 'budget' ? commission : round2(base + commission);
    return { base, commission, final };
  };

  // Limitar entrada a 2 decimales y un único punto
  const inputChanged = (text) => {
    if (typeof text !== 'string') {
      setPriceValue('');
      return;
    }
    let normalized = text.replace(',', '.');
    // solo dígitos y puntos
    normalized = normalized.replace(/[^0-9.]/g, '');
    // un solo punto
    const parts = normalized.split('.');
    if (parts.length > 2) {
      normalized = parts[0] + '.' + parts.slice(1).join('');
    }
    // limitar a 2 decimales
    const segs = normalized.split('.');
    if (segs.length === 2) {
      const intPart = segs[0];
      const decPart = segs[1].slice(0, 2);
      normalized = (intPart ? intPart : '0') + '.' + decPart;
    } else if (segs.length === 1) {
      normalized = segs[0];
    }
    setPriceValue(normalized);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

        <View className="flex-1 px-6 pt-5 pb-6">
          <TouchableOpacity onPress={() => navigation.pop(10)}>
            <View className="flex-row justify-start">
              <XMarkIcon size={30} color={iconColor} strokeWidth={1.7} />
            </View>
          </TouchableOpacity>

          <View className=" justify-center items-center ">
            <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('price')}</Text>
          </View>

          <View className="flex-1 px-9 justify-center items-center">
            <View className="flex-row justify-center items-center">
              <TextInput
                placeholder="X"
                selectionColor={cursorColorChange}
                placeholderTextColor={placeholderTextColorChange}
                onChangeText={inputChanged}
                value={priceValue}
                ref={inputRef}
                keyboardType="decimal-pad"
                keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                className=" font-inter-bold text-right text-[50px] text-[#323131] dark:text-[#fcfcfc]"
              />
              <Text className={`font-inter-bold text-right text-[50px] ${priceValue ? 'text-[#323131] dark:text-[#fcfcfc]' : 'text-[#979797]'}`}> {priceType === 'hour' ? '€/h' : '€'}</Text>
              <TouchableOpacity onPress={() => inputRef.current?.focus()} className="ml-5">
                <Edit3 size={30} color={'#706F6E'} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {priceValue && (
            <View className="pb-7 px-8 justify-center items-center">
              <TouchableOpacity onPress={() => setShowDetails(!showDetails)} className="flex-row justify-center items-center">
                <Text className="mr-3 font-inter-semibold text-center text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('the_client_pays')} {formatCurrency(computePricing(priceValue).final)}</Text>
                {showDetails ? (
                  <ChevronUpIcon size={15} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} strokeWidth={2.5} />
                ) : (
                  <ChevronDownIcon size={15} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
              {showDetails && (
                <View className="justify-center items-start w-full">

                  <View className="mt-8 flex-row">
                    <Text className="font-inter-medium  text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('you_recibes')}</Text>
                    <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                    <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatCurrency(computePricing(priceValue).base)}</Text>
                  </View>

                  <View className="mt-6 flex-row">
                    <Text className="font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('quality_commission')}</Text>
                    <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                    <Text className="text-[14px] font-inter-semibold text-[#74a450]">+{formatCurrency(computePricing(priceValue).commission)}</Text>
                  </View>


                  <View className="mt-6 mb-6 flex-row">
                    <Text className="font-inter-medium  text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('client_final_price')}</Text>
                    <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                    <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatCurrency(computePricing(priceValue).final)}</Text>
                  </View>

                </View>
              )}
            </View>
          )}

          <View className="flex-row justify-center items-center">
            <TouchableOpacity
              disabled={false}
              onPress={() => navigation.navigate('CreateServicePriceType', { prevParams: { ...prevParams, priceValue } })}
              style={{ opacity: 1 }}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center"
            >
              <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!priceValue}
              onPress={() => navigation.navigate('CreateServiceDiscounts', { prevParams: { ...prevParams, priceValue } })}
              style={{ opacity: priceValue ? 1.0 : 0.5 }}
              className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center"
            >
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
