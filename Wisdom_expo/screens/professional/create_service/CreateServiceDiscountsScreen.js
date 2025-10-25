import React, { useEffect, useState } from 'react'
import {View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';


export default function CreateServiceDiscountsScreen() {

  const {colorScheme, toggleColorScheme} = useColorScheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const placeholderTextColorChange = colorScheme === 'dark' ? '#979797' : '#979797';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate, experiences, serviceImages, priceType, priceValue } = prevParams;
  const allowDiscountsDefault = prevParams.allowDiscounts ?? true;
  const [allowDiscounts, setAllowDiscounts] = useState(allowDiscountsDefault);
  const [typeSelected, setTypeSelected] = useState(allowDiscountsDefault ? 1 : 0);
  const [discountRate, setDiscountRate] = useState(prevParams.discountRate ?? 10);
  const [discountRateText, setDiscountRateText] = useState(String(prevParams.discountRate ?? 10));

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
  } = useServiceFormEditing({ prevParams, currentValues: { allowDiscounts, discountRate }, t });


  const options  = [
    {
        label: t('dont_add_discounts'),
        value: false,
    },
    {
        label: t('add_discounts_for_recurrent_bookings'),
        value: true,
    },
  ]
  

  const inputChanged = (text) => {
    setDiscountRateText(text);
    setDiscountRate(parseInt(text));
  };


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style = {colorScheme=='dark'? 'light': 'dark'}/>
        
        <View className="flex-1 px-6 pt-5 pb-6">

            <ServiceFormHeader
              onBack={requestBack}
              onSave={handleSave}
              showSave={isEditing && hasChanges}
              saving={saving}
            />

            <View className=" justify-center items-center ">
              <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('allow_discounts')}</Text>
            </View>

            <View className="flex-1 px-5 pt-[80px] justify-start items-start">

                {options.map(({label, value}, index) => {
                    const isActive = typeSelected === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {setTypeSelected(index); setAllowDiscounts(value)}}
                            className={isActive? `mb-5 p-5 pr-7 w-full   rounded-xl bg-[#e0e0e0] dark:bg-[#3d3d3d] border-[1px] border-[#b6b5b5] dark:border-[#706f6e]` : `mb-5 p-5 pr-7 justify-start items-start w-full rounded-xl border-[1px] border-[#b6b5b5] dark:border-[#706f6e]`}
                            >
                            <View className="flex-row w-full items-center">
                                <View className="mr-5 p-[3px] h-5 w-5 rounded-full border-[1px] border-[#b6b5b5] dark:border-[#706f6e]">
                                    {isActive && (<View className="flex-1 rounded-full bg-[#515150] dark:bg-[#d4d4d3]"/>)}
                                </View>
                                <Text className={isActive? `font-inter-medium text-[14px] text-[#515150] dark:text-[#d4d4d3]`: `font-inter-medium text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{label}</Text>
                            </View>

                            {index===1 && (
                              <View className="ml-10 mt-3 flex-row">
                                <Text className={isActive? `font-inter-bold text-[14px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>-</Text>
                                <TextInput
                                  placeholder="X"
                                  selectionColor={cursorColorChange}
                                  placeholderTextColor={placeholderTextColorChange}
                                  onChangeText={inputChanged}
                                  editable={false}
                                  value={discountRateText}
                                  keyboardType="numeric"
                                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                                  className={isActive? `font-inter-bold text-[14px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}
                                />
                                <Text className={isActive? `font-inter-bold text-[14px] text-[#323131] dark:text-[#fcfcfc]`: `font-inter-bold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>%</Text>
                                <Text numberOfLines={1} className={isActive? `font-inter-medium flex-1 text-[14px] text-[#979797] `: `font-inter-medium flex-1 text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{'.'.repeat(80)}</Text>
                                <Text className={isActive? `font-inter-semibold text-[14px] text-[#979797] `: `font-inter-semibold text-[14px]  text-[#b6b5b5] dark:text-[#706f6e]`}>{priceValue? priceValue-(priceValue*0.1).toFixed(1): 'X'} €</Text>
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
                priceType === 'budget'
                  ? navigation.navigate('CreateServicePriceType', { prevParams: { ...prevParams, allowDiscounts, discountRate } })
                  : navigation.navigate('CreateServicePrice', { prevParams: { ...prevParams, allowDiscounts, discountRate } })
              }
              style={{opacity: 1}}
              className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center" >
                  <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
              </TouchableOpacity>

            <TouchableOpacity
              disabled={false}
              onPress={() => {navigation.navigate('CreateServiceAsk', { prevParams: { ...prevParams, allowDiscounts, discountRate } })}}
              style={{opacity: 1}}
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