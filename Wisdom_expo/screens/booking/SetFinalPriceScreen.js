import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, Platform, View, Text, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import Slider from '@react-native-community/slider';
import { Edit3 } from 'react-native-feather';
import api from '../../utils/api';

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

    // Para hourly: selector con Slider (mismo criterio que BookingDetails)
    const [sliderValue, setSliderValue] = useState(12);
    const [selectedDuration, setSelectedDuration] = useState(60);

    useEffect(() => {
        const load = async () => {
            try {
                const resp = await api.get(`/api/bookings/${bookingId}`);
                setBooking(resp.data);
                const sresp = await api.get(`/api/services/${resp.data.service_id}`);
                setService(sresp.data);
                // Inicializar duración con la que tenga la reserva si existe
                if (resp.data.service_duration) {
                    const minutes = parseInt(resp.data.service_duration);
                    setSelectedDuration(minutes);
                    setSliderValue(minutesToSliderValue(minutes));
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

    const formatUpTo2 = (n) => {
        const x = Number(n);
        if (!Number.isFinite(x)) return '0';
        return x
            .toFixed(2)
            .replace(/\.0+$/, '')
            .replace(/(\.\d)0$/, '$1')
            .replace(/\.$/, '');
    };

    const format1 = (n) => {
        const x = Number(n);
        if (!Number.isFinite(x)) return '0.0';
        return x.toFixed(1);
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
    const unit = Number.parseFloat(service?.price) || 0; // precio por hora si hourly

    // Hourly helpers (mismos tramos que BookingDetails)
    const sliderValueToMinutes = (value) => {
        if (value <= 12) return value * 5;
        else if (value <= 18) return 60 + (value - 12) * 10;
        else if (value <= 26) return 120 + (value - 18) * 15;
        return 240 + (value - 26) * 30;
    };
    const minutesToSliderValue = (minutes) => {
        if (minutes <= 60) return minutes / 5;
        else if (minutes <= 120) return 12 + (minutes - 60) / 10;
        else if (minutes <= 240) return 18 + (minutes - 120) / 15;
        return 26 + (minutes - 240) / 30;
    };

    const onSliderChange = (value) => {
        setSliderValue(value);
        setSelectedDuration(sliderValueToMinutes(value));
    };

    const formatHMh = (minutes) => {
        const total = Math.max(0, Math.round(Number(minutes) || 0));
        const h = Math.floor(total / 60);
        const m = total % 60;
        return m === 0 ? `${h}h` : `${h}:${String(m).padStart(2, '0')}h`;
    };

    const hourlyPricing = useMemo(() => {
        if (priceType !== 'hour') return { base: 0, commission: 0, final: 0 };
        const minutes = Math.max(0, Math.round(Number(selectedDuration) || 0));
        const hours = minutes / 60;
        let base = round2(unit * hours);
        const commission = Math.max(1, round1(base * 0.1));
        const final = round2(base + commission);
        return { base, commission, final, minutes };
    }, [priceType, unit, selectedDuration]);

    const budgetPricing = useMemo(() => {
        if (priceType !== 'budget') return { base: 0, commission: 1, final: 1 };
        const base = Number.parseFloat(priceValue) || 0;
        const commission = 1;
        const final = round2(base + commission);
        return { base: round2(base), commission, final };
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
                    final_price: budgetPricing.final,
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

    if (loading) return null;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
                <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
                <View className="flex-1 px-6 pt-5 pb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <View className="flex-row justify-start">
                            <XMarkIcon size={30} color={colorScheme === 'dark' ? '#706F6E' : '#B6B5B5'} strokeWidth={1.7} />
                        </View>
                    </TouchableOpacity>

                    <View className="justify-center items-center ">
                        <Text className="mt-[35px] font-inter-bold text-[22px] text-center text-[#444343] dark:text-[#f2f2f2]">
                            {priceType === 'budget' ? t('indicate_final_price') : t('indicate_duration_and_price')}
                        </Text>
                        <Text className="mt-2 font-inter-medium text-[13px] text-center text-[#979797] dark:text-[#706f6e]">
                            {service?.service_title || ''}
                        </Text>
                    </View>

                    {priceType === 'budget' ? (
                        <View className="flex-1 px-9 justify-center items-center">
                            <View className="flex-row justify-center items-center">
                                <TextInput
                                    placeholder="X"
                                    selectionColor={colorScheme === 'dark' ? '#f2f2f2' : '#444343'}
                                    placeholderTextColor={'#979797'}
                                    onChangeText={inputChanged}
                                    value={priceValue}
                                    ref={inputRef}
                                    keyboardType="decimal-pad"
                                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                                    className=" font-inter-bold text-right text-[50px] text-[#323131] dark:text-[#fcfcfc]"
                                />
                                <Text className={`font-inter-bold text-right text-[50px] ${priceValue ? 'text-[#323131] dark:text-[#fcfcfc]' : 'text-[#979797]'}`}> {currencySymbols[currency] || '€'}</Text>
                                <TouchableOpacity onPress={() => inputRef.current?.focus()} className="ml-5">
                                    <Edit3 size={30} color={'#706F6E'} strokeWidth={2} />
                                </TouchableOpacity>
                            </View>

                            {priceValue ? (
                                <View className="pb-7 px-2 justify-center items-center">
                                    <TouchableOpacity onPress={() => setShowDetails(!showDetails)} className="flex-row justify-center items-center">
                                        <Text className="mr-3 font-inter-semibold text-center text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('the_client_pays')} {formatUpTo2(budgetPricing.final)} {currencySymbols[currency] || '€'}</Text>
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
                                                <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatUpTo2(budgetPricing.base)} {currencySymbols[currency] || '€'}</Text>
                                            </View>
                                            <View className="mt-6 flex-row">
                                                <Text className="font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('quality_commission')}</Text>
                                                <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                                                <Text className="text-[14px] font-inter-semibold text-[#74a450]">+{format1(budgetPricing.commission)} {currencySymbols[currency] || '€'}</Text>
                                            </View>
                                            <View className="mt-6 mb-6 flex-row">
                                                <Text className="font-inter-medium  text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{t('client_final_price')}</Text>
                                                <Text numberOfLines={1} className="flex-1 font-inter-medium text-[14px] text-[#b6b5b5] dark:text-[#706f6e]">{'.'.repeat(80)}</Text>
                                                <Text className="font-inter-semibold text-[14px] text-[#323131] dark:text-[#fcfcfc]">{formatUpTo2(budgetPricing.final)} {currencySymbols[currency] || '€'}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        // Hourly
                        <View className="flex-1 px-6 justify-center items-center">
                            <Text className="mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]">{t('duration')}: {formatHMh(selectedDuration)}</Text>
                            <View className="w-full px-4">
                                <Slider
                                    style={{ width: '100%', height: 10 }}
                                    minimumValue={1}
                                    maximumValue={34}
                                    step={1}
                                    minimumTrackTintColor="#b6b5b5"
                                    maximumTrackTintColor="#474646"
                                    value={sliderValue}
                                    onValueChange={onSliderChange}
                                />
                            </View>
                            <View className="mt-10 px-3 w-full">
                                <View className='flex-row'>
                                    <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>{t('service_price')} x {formatHMh(hourlyPricing.minutes)}</Text>
                                    <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                                        {'.'.repeat(80)}
                                    </Text>
                                    <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                                        {formatCurrency(hourlyPricing.base)}
                                    </Text>
                                </View>
                                <View className='mt-3 flex-row'>
                                    <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>{t('quality_commission')}</Text>
                                    <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                                        {'.'.repeat(80)}
                                    </Text>
                                    <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                                        {formatCurrency(hourlyPricing.commission)}
                                    </Text>
                                </View>
                                <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]' />
                                <View className='mt-4 flex-row'>
                                    <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>{t('final_price')}</Text>
                                    <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                                        {'.'.repeat(80)}
                                    </Text>
                                    <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                                        {formatCurrency(hourlyPricing.final)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View className="px-2">
                        <TouchableOpacity onPress={onAccept} className="mt-8 mb-4 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]">
                            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('accept')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}


