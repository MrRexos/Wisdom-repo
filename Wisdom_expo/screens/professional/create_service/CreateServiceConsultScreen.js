import React, { useEffect, useState, useRef } from 'react'
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import { Edit3 } from 'react-native-feather';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';


export default function CreateServiceConsultScreen() {

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, priceValue, allowDiscounts, discountRate, allowAsk, allowConsults: prevAllowConsults, consultPrice: prevConsultPrice, consultVia: prevConsultVia } = prevParams;

  const allowConsultsDefault = prevAllowConsults ?? true;
  const [allowConsults, setAllowConsults] = useState(allowConsultsDefault);
  const [typeSelected, setTypeSelected] = useState(allowConsultsDefault ? 1 : 0);

  let defaultConsultPriceText;
  let defaultConsultPrice;
  if (!allowConsultsDefault) {
    defaultConsultPriceText = '';
    defaultConsultPrice = null;
  } else if (prevConsultPrice === undefined) {
    defaultConsultPriceText = '5';
    defaultConsultPrice = 5;
  } else if (prevConsultPrice === null) {
    defaultConsultPriceText = '';
    defaultConsultPrice = null;
  } else {
    defaultConsultPriceText = String(prevConsultPrice);
    defaultConsultPrice = prevConsultPrice;
  }

  const [consultPriceText, setConsultPriceText] = useState(defaultConsultPriceText);
  const [consultPrice, setConsultPrice] = useState(defaultConsultPrice);
  const [consultVia, setConsultVia] = useState(() => {
    if (typeof prevConsultVia === 'string') return prevConsultVia;
    if (prevConsultVia && typeof prevConsultVia === 'object') {
      const { provider, username, url } = prevConsultVia;
      return [provider, username, url].find((value) => typeof value === 'string' && value.trim().length > 0) || '';
    }
    return '';
  });
  const inputRef = useRef(null);

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
      allowConsults,
      consultPrice,
      consultVia,
    },
    t,
  });

  const consultViaValue = typeof consultVia === 'string' ? consultVia : '';

  const canContinue = !allowConsults || (
    consultViaValue.trim().length > 0 &&
    consultPrice != null &&
    !Number.isNaN(consultPrice) &&
    consultPrice > 0
  );



  const options = [
    {
      label: t('dont_allow_consults'),
      value: false,
    },
    {
      label: t('allow_consults'),
      value: true,
    },
  ]


  const inputPriceChanged = (text) => {
    setConsultPriceText(text);
    const parsed = parseInt(text, 10);
    setConsultPrice(text === '' || isNaN(parsed) ? null : parsed);
  };

  const inputViaChanged = (text) => {
    setConsultVia(text);
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

        <View className="flex-1 px-6 pt-5 pb-6">

          <ServiceFormHeader
            onBack={requestBack}
            onSave={handleSave}
            showSave={isEditing && hasChanges}
            saving={saving}
          />

          <View className=" justify-center items-center ">
            <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('allow_consults')}</Text>
            <Text className="mt-5 font-inter-bold text-[14px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('allows_clients_to_book_personalized_consultations')}</Text>
          </View>

          <View className="flex-1 px-5 pt-[80px] justify-start items-start">

            {options.map(({ label, value }, index) => {
              const isActive = typeSelected === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setTypeSelected(index);
                    setAllowConsults(value);
                    if (!value) {
                      setConsultPriceText('');
                      setConsultPrice(null);
                      setConsultVia('');
                    } else {
                      if (consultPrice == null || consultPriceText === '') {
                        setConsultPrice(5);
                        setConsultPriceText('5');
                      }
                    }
                  }}
                  className={isActive ? `mb-5 p-5 pr-7 w-full justify-start items-start rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-5 p-5 pr-7 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                >
                  <View className="flex-row w-full items-center">
                    <View className="mr-5 p-[3px] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                      {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]" />)}
                    </View>
                    <Text className={isActive ? `font-inter-medium text-[14px] text-[#515150] dark:text-[#d4d4d3]` : `font-inter-medium text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{label}</Text>
                  </View>

                  {index === 1 && (

                    <View className="justify-center items-center w-full">

                      <TouchableOpacity disabled={typeSelected !== 1} onPress={() => inputRef.current?.focus()} className="justify-center items-center w-full">
                        <View className="ml-10 mt-3 flex-row items-end">

                          <TextInput
                            placeholder="X"
                            selectionColor={cursorColorChange}
                            placeholderTextColor={placeholderTextColorChange}
                            onChangeText={inputPriceChanged}
                            value={consultPriceText}
                            ref={inputRef}
                            keyboardType="number-pad"
                            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                            className={isActive ? `font-inter-bold text-[16px] text-[#323131] dark:text-[#fcfcfc]` : `font-inter-bold text-[16px]  text-[#b6b5b5] dark:text-[#706f6e]`}
                          />

                          <Text className={isActive ? `font-inter-bold text-[16px] text-[#323131] dark:text-[#fcfcfc]` : `font-inter-bold text-[16px]  text-[#b6b5b5] dark:text-[#706f6e]`}> €{t('per_15_minutes')}</Text>

                          {typeSelected === 1 && (
                            <TouchableOpacity onPress={() => inputRef.current?.focus()} className="ml-1">
                              <Edit3 width={20} height={18} color={'#706F6E'} strokeWidth={1.9} />
                            </TouchableOpacity>
                          )}

                        </View>
                      </TouchableOpacity>

                      {typeSelected === 1 && (
                        <View className="justify-center items-start w-full mt-2">

                          <Text className={isActive ? `font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]` : `font-inter-semibold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{t('via')}</Text>

                          <View className="rounded-full w-full mt-3  px-4 bg-[#fcfcfc] dark:bg-[#323131]">
                            <TextInput
                              placeholder={t('example_zoom_meet_in_person')}
                              selectionColor={cursorColorChange}
                              placeholderTextColor={placeholderTextColorChange}
                              onChangeText={inputViaChanged}
                              value={consultVia}
                              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                              className={isActive ? `font-inter-medium py-3 text-[12px] text-[#323131] dark:text-[#fcfcfc]` : `font-inter-bold text-[16px]  text-[#b6b5b5] dark:text-[#706f6e]`}
                            />

                          </View>
                        </View>
                      )}
                    </View>
                  )}

                </TouchableOpacity>
              );
            })}

          </View>

          <View className="flex-row justify-center items-center">

            <TouchableOpacity
              disabled={false}
              onPress={() =>
                navigation.navigate('CreateServiceAsk', {
                  prevParams: {
                    ...prevParams,
                    allowConsults,
                    consultPrice: allowConsults ? consultPrice : null,
                    consultVia: allowConsults ? consultVia : '',
                  },
                })
              }
              style={{ opacity: 1 }}
              className={`bg-[#e0e0e0] dark:bg-[#3d3d3d] h-[55px] rounded-full items-center justify-center ${isEditing ? 'w-full' : 'w-1/4'
                }`}
            >
              <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
            </TouchableOpacity>

            {!isEditing && (
              <TouchableOpacity
                disabled={!canContinue}
                onPress={() => {
                  navigation.navigate('CreateServiceTerms', {
                    prevParams: {
                      ...prevParams,
                      allowConsults,
                      consultPrice: allowConsults ? consultPrice : null,
                      consultVia: allowConsults ? consultVia : '',
                    },
                  });
                }}
                style={{ opacity: canContinue ? 1 : 0.5 }}
                className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center"
              >
                <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
        <ServiceFormUnsavedModal
          visible={confirmVisible}
          onSave={handleConfirmSave}
          onDiscard={handleDiscardChanges}
          onDismiss={handleDismissConfirm}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}