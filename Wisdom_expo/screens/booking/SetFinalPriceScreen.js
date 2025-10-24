import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, Platform, View, Text, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { Edit3 } from 'react-native-feather';
import api from '../../utils/api';
import { getDataLocally } from '../../utils/asyncStorage';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';

export default function SetFinalPriceScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params || {};

  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Para budget: entrada manual tipo CreateServicePrice
  const [priceValue, setPriceValue] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef(null);

  // Para hourly: duración seleccionada manualmente
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const hoursInputRef = useRef(null);
  const minutesInputRef = useRef(null);
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get(`/api/bookings/${bookingId}`);
        setBooking(resp.data);
        let viewerId;
        try {
          const storedUser = await getDataLocally('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.id) viewerId = parsedUser.id;
          }
        } catch (storageError) {
          console.error('Error retrieving local user data:', storageError);
        }

        const config = viewerId ? { params: { viewerId } } : {};
        const sresp = await api.get(`/api/services/${resp.data.service_id}`, config);
        setService(sresp.data);
        // Inicializar duración con la que tenga la reserva si existe
        if (resp.data.service_duration) {
          const minutes = parseInt(resp.data.service_duration);
          setSelectedDuration(minutes);
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          setDurationHours(h > 0 ? String(h) : '');
          setDurationMinutes(m > 0 ? String(m) : '');
        }
        // Inicializar valor de precio si hubiera
        if (resp.data.final_price) setPriceValue(String(resp.data.final_price));
      } catch (e) {
        console.error('Error fetching booking/service:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  const round1 = (x) => Number((Math.round(Number(x) * 10) / 10).toFixed(1));
  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round((x + Number.EPSILON) * 100) / 100;
  };

  const currency = service?.currency || 'EUR';

  const currencySymbols = { EUR: '€', USD: '$', MAD: 'د.م.', RMB: '¥' };
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    const symbol = currencySymbols[currency] || '€';
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    const s = n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${s} ${symbol}`;
  };

  const priceType = service?.price_type;
  const unit = Number.parseFloat(service?.price) || 0;

  // Actualizar duración desde inputs inline
  const updateDuration = (hoursString, minutesString) => {
    const rawH = (hoursString ?? '').replace(/[^0-9]/g, '');
    const rawM = (minutesString ?? '').replace(/[^0-9]/g, '');
    const hStr = rawH;
    const mStr = rawM === '' ? '' : String(Math.min(59, parseInt(rawM, 10)));
    setDurationHours(hStr);
    setDurationMinutes(mStr);
    const hNum = hStr === '' ? 0 : parseInt(hStr, 10);
    const mNum = mStr === '' ? 0 : parseInt(mStr, 10);
    const total = hNum * 60 + mNum;
    if (total <= 0) {
      setSelectedDuration(null);
      setShowDetails(false);
    } else {
      setSelectedDuration(total);
      setShowDetails(false);
    }
  };

  const formatHMh = (minutes) => {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m === 0 ? `${h}h` : `${h}:${String(m).padStart(2, '0')}h`;
  };

  const hasDuration = selectedDuration != null && Number(selectedDuration) > 0;

  const hourlyPricing = useMemo(() => {
    if (priceType !== 'hour') return { base: 0, commission: 0, final: 0 };
    if (!hasDuration) return { base: 0, commission: 0, final: 0, minutes: 0 };
    const minutes = Math.max(0, Math.round(Number(selectedDuration) || 0));
    const hours = minutes / 60;
    let base = round2(unit * hours);
    const commission = Math.max(1, round1(base * 0.1));
    const final = round2(base + commission);
    return { base, commission, final, minutes };
  }, [priceType, unit, selectedDuration, hasDuration]);

  const budgetPricing = useMemo(() => {
    if (priceType !== 'budget') return { base: 0, commission: 0, final: 0 };
    const base = round2(Number.parseFloat(priceValue) || 0);
    const commission = Math.max(1, round1(base * 0.1));
    const final = round2(base + commission);
    return { base, commission, final };
  }, [priceType, priceValue]);

  const inputChanged = (text) => {
    if (typeof text !== 'string') {
      setPriceValue('');
      return;
    }
    let normalized = text.replace(',', '.');
    normalized = normalized.replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    if (parts.length > 2) normalized = parts[0] + '.' + parts.slice(1).join('');
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

  const onAccept = async () => {
    try {
      if (!bookingId || !service) return;
      let payload = {};
      if (priceType === 'hour') {
        payload = {
          service_duration: hourlyPricing.minutes,
          final_price: hourlyPricing.final,
        };
      } else if (priceType === 'budget') {
        if (!priceValue) {
          Alert.alert(t('error'), t('please_enter_final_price'));
          return;
        }
        payload = {
          final_price: budgetPricing.base,
        };
      } else {
        // fixed: no debería llegar aquí, pero por seguridad
        return navigation.goBack();
      }
      await api.patch(`/api/bookings/${bookingId}/update-data`, payload);
      navigation.goBack();
    } catch (e) {
      console.error('Error updating final price:', e);
      Alert.alert(t('error'), t('unexpected_error'));
    }
  };

  if (loading) return <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]' />;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
        <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
        <View className="flex-1 px-6 pt-5 pb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View className="flex-row justify-start">
              <XMarkIcon size={30} color={colorScheme === 'dark' ? '#706F6E' : '#B6B5B5'} strokeWidth={1.7} />
            </View>
          </TouchableOpacity>

          <View className="justify-center items-center">
            <Text className="mt-[55px] font-inter-bold text-[25px] text-center text-[#444343] dark:text-[#f2f2f2]">
              {priceType === 'budget' ? t('indicate_final_price') : t('indicate_duration')}
            </Text>
          </View>

          {priceType === 'budget' ? (
            <>
              <View className="flex-1 px-9 justify-center items-center">
                <View className="flex-row justify-center items-center">
                  <TextInput
                    placeholder="X"
                    placeholderTextColor={'#979797'}
                    onChangeText={inputChanged}
                    value={priceValue}
                    ref={inputRef}
                    selectionColor={cursorColorChange}
                    keyboardType="decimal-pad"
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className=" font-inter-bold text-right text-[50px] text-[#323131] dark:text-[#fcfcfc]"
                  />
                  <Text className={`font-inter-bold text-right text-[50px] ${priceValue ? 'text-[#323131] dark:text-[#fcfcfc]' : 'text-[#979797]'}`}> {currencySymbols[currency] || '€'}</Text>
                  <TouchableOpacity onPress={() => inputRef.current?.focus()} className="ml-5">
                    <Edit3 size={30} color={'#706F6E'} strokeWidth={2} />
                  </TouchableOpacity>
                </View>


              </View>
              {priceValue ? (
                <View className="px-8 justify-center items-center">
                  <TouchableOpacity onPress={() => setShowDetails(!showDetails)} className="flex-row justify-center items-center">
                    <Text className="mr-3 font-inter-semibold text-center text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('the_client_pays')} {formatCurrency(budgetPricing.final)}</Text>
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
                        <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatCurrency(budgetPricing.base)}</Text>
                      </View>
                      <View className="mt-6 flex-row">
                        <Text className="font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('quality_commission')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="text-[14px] font-inter-semibold text-[#74a450]">+{formatCurrency(budgetPricing.commission)}</Text>
                      </View>
                      <View className="mt-6 mb-2 flex-row">
                        <Text className="font-inter-medium  text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('client_final_price')}</Text>
                        <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                        <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatCurrency(budgetPricing.final)}</Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}
            </>
          ) : (
            // Hourly
            <>
              <View className="flex-1 px-9 justify-center items-center">
                <View className="flex-row justify-center items-center">
                  <Text className=" font-inter-bold text-right text-[45px] text-[#323131] dark:text-[#fcfcfc]">
                    {hasDuration ? formatCurrency(hourlyPricing.base) : `?? ${currencySymbols[currency] || '€'}`}
                  </Text>
                </View>
                <View className="mt-6 w-full items-center">
                  <View className="flex-row items-center ">
                    <TextInput
                      ref={hoursInputRef}
                      value={durationHours}
                      onChangeText={(v) => updateDuration(v, durationMinutes)}
                      keyboardType="number-pad"
                      textAlign={'right'}
                      placeholder="XX"
                      placeholderTextColor={'#979797'}
                      selectionColor={cursorColorChange}
                      keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                      className="items-stretch font-inter-semibold text-[28px] py-2 rounded-md bg-[#f2f2f2] dark:bg-[#272626] text-[#323131] dark:text-[#fcfcfc]"
                    />
                    <Text className="ml-2 mr-5 font-inter-medium text-[24px] text-[#444343] dark:text-[#f2f2f2]">
                      {parseInt(durationHours || '0', 10) === 1 ? t('hour') : t('hours')}
                    </Text>
                    <TextInput
                      ref={minutesInputRef}
                      value={durationMinutes}
                      onChangeText={(v) => updateDuration(durationHours, v)}
                      keyboardType="number-pad"
                      textAlign={"right"}
                      placeholder="XX"
                      placeholderTextColor={'#979797'}
                      selectionColor={cursorColorChange}
                      keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                      className="items-stretch font-inter-semibold text-[28px] py-2 rounded-md bg-[#f2f2f2] dark:bg-[#272626] text-[#323131] dark:text-[#fcfcfc]"
                    />
                    <Text className="ml-2 font-inter-medium text-[24px] text-[#444343] dark:text-[#f2f2f2]">
                      {parseInt(durationMinutes || '0', 10) === 1 ? t('min') : t('mins')}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="px-8 w-full justify-center items-center">
                {hasDuration && (
                  <>
                    <TouchableOpacity disabled={!hasDuration} onPress={() => setShowDetails(!showDetails)} className="flex-row justify-center items-center">
                      <Text className={`mr-3 font-inter-semibold text-center text-[14px] ${hasDuration ? 'text-[#b6b5b5] dark:text-[#706f6e]' : 'text-[#b6b5b5] opacity-50 dark:text-[#706f6e]'}`}>
                        {t('the_client_pays')} {hasDuration ? formatCurrency(hourlyPricing.final) : '?? €'}
                      </Text>

                      {showDetails ? (
                        <ChevronUpIcon size={15} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} strokeWidth={2.5} />
                      ) : (
                        <ChevronDownIcon size={15} color={colorScheme === 'dark' ? '#706f6e' : '#b6b5b5'} strokeWidth={2.5} />
                      )}

                    </TouchableOpacity>
                    {showDetails && (
                      <View className="justify-center items-start w-full">
                        <View className="mt-8 flex-row">
                          <Text className="font-inter-medium  text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('you_recibes')} x {formatHMh(hourlyPricing.minutes)}</Text>
                          <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                          <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatCurrency(hourlyPricing.base)}</Text>
                        </View>
                        <View className="mt-6 flex-row">
                          <Text className="font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('quality_commission')}</Text>
                          <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                          <Text className="text-[14px] font-inter-semibold text-[#74a450]">+{formatCurrency(hourlyPricing.commission)}</Text>
                        </View>
                        <View className="mt-6 mb-2 flex-row">
                          <Text className="font-inter-medium  text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('client_final_price')}</Text>
                          <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                          <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatCurrency(hourlyPricing.final)}</Text>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Selector inline: sin modal */}
            </>

          )}

          <View className="px-2 mt-7">
            <TouchableOpacity onPress={onAccept} className="bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]">
              <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('accept')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}


