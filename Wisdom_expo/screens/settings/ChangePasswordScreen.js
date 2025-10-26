import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform, Text, TouchableOpacity, TextInput, Keyboard, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import EyeIcon from 'react-native-bootstrap-icons/icons/eye';
import EyeSlashIcon from 'react-native-bootstrap-icons/icons/eye-slash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getDataLocally } from '../../utils/asyncStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../utils/api';

export default function ChangePasswordScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [sideW, setSideW] = useState(64); // ancho mínimo seguro

  const measureSide = (w) =>
    setSideW((prev) => (w > prev ? Math.ceil(w) : prev));

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSecureCurrent, setIsSecureCurrent] = useState(true);
  const [isSecurePassword, setIsSecurePassword] = useState(true);
  const [isSecureConfirm, setIsSecureConfirm] = useState(true);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  useEffect(() => {
    const getUserData = async () => {
      const userData = await getDataLocally('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validatePasswords = () => {
    if ((newPassword && newPassword.length < 8) || (confirmPassword && confirmPassword.length < 8)) {
      setPasswordMismatch(false);
      setErrorMessage(t('password_at_least_eight'));
      setShowError(true);
      return;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      setErrorMessage(t('passwords_do_not_match'));
      setShowError(true);
    } else {
      setPasswordMismatch(false);
      setShowError(false);
    }
  };

  const formValid = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleChangePassword = async () => {
    if (!formValid || !user) return;
    try {
      await api.put(`/api/user/${user.id}/password`, {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      Alert.alert(t('password_updated'));
      navigation.goBack();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Error');
      }
      setShowError(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View className="pt-6 bg-[#f2f2f2] dark:bg-[#272626] w-full">
        <View className="flex-row items-center pb-4 px-2">
          {/* Izquierda: reserva el mismo ancho que la derecha */}
          <View style={{ width: sideW }} className="items-start">
            <TouchableOpacity onPress={() => navigation.goBack()} className="px-2">
              <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Centro: ocupa el resto y puede encoger */}
          <View className="flex-1 items-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="shrink min-w-0 text-center font-inter-semibold text-[16px] text-[#444343] dark:text-[#f2f2f2]"
            >
              {t('change_password')}
            </Text>
          </View>

          {/* Derecha: medimos su ancho real */}
          <View
            className="items-end"
            onLayout={(e) => measureSide(e.nativeEvent.layout.width)}
          >
            <TouchableOpacity
              disabled={!formValid}
              onPress={handleChangePassword}
              className={`
                mr-2 rounded-full px-3 py-2
                bg-[#E0E0E0] dark:bg-[#3D3D3D]
                ${formValid ? '' : 'opacity-0'}
              `}
            >
              <Text className="font-inter-medium text-[13px] text-[#444343] dark:text-[#f2f2f2]">
                {t('done')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} enableOnAndroid={true} scrollEnabled={keyboardOpen}>
        <View className="px-5 pt-6 w-full">
          <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">{t('current_password')}</Text>
          <View className="mt-3 px-5 h-[55px] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#706F6E]/20">
            <TextInput
              placeholder={t('current_password')}
              secureTextEntry={isSecureCurrent}
              selectionColor={cursorColorChange}
              placeholderTextColor={placeHolderTextColorChange}
              onChangeText={(text) => { setCurrentPassword(text); setShowError(false); }}
              value={currentPassword}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              className="text-[15px] h-[55px] flex-1 text-[#444343] dark:text-[#f2f2f2]"
            />
            <TouchableOpacity onPress={() => setIsSecureCurrent(!isSecureCurrent)}>
              {isSecureCurrent ? (
                <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
              ) : (
                <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
              )}
            </TouchableOpacity>
          </View>
          <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">{t('new_password')}</Text>
          <View className="mt-3 px-5 h-[55px] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
            <TextInput
              placeholder={t('new_password')}
              secureTextEntry={isSecurePassword}
              selectionColor={cursorColorChange}
              placeholderTextColor={placeHolderTextColorChange}
              onChangeText={(text) => { setNewPassword(text); setShowError(false); setPasswordMismatch(false); }}
              onEndEditing={validatePasswords}
              value={newPassword}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              className="text-[15px] h-[55px] flex-1 text-[#444343] dark:text-[#f2f2f2]"
            />
            <TouchableOpacity onPress={() => setIsSecurePassword(!isSecurePassword)}>
              {isSecurePassword ? (
                <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
              ) : (
                <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
              )}
            </TouchableOpacity>
          </View>
          <Text className="font-inter-semibold text-[15px] pt-6 text-[#444343] dark:text-[#f2f2f2]">{t('confirm_new_password')}</Text>
          <View className="mt-3 px-5 h-[55px] flex-row justify-between items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
            <TextInput
              placeholder={t('type_it_again')}
              secureTextEntry={isSecureConfirm}
              selectionColor={cursorColorChange}
              placeholderTextColor={placeHolderTextColorChange}
              onChangeText={(text) => { setConfirmPassword(text); setShowError(false); setPasswordMismatch(false); }}
              onEndEditing={validatePasswords}
              value={confirmPassword}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
              className="h-[55px] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]"
            />
            <TouchableOpacity onPress={() => setIsSecureConfirm(!isSecureConfirm)}>
              {isSecureConfirm ? (
                <EyeSlashIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
              ) : (
                <EyeIcon size={20} color={placeHolderTextColorChange} style={{ marginLeft: 10, transform: [{ scale: 1.15 }] }} />
              )}
            </TouchableOpacity>
          </View>
          {(showError || passwordMismatch) ? (
            <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}