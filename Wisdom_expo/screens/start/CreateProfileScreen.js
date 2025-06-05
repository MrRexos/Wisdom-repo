import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Linking, TextInput, KeyboardAvoidingView, TouchableOpacity, Image, Platform, StatusBar,  Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/solid';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function CreateProfileScreen() {
    const { colorScheme } = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
    const placheHolderTextColorChange = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
    const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    const [username, setUsername] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [usernameExists, setUsernameExists] = useState(null); // null: no ha verificado, true: existe, false: no existe

    const route = useRoute();
    const { email, password, firstName, surname } = route.params;

    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                t('allow_wisdom_to_access_gallery'),
                t('need_gallery_access'),
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('settings'), onPress: () => Linking.openSettings() }
                ],
                { cancelable: true }
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]); // Guarda la imagen seleccionada en el estado          
        }
    };

    const inputChanged = (event) => {
        const newUsername = event.nativeEvent.text;
        setUsername(newUsername.trim());
        setShowError(false);
        setUsernameExists(null); // Reinicia el estado de validación cuando se cambia el texto
    };

    const checkUsernameExists = async (username) => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/check-username', {
                params: {
                    username: username,  // Pasas el username como parámetro de consulta
                },
            });

            if (response.data.exists) {
                setUsernameExists(true);
                setErrorMessage(t('username_taken'));
                setShowError(true);
                
            } else {
                setUsernameExists(false);                
                setShowError(false);
                
            }
        } catch (error) {
            console.error('Error al verificar el username:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardOpen(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardOpen(false)
        );
    
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);  // Este efecto solo se ejecuta una vez, cuando el componente se monta.
    
    useEffect(() => {
        if (username.length > 0) {
            const timer = setTimeout(() => {
                checkUsernameExists(username);
            }, 1000); // Espera 1 segundo después de que el usuario deja de escribir
    
            return () => clearTimeout(timer); // Limpia el temporizador si el usuario sigue escribiendo
        }
    }, [username]);

    const nextPressed = async () => {
        if (username.split(" ").length > 1) {
            setErrorMessage(t('spaces_not_allowed_use_underscore'));
            setShowError(true);
        } else if (username != username.toLowerCase()) {
            setErrorMessage(t('no_capital_letters'));
            setShowError(true);
        } else if (image === null) {
            setErrorMessage(t('upload_profile_picture'));
            setShowError(true);
        } else {
            if (!usernameExists) {
                navigation.navigate('NotificationAllow', { email, password, firstName, surname, username, image });
            } else {
                setErrorMessage(t('username_already_taken'));
                setShowError(true);
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626] justify-between items-center'>
            <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
            <View className="flex-1 w-full justify-between items-center ">
                <View className="w-full px-5 py-3 ">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeftIcon size={26} color={iconColor} strokeWidth="1.7" className="p-6" />
                    </TouchableOpacity>
                    <View>
                        <View className="items-center pt-6">
                            <TouchableOpacity onPress={handleImagePicker}>
                                <Image source={image ? { uri: image.uri } : require('../../assets/defaultProfilePic.jpg')} className="w-[120] h-[120] rounded-full bg-slate-500" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="justify-center items-center px-7">
                        <Text className="font-inter-bold text-center text-xl pt-7 text-[#444343] dark:text-[#f2f2f2]">
                            {t('add_profile_picture_and_username')}
                        </Text>
                    </View>
                    <View className="mt-8 mb-1 h-[55] flex-row justify-start items-center rounded-full bg-[#E0E0E0]/60 dark:bg-[#3D3D3D]/60 border-[1px] border-[#706F6E]/20 dark:border-[#B6B5B5]/20">
                        <Text className="pl-4 pr-2 text-[15px] text-[#444343] dark:text-[#f2f2f2]">
                            @
                        </Text>
                        <TextInput
                            placeholder={t('username_placeholder')}
                            autoFocus={true}
                            selectionColor={cursorColorChange}
                            placeholderTextColor={placheHolderTextColorChange}
                            onChange={inputChanged}
                            value={username}
                            onSubmitEditing={nextPressed}
                            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                            className="pr-4 h-[55] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2]" />

                        {isLoading ? (
                            <ActivityIndicator size="15" color={iconColor} height={30} width={30} style={{ marginRight: 25, transform: [{ scale: 1 }] }} />
                        ) : usernameExists !== null ? (
                            usernameExists ? (
                                <XCircleIcon size={20} color="#ff633e" height={30} width={30} style={{ marginRight: 10 }} />
                            ) : (
                                <CheckCircleIcon size={20} color="#74a450" height={30} width={30} style={{ marginRight: 10 }} />
                            )
                        ) : null}
                    </View>
                    {showError ? (
                        <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
                    ) : null}
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
                    <View className="justify-center items-center pb-6 mt-4 w-full px-8">
                        <TouchableOpacity
                            disabled={username.length < 1}
                            onPress={nextPressed}
                            style={{ opacity: username.length < 1 ? 0.5 : 1.0 }}
                            className="bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55] rounded-full items-center justify-center" >
                            <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131] ">{t('create_account')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
