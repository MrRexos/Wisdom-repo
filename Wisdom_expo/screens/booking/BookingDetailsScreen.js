import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Localization from 'expo-localization';
import { View, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert, Image, RefreshControl } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, LockClosedIcon, ClockIcon } from 'react-native-heroicons/outline';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import { Check, Calendar as CalendarIcon, Edit3, Edit2, Plus, Clock, MapPin, CreditCard } from 'react-native-feather';
import SliderThumbDark from '../../assets/SliderThumbDark.png';
import SliderThumbLight from '../../assets/SliderThumbLight.png';
import { getDataLocally, storeDataLocally } from '../../utils/asyncStorage';
import { setDoc, doc, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import api from '../../utils/api.js';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import ModalMessage from '../../components/ModalMessage';

export default function BookingDetailsScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, role } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState({});
  const [selectedDate, setSelectedDate] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [sliderValue, setSliderValue] = useState(12);
  const [paymentMethod, setPaymentMethod] = useState();
  const sliderTimeoutId = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTimeUndefined, setSelectedTimeUndefined] = useState(false);
  const sheet = useRef();
  const [sheetHeight, setSheetHeight] = useState(450);
  const thumbImage = colorScheme === 'dark' ? SliderThumbDark : SliderThumbLight;
  const [refreshing, setRefreshing] = useState(false);
  const [paymentErrorVisible, setPaymentErrorVisible] = useState(false);
  const [sheetOption, setSheetOption] = useState('date');
  const [directions, setDirections] = useState([]);
  const [userId, setUserId] = useState();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [address2, setAddress2] = useState('');
  const [draftDay, setDraftDay] = useState(null);
  const [draftTime, setDraftTime] = useState('');
  const [draftDuration, setDraftDuration] = useState(60);
  const [draftSliderValue, setDraftSliderValue] = useState(12);
  const [draftSelectedDate, setDraftSelectedDate] = useState({});
  const [draftTempDate, setDraftTempDate] = useState(new Date());
  const [draftTimeUndefined, setDraftTimeUndefined] = useState(false);
  const current = editMode ? edited : booking;
  const round1 = (x) => Number((Math.round(Number(x) * 10) / 10).toFixed(1));
  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round((x + Number.EPSILON) * 100) / 100; // máx. 2 decimales
  };
  const pad2 = (n) => String(n).padStart(2, '0');
  const priceSource = service || booking;

  useEffect(() => {
    if (route.params?.paymentError) {
      setPaymentErrorVisible(true);
      navigation.setParams({ paymentError: undefined });
    }
  }, [route.params?.paymentError]);

  useEffect(() => {
    fetchBooking();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const userData = await getDataLocally('user');
        if (userData) {
          const me = JSON.parse(userData);
          setUserId(me.id);
        }
      } catch { }
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSearchedDirection();
    }, [])
  );

  const formatHMh = (minutes) => {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m === 0 ? `${h}h` : `${h}:${String(m).padStart(2, '0')}h`;
  };

  // Divide un "YYYY-MM-DD HH:mm:ss" o "YYYY-MM-DDTHH:mm:ss" a partes sin interpretar zona
  const splitSql = (s) => {
    if (!s) return null;
    const txt = String(s).trim()
      .replace('T', ' ')
      .replace(/\s+/g, ' ')
      // quita sufijo de zona si viene
      .replace(/(?:Z|[+-]\d{2}:?\d{2})$/i, '');
    // admite con o sin segundos y con milis
    const m = txt.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,6})?)?$/);
    if (!m) return null;
    const hh = m[2], mm = m[3], ss = m[4] || '00';
    return { ymd: m[1], hm: `${hh}:${mm}`, hms: `${hh}:${mm}:${ss}` };
  };

  const nowSql = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  };

  const toMs = (sql) => {
    const p = splitSql(sql);
    if (!p) return null;
    const [Y,M,D] = p.ymd.split('-').map(Number);
    const [h,m,s] = p.hms.split(':').map(Number);
    return Date.UTC(Y, M-1, D, h, m, s||0);
  };

  // Suma minutos “en crudo” sin husos: pasamos a UTC SOLO para hacer la suma y volvemos a strings
  const addMinutesNaive = (ymd, hm, minutesToAdd) => {
    const [Y, M, D] = ymd.split('-').map(Number);
    const [h, m] = hm.split(':').map(Number);
    const startMs = Date.UTC(Y, M - 1, D, h, m, 0, 0);
    const end = new Date(startMs + (Number(minutesToAdd) || 0) * 60000);
    const y = end.getUTCFullYear();
    const mon = pad2(end.getUTCMonth() + 1);
    const day = pad2(end.getUTCDate());
    const hh = pad2(end.getUTCHours());
    const mm = pad2(end.getUTCMinutes());
    const ss = pad2(end.getUTCSeconds());
    return { ymd: `${y}-${mon}-${day}`, hm: `${hh}:${mm}`, hms: `${hh}:${mm}:${ss}` };
  };

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      let data = response.data;
      const endMs = data.booking_end_datetime ? toMs(data.booking_end_datetime) : null; 
      const nowNaiveMs = (() => { 
        const d = new Date(); 
        return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()); 
      })(); 
      if (data.booking_status === 'accepted' && endMs && endMs < nowNaiveMs) {
        await api.patch(`/api/bookings/${bookingId}/update-data`, { status: 'completed' });
        data.booking_status = 'completed';
      }
      setBooking(data);
      setEdited(prev => (editMode ? prev : data));
      const serviceResp = await api.get(`/api/services/${data.service_id}`);
      setService(serviceResp.data);
      if (response.data.booking_start_datetime) {
        const p = splitSql(response.data.booking_start_datetime);
        const dateString = p.ymd;
        const timeString = p.hm;
        setSelectedDate({
          [dateString]: {
            selected: true,
            selectedColor: colorScheme === 'dark' ? '#979797' : '#979797',
            selectedTextColor: '#ffffff',
          },
        });
        setSelectedDay(dateString);
        setSelectedTime(timeString);
        // Semilla para el DateTimePicker con la hora recibida 
        const [hh, mm] = timeString.split(':').map(Number); 
        const seed = new Date(); 
        seed.setHours(hh, mm, 0, 0); 
        setTempDate(seed);
        setSelectedTimeUndefined(false);
      } else {
        setSelectedTimeUndefined(true);
      }
      if (response.data.service_duration) {
        const dur = parseInt(response.data.service_duration);
        setSelectedDuration(dur);
        setSliderValue(minutesToSliderValue(dur));
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooking();
    setRefreshing(false);
  };

  useRefreshOnFocus(fetchBooking);

  const onDayPress = (day) => { 
    setDraftSelectedDate({ [day.dateString]: { selected: true, selectedColor: colorScheme === 'dark' ? '#979797' : '#979797', selectedTextColor: '#ffffff' }}); 
    setDraftDay(day.dateString); 
  };

  const handleHourSelected = (event, date) => { 
    const currentDate = date || draftTempDate; 
    setDraftTempDate(currentDate); 
    const h = pad2(currentDate.getHours()); 
    const m = pad2(currentDate.getMinutes()); 
    setDraftTime(`${h}:${m}`); 
    if (Platform.OS === 'android') setShowPicker(false); 
  };

  const handleSliderChange = (value) => {
    if (sliderTimeoutId.current) {
      clearTimeout(sliderTimeoutId.current);
    }
    sliderTimeoutId.current = setTimeout(() => {
      const adjusted = sliderValueToMinutes(value);
      setDraftSliderValue(value);
      setDraftDuration(adjusted);
    }, 100);
  };

  const primeDraftsFromSelected = () => {
    setDraftDay(selectedDay);
    setDraftTime(selectedTime);
    setDraftDuration(selectedDuration ? selectedDuration : 60);
    setDraftSliderValue(sliderValue);
    setDraftSelectedDate(selectedDate);
    setDraftTempDate(tempDate);
    setDraftTimeUndefined(selectedTimeUndefined);
  };
  
  const handleAcceptDate = () => {
    if (draftTimeUndefined) {
      setSelectedTimeUndefined(true);
      setSelectedDay(null);
      setSelectedTime('');
      setSelectedDuration(null);
      setSliderValue(12);
      setSelectedDate({});
    } else {
      setSelectedTimeUndefined(false);
      setSelectedDay(draftDay);
      setSelectedTime(draftTime);
      setSelectedDuration(draftDuration);
      setSliderValue(draftSliderValue);
      setSelectedDate(draftSelectedDate);
      setTempDate(draftTempDate);
    }
    sheet.current.close();
  };

  useEffect(() => {
    const saved = route.params?.savedPaymentMethod;
    if (saved) {
      setPaymentMethod(saved);
      navigation.setParams({ savedPaymentMethod: undefined });
    }
  }, [route.params?.savedPaymentMethod]);

  const loadSearchedDirection = async () => {
    const raw = await getDataLocally('searchedDirection');
    if (raw) {
      const dir = JSON.parse(raw);
      console.log('loadSearchedDirection', dir);
      // Asegura que capturas el id correcto, venga como address_id, direction_id o id
      const addrId = dir.address_id ?? dir.direction_id ?? dir.id ?? null;
      setEdited((prev) => ({
        ...prev,
        address_id: addrId ?? prev?.address_id ?? null,
        address_1: dir.address_1,
        street_number: dir.street_number,
        postal_code: dir.postal_code,
        city: dir.city,
        state: dir.state,
        country: dir.country,
        address_2: dir.address_2,
      }));
      if (addrId) setSelectedAddressId(addrId);
      storeDataLocally('searchedDirection', null);
    }
  };

  const sliderValueToMinutes = (value) => {
    if (value <= 12) {
      return value * 5;
    } else if (value <= 18) {
      return 60 + (value - 12) * 10;
    } else if (value <= 26) {
      return 120 + (value - 18) * 15;
    } else {
      return 240 + (value - 26) * 30;
    }
  };

  const minutesToSliderValue = (minutes) => {
    if (minutes <= 60) {
      return minutes / 5;
    } else if (minutes <= 120) {
      return 12 + (minutes - 60) / 10;
    } else if (minutes <= 240) {
      return 18 + (minutes - 120) / 15;
    } else {
      return 26 + (minutes - 240) / 30;
    }
  };

  const openSheetWithInput = (height) => {
    setSheetHeight(height);
    setTimeout(() => {
      sheet.current.open();
    }, 0);
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

    return `${s} ${symbol}`;
  };

  const pricing = useMemo(() => {
    const type = priceSource?.price_type;
    const unit = Number.parseFloat(priceSource?.price) || 0;
    const minutes = Math.max(0, Math.round(Number(selectedDuration) || 0));
    const hours = minutes / 60;

    let base = 0;
    if (type === 'hour') base = unit * hours;
    else if (type === 'fix') base = unit;
    base = round2(base);


    // En budget el depósito es 1€
    const commission = type === 'budget' ? 1 : Math.max(1, round1(base * 0.1));
    // Si no hay duración (minutes=0) y el tipo es 'hour' o 'budget', final debe ser null
    const shouldNullFinal = (type === 'hour' || type === 'budget') && minutes <= 0;
    const final = shouldNullFinal ? null : (type === 'budget' ? null : round2(base + commission));

    return { base, commission, final, minutes, type, currency: priceSource?.currency };
  }, [priceSource?.price_type, priceSource?.price, selectedDuration]);


  const getFormattedPrice = () => {
    const priceSource = service || booking;
    if (!priceSource) return null;
    const numericPrice = parseFloat(priceSource.price);
    const formattedPrice = numericPrice % 1 === 0 ? numericPrice.toFixed(0) : numericPrice.toFixed(1);
    if (priceSource.price_type === 'hour') {
      return (
        <>
          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
            {formatCurrency(formattedPrice, priceSource.currency)}
          </Text>
          <Text className='font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]'>
            {t('per_hour')}
          </Text>
        </>
      );
    } else if (priceSource.price_type === 'fix') {
      return (
        <>
          <Text className='font-inter-medium text-[13px] text-[#706F6E] dark:text-[#B6B5B5]'>
            {t('fixed_price_prefix')}
          </Text>
          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
            {formatCurrency(formattedPrice, priceSource.currency)}
          </Text>
        </>
      );
    }
    return (
      <Text className='font-inter-bold text-[13px] text-[#706F6E] dark:text-[#B6B5B5]'>
        {t('price_on_budget')}
      </Text>
    );
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours} h ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${minutes} min`;
    }
  };

  const formatDate = (ymd) => { 
    // Solo para nombre de día/mes; no afecta a los números que muestras 
    const [Y,M,D] = String(ymd).split('-').map(Number); 
    const d = new Date(Date.UTC(Y, (M||1)-1, D||1)); 
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }); 
  };

  const getEndTime = () => addMinutesNaive('1970-01-01', selectedTime, selectedDuration).hm;

  const combineDateTime = () => `${selectedDay} ${selectedTime}:00`;

  const calculateEndDateTime = () => {
    const { ymd, hms } = addMinutesNaive(selectedDay, selectedTime, selectedDuration);
    return `${ymd} ${hms}`;
  };

  // Valores en vivo cuando editas (o los de la reserva cuando no editas)
  const liveStartDate = editMode 
    ? (selectedTimeUndefined ? null : selectedDay) 
    : (booking?.booking_start_datetime ? splitSql(booking.booking_start_datetime)?.ymd : null); 

  const liveStartTime = editMode 
    ? (selectedTimeUndefined ? null : selectedTime) 
    : (booking?.booking_start_datetime ? splitSql(booking.booking_start_datetime)?.hm : null);

  const liveDuration = editMode
    ? (selectedTimeUndefined ? null : selectedDuration)
    : (booking?.service_duration ?? null);

  const liveEnd = useMemo(() => { 
    if (!liveStartDate || !liveStartTime || !liveDuration) return { endDate: null, endTime: null }; 
    const { ymd, hm } = addMinutesNaive(liveStartDate, liveStartTime, liveDuration); 
    return { endDate: ymd, endTime: hm }; 
  }, [liveStartDate, liveStartTime, liveDuration]);

  const liveAreSameDay = !liveStartDate || !liveEnd.endDate ? true : (liveStartDate === liveEnd.endDate);

  const liveIsStartDefinedButNoEndAndNoDuration = useMemo(() => {
    const hasStart = Boolean(liveStartDate && liveStartTime);
    const noDuration = liveDuration === null || liveDuration === undefined;
    return hasStart && noDuration;
  }, [liveStartDate, liveStartTime, liveDuration]);

  const fetchDirections = async () => {
    if (!userId) return [];
    try {
      const res = await api.get(`/api/directions/${userId}`);
      const list = res?.data?.directions || [];
      setDirections(list);
      return list;
    } catch (e) {
      console.error('Error fetching directions:', e);
      return [];
    }
  };

  const handleConfirmAddress = async () => {
    try {
      await api.put(`/api/address/${selectedAddressId}`, {
        address_type: address2 ? 'flat' : 'house',
        street_number: streetNumber,
        address_1: street,
        address_2: address2,
        postal_code: postalCode,
        city,
        state,
        country
      });
      setSheetOption('directions');
      openSheetWithInput(350);
      await fetchDirections();
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleToggleEdit = () => {
    if (!editMode) {
      // Entrar en edición: baseline = booking actual
      setEdited(booking);
      if (booking?.booking_start_datetime) {
        const p = splitSql(booking.booking_start_datetime);
        const ds = p.ymd;
        const ts = p.hm;
        setSelectedDate({ [ds]: { selected: true, selectedColor: '#979797', selectedTextColor: '#ffffff' } });
        setSelectedDay(ds);
        setSelectedTime(ts);
        const [hh2, mm2] = ts.split(':').map(Number);
        const seed2 = new Date();
        seed2.setHours(hh2, mm2, 0, 0);
        setTempDate(seed2);
        setSelectedTimeUndefined(false);
      } else {
        setSelectedDate({});
        setSelectedDay(null);
        setSelectedTime('');
        setSelectedTimeUndefined(true);
      }
      if (booking?.service_duration) {
        const dur = parseInt(booking.service_duration);
        setSelectedDuration(dur);
        setSliderValue(minutesToSliderValue(dur));
      }
      setEditMode(true);
      return;
    }
    // Cancelar: volver a booking original
    setEdited(booking);
    if (booking?.booking_start_datetime) {
      const p2 = splitSql(booking.booking_start_datetime); 
      const ds = p2.ymd; 
      const ts = p2.hm; 
      const [hh3, mm3] = ts.split(':').map(Number); 
      const seed3 = new Date(); 
      seed3.setHours(hh3, mm3, 0, 0); 
      setTempDate(seed3);
      setSelectedDate({ [ds]: { selected: true, selectedColor: '#979797', selectedTextColor: '#ffffff' } });
      setSelectedDay(ds);
      setSelectedTime(ts);
      setSelectedTimeUndefined(false);
    } else {
      setSelectedDate({});
      setSelectedDay(null);
      setSelectedTime('');
      setSelectedTimeUndefined(true);
    }
    if (booking?.service_duration) {
      const dur = parseInt(booking.service_duration);
      setSelectedDuration(dur);
      setSliderValue(minutesToSliderValue(dur));
    } else {
      setSelectedDuration(60);
      setSliderValue(12);
    }
    setEditMode(false);
  };

  const saveChanges = async () => {
    try {
      const id = bookingId || (booking && booking.id);
      if (!id) {
        console.error('No booking ID available');
        return;
      }
      const includePricing = !selectedTimeUndefined && Number(pricing.minutes) > 0;
      const shouldNullFinal = selectedTimeUndefined && (pricing.type === 'hour' || pricing.type === 'budget');
      const payload = {
        ...edited,
        id,
        booking_start_datetime: selectedTimeUndefined ? null : combineDateTime(),
        booking_end_datetime:   selectedTimeUndefined ? null : calculateEndDateTime(),
        service_duration: selectedTimeUndefined ? null : selectedDuration,
        ...(includePricing
          ? (pricing.type === 'budget'
            ? { final_price: 1, commission: 1 }
            : { final_price: pricing.final, commission: pricing.commission })
          : {}),
        ...(shouldNullFinal ? { final_price: null } : {}),
      };
      const resolvedAddressId = edited.address_id ?? selectedAddressId;
      if (resolvedAddressId) payload.address_id = resolvedAddressId;
      console.log('SAVE payload', payload);
      await api.put(`/api/bookings/${id}`, payload);
      await fetchBooking();
      setBooking((prev) => ({ ...prev, ...payload }));
      setEditMode(false);
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const updateStatus = async (status) => {
    try {
      const payload = { status };
      await api.patch(`/api/bookings/${bookingId}/update-data`, payload);

      if (status === 'accepted' && (!booking || !booking.booking_start_datetime)) {
        const startDate = nowSql();
        const updatePayload = {
          id: bookingId,
          booking_start_datetime: startDate,
          booking_end_datetime: booking ? booking.booking_end_datetime : null,
          service_duration: booking ? booking.service_duration : null,
          final_price: booking ? booking.final_price : null,
          description: booking ? booking.description : null,
        };
        await api.put(`/api/bookings/${bookingId}`, updatePayload);
        setBooking((prev) => ({ ...prev, booking_start_datetime: startDate, booking_status: status }));
      }

      // Si se marca como completado, el backend autocompleta booking_end_datetime = NOW() si faltaba.
      // Si quien finaliza es el profesional y el precio no es fijo, redirigir a la pantalla para indicar el precio final.
      if (status === 'completed') {
        if (role === 'pro') {
          const priceType = (service && service.price_type) || booking?.price_type;
          if (priceType && priceType !== 'fix') {
            navigation.navigate('SetFinalPrice', { bookingId });
          }
        }
      }

      fetchBooking();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFinalPayment = async () => {
    try {
      let pm = paymentMethod;
      if (pm) {
        const res = await api.post(
          `/api/bookings/${bookingId}/final-payment-transfer`,
          { payment_method_id: pm.id }
        );
        if (res.data?.requiresAction && res.data?.clientSecret) {
          navigation.navigate('PaymentMethod', {
            clientSecret: res.data.clientSecret,
            paymentMethodId: pm.id,
            onSuccess: 'ConfirmPayment',
            bookingId,
            origin: 'BookingDetails',
            role,
            autoConfirm: true,
          });
          return;
        }
        if (res.data?.processing || res.data?.message) {
          navigation.navigate('ConfirmPayment', { bookingId });
          fetchBooking();
          return;
        }
        setPaymentErrorVisible(true);
      } else {
        // No hay tarjeta: ir a guardar método de pago, sin pagar aquí
        navigation.navigate('PaymentMethod', {
          origin: 'BookingDetails',
          bookingId,
          role,
        });
      }
    } catch (e) {
      console.error('handleFinalPayment error:', e);
      setPaymentErrorVisible(true);
    }
  };

  const confirmCancel = () => {
    Alert.alert(t('cancel_booking'), t('confirm_cancel_booking'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('ok'), onPress: () => updateStatus('canceled'), style: 'destructive' }
    ]);
  };

  const startChat = async () => {
    try {
      const userData = await getDataLocally('user');
      if (!userData) return;
      const me = JSON.parse(userData);

      let otherId;
      if (role === 'pro') {
        // Profesional contactando al cliente
        otherId = booking.user_id;
      } else {
        // Cliente contactando al profesional
        otherId = (service && service.user_id) || booking.service_user_id || booking.service_userid;
      }

      if (!otherId || otherId === me.id) return;

      const participants = [me.id, otherId];
      const conversationId = [...participants].sort().join('_');
      const data = {
        participants,
        updatedAt: serverTimestamp(),
      };

      if (service && service.first_name && service.surname) {
        data.name = `${service.first_name} ${service.surname}`;
      } else if (booking.service_title) {
        data.name = booking.service_title;
      }

      await setDoc(doc(db, 'conversations', conversationId), { ...data, deletedFor: arrayRemove(me.id) }, { merge: true });
      navigation.navigate('Conversation', {
        conversationId,
        participants,
        name: data.name,
      });
    } catch (err) {
      console.error('startChat error:', err);
    }
  };

  const deleteBooking = async () => {
    try {
      await api.delete(`/api/delete_booking/${bookingId}`);
      navigation.goBack();
    } catch (err) {
      console.error('deleteBooking error:', err);
    }
  };

  const isBookingInactive = () => {
    if (!booking) return false;
    return (
      booking.booking_status === 'canceled' ||
      booking.booking_status === 'rejected' ||
      (startMs && startMs < nowMs && booking.booking_status === 'requested')
    );
  };

  const getInactiveMessage = () => {
    if (!booking) return '';
    if (booking.booking_status === 'canceled') return t('booking_canceled');
    if (booking.booking_status === 'rejected') return t('booking_rejected');
    return t('booking_expired');
  };


  const nowMs = (() => {
    const d = new Date();
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  })();
  const startMs = booking?.booking_start_datetime ? toMs(booking.booking_start_datetime) : null;
  const endMs   = booking?.booking_end_datetime   ? toMs(booking.booking_end_datetime)   : null;

  const showInProgress = booking && booking.booking_status === 'accepted' && ((startMs && !endMs) || (startMs && !endMs && nowMs >= startMs) || (startMs && endMs && nowMs >= startMs && nowMs < endMs));


  const showServiceFinished =
    booking &&
    booking.booking_status === 'completed' &&
    !booking.is_paid;

  const isFinalPricePending = useMemo(() => {
    if (!booking) return false;
    if (booking.booking_status !== 'completed') return false;
    const fp = Number(booking.final_price || 0);
    const cm = Number(booking.commission || 0);
    return !(fp > 0 && cm > 0 && fp >= cm);
  }, [booking]);

  const statusMessage = showServiceFinished
    ? t('service_completed')
    : showInProgress
      ? t('in_progress')
      : null;

  if (!booking) {
    return <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]' />;
  }

  return (
    <>
      <RBSheet
        height={sheetHeight}
        openDuration={300}
        closeDuration={300}
        draggable={true}
        ref={sheet}
        customStyles={{
          container: {
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc',
          },
          draggableIcon: { backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#f2f2f2' },
        }}
      >

        {sheetOption === 'date' ? (

          <View className='flex-1 justify-start items-center'>
            <View className='mt-4 mb-2 flex-row justify-center items-center'>
              <Text className='text-center font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
                {t('select_a_date')}
              </Text>
            </View>

            <ScrollView
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              directionalLockEnabled
              bounces={false}
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className='w-full px-6'>
                <Calendar
                  onDayPress={onDayPress} 
                  markedDates={draftSelectedDate}
                  firstDay={1}
                  theme={{
                    todayTextColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
                    monthTextColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                    textMonthFontSize: 15,
                    textMonthFontWeight: 'bold',
                    dayTextColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                    textDayFontWeight: 'bold',
                    textInactiveColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                    textSectionTitleColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                    textDisabledColor: colorScheme === 'dark' ? '#706F6E' : '#b6b5b5',
                    selectedDayBackgroundColor: colorScheme === 'dark' ? '#474646' : '#d4d4d3',
                    selectedDayTextColor: '#ffffff',
                    arrowColor: colorScheme === 'dark' ? '#f2f2f2' : '#444343',
                    calendarBackground: 'transparent',
                  }}
                  style={{ backgroundColor: colorScheme === 'dark' ? '#323131' : '#fcfcfc', padding: 20, borderRadius: 20 }}
                />
              </View>

              <View className='mt-2 w-full px-6'>
                <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Text className='ml-3 mb-2 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
                    {t('start_time')}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={draftTempDate}
                    mode='time'
                    display='spinner'
                    onChange={handleHourSelected}
                    style={{ width: 320, height: 150 }}
                  />
                )}
              </View>

              <View className='mt-6 mb-10 w-full px-6'>
                <Text className='ml-3 mb-8 font-inter-bold text-[18px] text-[#444343] dark:text-[#f2f2f2]'>
                  {t('duration')}: {formatDuration(draftDuration)}
                </Text>
                <View className='flex-1 px-4 justify-center items-center'>
                  <Slider
                    style={{ width: '100%', height: 10 }}
                    minimumValue={1}
                    maximumValue={34}
                    step={1}
                    thumbImage={thumbImage}
                    minimumTrackTintColor='#b6b5b5'
                    maximumTrackTintColor='#474646'
                    value={draftSliderValue}
                    onValueChange={handleSliderChange}
                  />
                </View>
              </View>

              <View className='pl-10 flex-row w-full justify-start  items-center'>
                <TouchableOpacity
                  onPress={() => setDraftTimeUndefined(!draftTimeUndefined)}
                  style={{
                    width: 22,
                    height: 22,
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                    borderColor: colorScheme === 'dark' ? '#b6b5b5' : '#706F6E',
                    backgroundColor: draftTimeUndefined ? (colorScheme === 'dark' ? '#fcfcfc' : '#323131') : 'transparent',
                  }}
                >
                  {draftTimeUndefined && (
                    <Check height={14} width={14} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} strokeWidth={3.5} />
                  )}
                </TouchableOpacity>
                <Text className='ml-3 font-inter-semibold text-[14px] text-[#706f6e] dark:text-[#b6b5b5]'>
                  {t('undefined_time')}
                </Text>
              </View>

              <View className='mt-6 pb-3 px-6 flex-row justify-center items-center'>
                <TouchableOpacity
                  disabled={!draftTimeUndefined && !(draftDay && draftTime && draftDuration)}
                  onPress={handleAcceptDate}
                  style={{
                    opacity: !draftTimeUndefined && !(draftDay && draftTime && draftDuration) ? 0.5 : 1,
                  }}
                  className='bg-[#323131] mt-3 dark:bg-[#fcfcfc] w-full px-4 py-[17px] rounded-full items-center justify-center'
                >
                  <Text className='text-center font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                    {t('accept')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className='h-[20px]' />
            </ScrollView>
          </View>

        ) : sheetOption === 'directions' ? (

          <View className='flex-1 w-full justify-start items-center pt-5 pb-5'>
            <View className='px-7 flex-row w-full justify-between items-center'>
              <Text className='text-center font-inter-semibold text-[20px] text-[#444343] dark:text-[#f2f2f2]'>{t('your_directions')}</Text>
              <TouchableOpacity onPress={() => { sheet.current.close(); navigation.navigate('SearchDirectionAlone', { prevScreen: 'BookingDetails', prevParams: route.params }); }} className='justify-center items-end'>
                <Plus height={23} width={23} strokeWidth={1.7} color={iconColor} />
              </TouchableOpacity>
            </View>

            {(!directions || directions.length < 1) ? (
              <View className='mt-[80px] justify-center items-center'>
                <MapPin height={30} width={30} strokeWidth={1.7} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                <Text className='mt-7 font-inter-bold text-[20px] text-[#706F6E] dark:text-[#B6B5B5]'>{t('no_directions_found')}</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} className='w-full'>
                <View className='flex-1 px-6 mt-10'>
                  {directions.map((d) => (
                    <TouchableOpacity
                      key={d.address_id || d.direction_id}
                      onPress={() => {
                        setSelectedAddressId(d.address_id);
                        setEdited((prev) => ({
                          ...prev,
                          address_id: d.address_id,
                          address_1: d.address_1,
                          street_number: d.street_number,
                          postal_code: d.postal_code,
                          city: d.city,
                          state: d.state,
                          country: d.country,
                          address_2: d.address_2,
                        }));
                        sheet.current.close();
                      }}
                      className='pb-5 mb-5 flex-row w-full justify-center items-center border-b-[1px] border-[#e0e0e0] dark:border-[#3d3d3d]'
                    >
                      <View className='w-11 h-11 items-center justify-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                        <MapPin height={22} width={22} strokeWidth={1.6} color={iconColor} />
                      </View>
                      <View className='pl-4 pr-3 flex-1 justify-center items-start'>
                        <Text numberOfLines={1} className='mb-[6px] font-inter-semibold text-[15px] text-[#444343] dark:text-[#f2f2f2]'>
                          {[d.address_1, d.street_number].filter(Boolean).join(', ')}
                        </Text>
                        <Text numberOfLines={1} className='font-inter-medium text-[12px] text-[#706f6e] dark:text-[#b6b5b5]'>
                          {[d.postal_code, d.city, d.state, d.country].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                      <View className='h-full justify-start items-center'>
                        <TouchableOpacity
                          onPress={() => {
                            setSheetOption('edit');
                            setSelectedAddressId(d.address_id);
                            setCountry(d.country || '');
                            setState(d.state || '');
                            setCity(d.city || '');
                            setStreet(d.address_1 || '');
                            setStreetNumber(d.street_number || '');
                            setPostalCode(d.postal_code || '');
                            setAddress2(d.address_2 || '');
                            openSheetWithInput(700);
                          }}
                        >
                          <Edit2 height={18} width={18} strokeWidth={1.7} color={iconColor} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        ) : (
          /* === FORMULARIO EDITAR DIRECCIÓN === */
          <ScrollView>
            <View className='flex-1 w-full justify-start items-center pt-3 pb-5 px-5'>
              <View className='justify-between items-center mb-10'>
                <Text className='text-center font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>{t('confirm_your_direction') || 'Confirm your direction'}</Text>
              </View>
              {/* Country */}
              <View className='w-full h-[55px] mx-2 mb-4 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                {country?.length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>Country/region</Text>) : null}
                <TextInput value={country} onChangeText={setCountry} placeholder='Country/region...'
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
              </View>
              {/* State */}
              <View className='w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                {state?.length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>State</Text>) : null}
                <TextInput value={state} onChangeText={setState} placeholder='State...'
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
              </View>
              {/* City */}
              <View className='w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                {city?.length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>City/town</Text>) : null}
                <TextInput value={city} onChangeText={setCity} placeholder='City/town...'
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
              </View>
              {/* Street */}
              <View className='w-full h-[55px] mx-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                {street?.length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>Street</Text>) : null}
                <TextInput value={street} onChangeText={setStreet} placeholder='Street...'
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
              </View>
              {/* Postal  Number */}
              <View className='flex-row w-full justify-between items-center'>
                <View className='flex-1 h-[55px] mr-2 mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                  {postalCode?.length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>Postal code</Text>) : null}
                  <TextInput value={postalCode} onChangeText={setPostalCode} placeholder='Postal code...'
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
                </View>
                <View className='flex-1 h-[55px] mb-2 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                  {String(streetNumber || '').length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>Street number</Text>) : null}
                  <TextInput value={streetNumber ? String(streetNumber) : ''} onChangeText={setStreetNumber} placeholder='Street number...'
                    keyboardType='number-pad' keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
                </View>
              </View>
              {/* Address2 */}
              <View className='w-full h-[55px] mx-2 mb-10 py-2 px-6 justify-center items-start rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                {address2?.length > 0 ? (<Text className='pb-1 text-[12px] text-[#b6b5b5] dark:text-[#706f6e]'>Floor, door, stair (optional)</Text>) : null}
                <TextInput value={address2} onChangeText={setAddress2} placeholder='Floor, door, stair (optional)...'
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className='font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]' />
              </View>
              <TouchableOpacity
                disabled={String(streetNumber || '').length < 1}
                onPress={handleConfirmAddress}
                style={{ opacity: String(streetNumber || '').length < 1 ? 0.5 : 1 }}
                className='bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center'
              >
                <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>{t('confirm') || 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

      </RBSheet>

      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        <View className='items-center justify-center px-2 pt-3  pb-3'>

          <View className='flex-row items-center justify-between'>

            <View className="flex-[1] justify-center items-start">
              <TouchableOpacity onPress={() => navigation.goBack()} className='px-2'>
                <XMarkIcon size={24} color={iconColor} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View className="flex-[2] justify-center items-center">
              <Text className='font-inter-bold text-[17px] text-[#444343] dark:text-[#f2f2f2]'>
                {t('booking_details')}
              </Text>
            </View>

            <View className="flex-[1] justify-center items-end">
              {booking && !booking.is_paid && (
                <TouchableOpacity onPress={handleToggleEdit} className='mr-2 justify-center items-center rounded-full px-3 py-2 bg-[#E0E0E0] dark:bg-[#3D3D3D]'>
                  <Text className='font-inter-medium text-[12px] text-[#706f6e] dark:text-[#b6b5b5]'>
                    {editMode ? t('cancel') : t('edit')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          </View>

          {statusMessage && (
            <View className='items-center mt-1'>
              <Text className='font-inter-semibold text-[14px] text-[#74A34F]'>
                {statusMessage}
              </Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className='flex-1 px-6 mt-4 pb-4 ' refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

          <View className='mb-4'>
            <TouchableOpacity
              onPress={() => navigation.navigate('ServiceProfile', { serviceId: booking.service_id })}
              className='rounded-2xl bg-[#fcfcfc] dark:bg-[#323131] p-5'
            >
              <View className='flex-row justify-between items-center'>
                <Text className='ml-1 font-inter-bold text-[20px] text-[#444343] dark:text-[#f2f2f2]'>
                  {(service && service.service_title) || booking.service_title}
                </Text>
              </View>

              <View className='flex-row justify-between items-center mt-4'>
                <Text className='ml-1 mr-5'>{getFormattedPrice()}</Text>
                {service && service.tags && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-1'>
                    {service.tags.map((tag, index) => (
                      <View key={index} className='pr-[6px]'>
                        <View className='px-3 py-1 rounded-full bg-[#f2f2f2] dark:bg-[#272626]'>
                          <Text className='font-inter-medium text-[12px] text-[#979797]'>{tag}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View className='flex-row justify-between items-end mt-4'>
                <View className='flex-row items-center'>
                  <Image
                    source={service && service.profile_picture ? { uri: service.profile_picture } : require('../../assets/defaultProfilePic.jpg')}
                    className='h-[45px] w-[45px] rounded-lg bg-[#706B5B]'
                  />
                  <View className='ml-3'>
                    <Text className='mb-1 font-inter-semibold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                      {service ? `${service.first_name} ${service.surname}` : `${booking.first_name} ${booking.surname}`}
                    </Text>
                    <Text className='font-inter-semibold text-[11px] text-[#706F6E] dark:text-[#b6b5b5]'>
                      {t('place')}
                    </Text>
                  </View>
                </View>

                {service && service.review_count > 0 && (
                  <View className='flex-row items-center'>
                    <StarFillIcon color='#F4B618' style={{ transform: [{ scale: 0.85 }] }} />
                    <Text className='ml-[3px]'>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {parseFloat(service.average_rating).toFixed(1)}
                      </Text>
                      <Text> </Text>
                      <Text className='font-inter-medium text-[11px] text-[#706F6E] dark:text-[#B6B5B5]'>
                        {service.review_count === 1 ? `(1 ${t('review')})` : `(${service.review_count} ${t('reviews')})`}
                      </Text>
                    </Text>
                  </View>
                )}
              </View>

              {service && service.images && (
                <View className='px-2 pb-2 mt-4'>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-1'>
                    {service.images.map((image, index) => (
                      <View key={index} className='pr-[6px]'>
                        <View className='ml-1'>
                          <Image
                            source={image.image_url ? { uri: image.image_url } : null}
                            className='h-[65px] w-[55px] rounded-lg bg-[#706B5B]'
                          />
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Date and time */}
          <View className='mt-8 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
            <View className='w-full flex-row justify-between items-center '>
              <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Date and time</Text>
              {editMode && (
                <TouchableOpacity onPress={() => { setSheetOption('date'); setShowPicker(true); primeDraftsFromSelected(); openSheetWithInput(650); }}>
                  <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
            </View>

            <View className='mt-4 flex-1'>
              {liveStartTime && !selectedTimeUndefined ? (
                <View className='flex-1 justify-center items-center'>
                  {liveAreSameDay ? (
                    <>
                      <View className='w-full flex-row justify-between items-center'>
                        <View className='flex-row justify-start items-center'>
                          <CalendarIcon height={15} width={15} color={colorScheme === 'dark' ? '#d4d4d3' : '#515150'} strokeWidth={2.2} />
                          <Text className='ml-1 font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]'>{formatDate(liveStartDate)}</Text>
                        </View>
                        <View className='justify-end items-center'>
                          <Text className='font-inter-semibold text-[14px] text-[#515150] dark:text-[#979797]'>
                            {liveStartTime} - {liveIsStartDefinedButNoEndAndNoDuration ? '??' : (liveEnd.endTime || '')}
                          </Text>
                        </View>
                      </View>
                      <View className='mt-4 justify-end items-center'>
                        <Text className=' font-inter-bold text-[20px] text-[#515150] dark:text-[#979797]'>
                          {liveIsStartDefinedButNoEndAndNoDuration ? t('undefined_time') : formatDuration(liveDuration)}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      {/* Bloque centrado para días distintos */}
                      <View className='w-full justify-center items-center'>
                        {/* Fecha inicio · hora */}
                        <Text className='mb-2 font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]'>
                          {formatDate(liveStartDate)} · {liveStartTime}
                        </Text>

                        {/* Línea vertical */}
                        <View style={{ width: 2, height: 18, backgroundColor: colorScheme === 'dark' ? '#d4d4d3' : '#515150' }} />

                        {/* Fecha fin · hora */}
                        <Text className='mt-1 font-inter-semibold text-[14px] text-[#515150] dark:text-[#d4d4d3]'>
                          {liveEnd.endDate ? formatDate(liveEnd.endDate) : ''}{liveEnd.endDate ? ' · ' : ''}{liveIsStartDefinedButNoEndAndNoDuration ? '??' : (liveEnd.endTime || '')}
                        </Text>

                        {/* Duración debajo con estilo de horas */}
                        <View className='mt-4 justify-end items-center'>
                          <Text className=' font-inter-bold text-[20px] text-[#515150] dark:text-[#979797]'>
                            {formatDuration(liveDuration)}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              ) : (
                <View className='mt-1 flex-1 justify-center items-center'>
                  <Clock height={40} width={40} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                  <Text className='mt-4 font-inter-semibold text-[16px] text-[#979797]'>
                    {t('undefined_time')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Address */}
          <View className='mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
            <View className='w-full flex-row justify-between items-center '>
              <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Address</Text>
              {editMode && (
                <TouchableOpacity onPress={() => { setSheetOption('directions'); openSheetWithInput(350); fetchDirections(); }}>
                  <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
            </View>

            <View className='mt-4 flex-row justify-center items-center'>
              {[current?.address_1, current?.street_number, current?.postal_code, current?.city, current?.state, current?.country].some(Boolean) ? (
                <>
                  <View className='w-11 h-11 items-center justify-center'>
                    <MapPin height={25} width={25} strokeWidth={1.6} color={iconColor} />
                  </View>
                  <View className='pl-3 pr-3 flex-1 justify-center items-start'>
                    <Text numberOfLines={1} className='mb-[6px] font-inter-semibold text-center text-[15px] text-[#444343] dark:text-[#f2f2f2]'>
                      {[current?.address_1, current?.street_number].filter(Boolean).join(', ')}
                    </Text>
                    <Text numberOfLines={1} className='font-inter-medium text-center text-[12px] text-[#706f6e] dark:text-[#b6b5b5]'>
                      {[current?.postal_code, current?.city, current?.state, current?.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </>
              ) : (
                <View className="mt-1 flex-1 justify-center items-center">
                  <MapPin height={40} width={40} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                  <Text className="mt-4 font-inter-semibold text-[16px] text-[#979797]">
                    Location not selected
                  </Text>
                </View>
              )}
            </View>

          </View>

          {/* Price details */}
          <View className='mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
            <View className='w-full flex-row justify-between items-center '>
              <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Price details</Text>
            </View>

            <View className='mt-5 px-3 flex-1'>
              <View className='flex-1 justify-center items-center'>
                {pricing.type === 'hour' && (
                  <>
                    {selectedTimeUndefined ? (
                      <>
                        <View className='flex-row'>
                          <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                            Service price x ?h
                          </Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>? €</Text>
                        </View>

                        <View className='mt-3 flex-row'>
                          <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Quality commission</Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                            {formatCurrency(1, pricing.currency)}
                          </Text>
                        </View>

                        <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]' />

                        <View className='mt-4 flex-row'>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            ? € + {formatCurrency(1, pricing.currency)}
                          </Text>
                        </View>

                        <View className='mt-4 flex-row'>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Deposit</Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {formatCurrency(1, pricing.currency)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View className='flex-row'>
                          <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                            Service price x {formatHMh(pricing.minutes)}
                          </Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                            {formatCurrency(pricing.base, pricing.currency)}
                          </Text>
                        </View>

                        <View className='mt-3 flex-row'>
                          <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Quality commission</Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                            {formatCurrency(pricing.commission, pricing.currency)}
                          </Text>
                        </View>

                        <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]' />

                        <View className='mt-4 flex-row'>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {formatCurrency(pricing.final, pricing.currency)}
                          </Text>
                        </View>

                        <View className='mt-4 flex-row'>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Deposit</Text>
                          <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {'.'.repeat(80)}
                          </Text>
                          <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                            {formatCurrency(pricing.commission, pricing.currency)}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {pricing.type === 'fix' && (
                  <>
                    <View className='flex-row'>
                      <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Fixed price</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                        {formatCurrency(pricing.base, pricing.currency)}
                      </Text>
                    </View>

                    <View className='mt-3 flex-row'>
                      <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Quality commission</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                        {formatCurrency(pricing.commission, pricing.currency)}
                      </Text>
                    </View>

                    <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]' />

                    <View className='mt-4 flex-row'>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {formatCurrency(pricing.final, pricing.currency)}
                      </Text>
                    </View>

                    <View className='mt-4 flex-row'>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Deposit</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {formatCurrency(pricing.commission, pricing.currency)}
                      </Text>
                    </View>
                  </>
                )}

                {pricing.type === 'budget' && (
                  <>
                    <View className='flex-row'>
                      <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Service price</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>budget</Text>
                    </View>

                    <View className='mt-3 flex-row'>
                      <Text className='font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>Deposit</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-medium text-[13px] text-[#979797] dark:text-[#979797]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-semibold text-[13px] text-[#979797] dark:text-[#979797]'>
                        {formatCurrency(pricing.commission, pricing.currency)}
                      </Text>
                    </View>

                    <View className='w-full mt-4 border-b-[1px] border-[#706f6e] dark:border-[#b6b5b5]' />

                    <View className='mt-4 flex-row'>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>Final price</Text>
                      <Text numberOfLines={1} className='flex-1 font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {'.'.repeat(80)}
                      </Text>
                      <Text className='font-inter-bold text-[13px] text-[#444343] dark:text-[#f2f2f2]'>
                        {pricing.type === "budget" ? "budget+" : ""}{formatCurrency(pricing.final, pricing.currency)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Payment Method (solo cuando ya hay precio final) */}
          {role === 'client' && showServiceFinished && !isFinalPricePending && (
            <View className='mt-8 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
              <View className='w-full flex-row justify-between items-center '>
                <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>Payment method</Text>
                {editMode && paymentMethod && (
                  <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod', { origin: 'BookingDetails', bookingId, role })}>
                    <Edit3 height={17} width={17} color={iconColor} strokeWidth={2.2} />
                  </TouchableOpacity>
                )}
              </View>

              <View className='mt-4 flex-1'>
                {paymentMethod ? (
                  <View className='flex-1 my-3 justify-center items-center '>
                    <View className='px-7 pb-5 pt-[50px] bg-[#EEEEEE] dark:bg-[#111111] rounded-xl'>
                      <Text>
                        <Text className='font-inter-medium text-[16px] text-[#444343] dark:text-[#f2f2f2]'>••••   ••••   ••••   </Text>
                        <Text className='font-inter-medium text-[13px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.last4}</Text>
                      </Text>

                      <View className='mt-6 flex-row justify-between items-center'>
                        <View className='flex-row items-center'>
                          <View className='justify-center items-center'>
                            <Text className='font-inter-medium text-[12px] text-[#444343] dark:text-[#f2f2f2]'>{paymentMethod.expiryMonth}/{paymentMethod.expiryYear}</Text>
                          </View>
                        </View>

                        <View className='h-5 w-8 bg-[#fcfcfc] dark:bg-[#323131] rounded-md' />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className='mt-1 flex-1 justify-center items-center'>
                    <CreditCard height={55} width={55} strokeWidth={1.3} color={colorScheme === 'dark' ? '#474646' : '#d4d3d3'} />
                    <View className='flex-row justify-center items-center px-6'>
                      <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod', { origin: 'BookingDetails', bookingId, role })} style={{ opacity: 1 }} className='bg-[#706f6e] my-2 mt-3 dark:bg-[#b6b5b5] w-full py-[14px] rounded-full items-center justify-center'>
                        <Text>
                          <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                            {t('add_credit_card')}
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          <View className='mt-4 flex-1 p-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl'>
            <View className='w-full flex-row justify-between items-center '>
              <Text className='font-inter-bold text-[16px] text-[#444343] dark:text-[#f2f2f2]'>{t('booking_description')}</Text>
            </View>

            <View className='flex-1 w-full mt-6'>
              {editMode ? (
                <TextInput
                  value={edited.description || ''}
                  onChangeText={(text) => setEdited({ ...edited, description: text })}
                  multiline
                  className='w-full min-h-[150px] bg-[#f2f2f2] dark:bg-[#272626] rounded-2xl py-4 px-5 text-[15px] text-[#515150] dark:text-[#d4d4d3]'
                  style={{ textAlignVertical: 'top' }}
                />
              ) : (
                <Text className='font-inter-medium text-[15px] text-[#444343] dark:text-[#f2f2f2]'>{booking.description || '-'}</Text>
              )}
            </View>
          </View>


        </ScrollView>

        {editMode ? (
          <View className='px-6 pb-4'>
            <TouchableOpacity onPress={saveChanges} className='mt-2 mb-4 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'>
              <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                {t('save_changes')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className='px-6 pb-4'>
            {isBookingInactive() ? (
              <>
                <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
                  <LockClosedIcon strokeWidth={2.1} size={18} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
                  <Text className='ml-2 font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                    {getInactiveMessage()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteBooking} className='mt-4 justify-center items-center w-full'>
                  <Text className='font-inter-semibold text-[15px] text-[#ff633e]/50'>{t('delete_booking')}</Text>
                </TouchableOpacity>
              </>
            ) : booking.is_paid ? (
              <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
                <LockClosedIcon strokeWidth={2.1} size={18} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
                <Text className='ml-2 font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                  {t('finished_paid')}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {showServiceFinished ? (
                  isFinalPricePending ? (
                    role === 'pro' ? (
                      <>
                        <TouchableOpacity
                          onPress={() => navigation.navigate('SetFinalPrice', { bookingId })}
                          className='mt-2 mb-2 rounded-full items-center py-[18px]'
                          style={{ backgroundColor: '#fcfcfc' }}
                        >
                          <Text className='font-inter-semibold text-[15px]' style={{ color: '#323131' }}>
                            {t('indicate_final_price')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={startChat} className='mt-4 justify-center items-center w-full'>
                          <Text className='font-inter-semibold text-[15px] text-[#979797]'>
                            {t('write')}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
                        <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                          {t('waiting_final_price')}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    role === 'pro' ? (
                      <TouchableOpacity disabled className='mt-2 flex-row bg-[#3D3D3D] dark:bg-[#E0E0E0] rounded-full items-center justify-center py-[18px] opacity-[.5]'>
                        <ClockIcon strokeWidth={2.1} size={18} color={colorScheme === 'dark' ? '#323131' : '#fcfcfc'} />
                        <Text className='ml-2 font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                          {t('waiting_final_payment')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handleFinalPayment}
                        className='mt-2 mb-2 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'
                        style={{
                          opacity: 1,
                          shadowColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 10,
                          elevation: 10,
                        }}>
                        <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                          {t('final_payment')}
                        </Text>
                      </TouchableOpacity>
                    )
                  )
                ) : (
                  <TouchableOpacity onPress={startChat} className='mt-2 bg-[#323131] dark:bg-[#fcfcfc] rounded-full items-center py-[18px]'>
                    <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>
                      {t('write')}
                    </Text>
                  </TouchableOpacity>
                )}

                {role !== 'pro' || booking.booking_status !== 'requested' ? (
                  showInProgress ? (
                    <TouchableOpacity onPress={() => updateStatus('completed')} className='mt-4 justify-center items-center w-full'>
                      <Text className='font-inter-semibold text-[15px] text-[#979797]'>
                        {t('service_completed')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    !showServiceFinished && (
                      <TouchableOpacity onPress={confirmCancel} className='mt-4 justify-center items-center w-full'>
                        <Text className='font-inter-semibold text-[15px] text-[#ff633e]/50'>{t('cancel_booking')}</Text>
                      </TouchableOpacity>
                    )
                  )
                ) : null}

                {role === 'pro' && booking.booking_status === 'requested' && (
                  <View className='flex-row justify-between mt-3'>
                    <TouchableOpacity onPress={() => updateStatus('rejected')} className='flex-[1px] mr-1 bg-[#E0E0E0] dark:bg-[#3D3D3D] rounded-full items-center py-[18px]'>
                      <Text className='font-inter-semibold text-[15px] text-[#fcfcfc]'>
                        {t('reject')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateStatus('accepted')} className='flex-[2px] ml-1 bg-[#74A34F] rounded-full items-center py-[18px]'>
                      <Text className='font-inter-semibold text-[15px] text-[#fcfcfc]'>
                        {t('accept')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>

        )}
      </SafeAreaView>
      <ModalMessage
        visible={paymentErrorVisible}
        title={t('payment_error')}
        description={t('payment_error_description')}
        showCancel={false}
        confirmText={t('ok')}
        onConfirm={() => setPaymentErrorVisible(false)}
      />
    </>
  );
}