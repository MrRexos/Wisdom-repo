
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, StyleSheet, FlatList, ScrollView, Image, KeyboardAvoidingView, Keyboard, Linking, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind'
import '../../languages/i18n';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, GlobeEuropeAfricaIcon } from 'react-native-heroicons/outline';
import { Search, Sliders, Heart, Plus, Share, Info, Phone, FileText, Flag, X } from "react-native-feather";
import { storeDataLocally, getDataLocally } from '../../utils/asyncStorage';
import api from '../../utils/api.js';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/solid';
import useRefreshOnFocus from '../../utils/useRefreshOnFocus';
import * as ImagePicker from 'expo-image-picker';
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import eventEmitter from '../../utils/eventEmitter';




export default function EditProfileScreen() {

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
    const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
    const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
    const currentLanguage = i18n.language;
    const [user, setUser] = useState();
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imageFull, setImageFull] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [usernameExists, setUsernameExists] = useState(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editingLocal, setEditingLocal] = useState(false);

    const getUserData = async () => {
        if (editingLocal) return;
        const userData = await getDataLocally('user');
        const user = JSON.parse(userData);
        setUser(user);
        setImage(user.profile_picture);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getDataLocally('user');
            const user = JSON.parse(userData);
            setUser(user);
            setUsername(user.username);
            setName(`${user.first_name} ${user.surname}`);
            setImage(user.profile_picture);
        };
        fetchUser();
    }, []);

    useRefreshOnFocus(getUserData);

    const onRefresh = async () => {
        setRefreshing(true);
        await getUserData();
        setRefreshing(false);
    };

    const inputUsernameChanged = (text) => {
        setUsername(text);
        setShowError(false);
    };

    const inputNameChanged = (text) => {
        setName(text);
        setShowError(false);
    };

    const uploadImage = async () => {

        const formData = new FormData();
        formData.append('file', {
            uri: imageFull.uri,
            type: imageFull.type,
            name: imageFull.fileName,
        });

        try {
            const res = await api.post('/api/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data.url
        } catch (error) {
            console.error(error);
        }
    };

    const updateUser = async (imageURL = user.image, firstName, surname) => {
        try {
            const response = await api.put(`/api/user/${user.id}/profile`, {
                username: username,
                first_name: firstName,
                surname: surname,
                profile_picture: imageURL
            });

            return response.data;


        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        }
    }

    const DonePressed = async () => {
        const nameSplited = name.trim().split(" ");

        if (name.length === 0) {
            setErrorMessage(t('must_enter_name_and_surname'));
            setShowError(true);
        } else if (nameSplited.length === 1) {
            setErrorMessage(t('must_enter_your_surname'));
            setShowError(true);
        } else if (nameSplited.length > 2) {
            setErrorMessage(t('must_enter_only_name_and_surname'));
            setShowError(true);
        } else {
            const firstName = nameSplited[0].charAt(0).toUpperCase() + nameSplited[0].slice(1).toLowerCase();
            const surname = nameSplited[1].charAt(0).toUpperCase() + nameSplited[1].slice(1).toLowerCase();
            let imageURL; // Inicializar imageURL

            try {
                if (imageFull) {
                    imageURL = await uploadImage();
                    const response = await updateUser(imageURL, firstName, surname);
                } else {
                    const response = await updateUser(null, firstName, surname); // Pasar null si no hay imagen
                }

                // Actualizar el objeto user
                user.first_name = firstName;
                user.surname = surname;
                user.username = username;
                user.profile_picture = imageURL ? imageURL : user.profile_picture; // Asegúrate de usar la propiedad correcta

                // Almacenar los datos localmente
                await storeDataLocally('user', JSON.stringify(user));
                
                setEditingLocal(false);

                // Notificar que el perfil fue actualizado
                eventEmitter.emit('profileUpdated');

                // Navegar hacia atrás
                navigation.goBack();
            } catch (error) {
                console.error('Error updating user:', error);
                setErrorMessage(t('error_updating_user_please_try_again')); // Mostrar mensaje de error
                setShowError(true);
            }
        }
    };

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

        setEditingLocal(true);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageFull(result.assets[0]);
        } else {
            setEditingLocal(false);
        }
    };

    const checkUsernameExists = async (username) => {
        setIsLoading(true);
        if (username !== user.username) {
            try {
                const response = await api.get('/api/check-username', {
                    params: {
                        username: username,  // Pasas el username como parámetro de consulta
                    },
                });

                if (response.data.exists) {
                    setUsernameExists(true);


                } else {
                    setUsernameExists(false);
                }
            } catch (error) {
                console.error('Error al verificar el username:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
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

    useEffect(() => {
        const originalUsername = user?.username || '';
        const originalName = `${user?.first_name || ''} ${user?.surname || ''}`.trim();
        setHasChanges(username !== originalUsername || name !== originalName || image !== user?.profile_picture);
    }, [username, name, image]);



    return (
        <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? initialWindowMetrics?.insets?.top ?? 0) : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
            <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

            <View className="absolute bg-[#f2f2f2] dark:bg-[#272626] h-[95px] w-full z-10 justify-end">
                <View className="flex-row justify-between items-center pb-4 px-2">
                    <View className="flex-1 ">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ChevronLeftIcon size={24} strokeWidth={1.7} color={iconColor} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 justify-center items-center ">
                        <Text className="font-inter-semibold text-center text-[16px] text-[#444343] dark:text-[#f2f2f2]">{t('edit_profile')}</Text>
                    </View>

                    <View className="flex-1 justify-center items-end">
                        {hasChanges && ( // Solo mostrar si hay cambios
                            <TouchableOpacity
                                disabled={usernameExists}
                                onPress={DonePressed}
                                className="mr-2 justify-center items-center rounded-full px-3 py-2 bg-[#E0E0E0] dark:bg-[#3D3D3D]"
                                style={{ opacity: usernameExists ? 0.5 : 1.0 }}>
                                <Text className="font-inter-medium text-[13px] text-[#444343] dark:text-[#f2f2f2]">{t('done')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-[75px]" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

                <View className="w-full justify-center items-center">
                    <TouchableOpacity onPress={handleImagePicker}>
                        <Image source={image ? { uri: image } : require('../../assets/defaultProfilePic.jpg')} style={{ resizeMode: 'cover', width: 100, height: 100 }} className="rounded-full bg-slate-500" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleImagePicker}>
                        <Text className="mt-3 mb-10 font-inter-medium text-[15px] text-[#b6b5b5] dark:text-[#706f6e]">{t('update_profile_photo')}</Text>
                    </TouchableOpacity>
                </View>

                <View className="mb-7">
                    <Text className="mb-2 font-inter-medium text-[15px] text-[#b6b5b5] dark:text-[#706f6e]">{t('username')}</Text>
                    <View className="w-full h-[55px] py-2 pl-6 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                        <Text className="font-inter-medium mr-[2px] text-[15px] text-[#444343] dark:text-[#f2f2f2]">@</Text>

                        <TextInput
                            placeholder=''
                            selectionColor={cursorColorChange}
                            placeholderTextColor={placeHolderTextColorChange}
                            onChangeText={inputUsernameChanged}
                            value={username}
                            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                            className="font-inter-medium pr-4 h-[55px] flex-1 text-[15px] text-[#444343] dark:text-[#f2f2f2] "
                        />
                        {isLoading ? (
                            <ActivityIndicator size="15" color={iconColor} height={30} width={30} style={{ marginRight: 25, transform: [{ scale: 1 }] }} />
                        ) : user?.username == username ? (null) :
                            usernameExists !== null ? (
                                usernameExists ? (
                                    <XCircleIcon size={20} color="#ff633e" height={30} width={30} style={{ marginRight: 10 }} />
                                ) : (
                                    <CheckCircleIcon size={20} color="#74a450" height={30} width={30} style={{ marginRight: 10 }} />
                                )
                            ) : null}
                    </View>

                </View>

                <View>
                    <Text className="mb-2 font-inter-medium text-[15px] text-[#b6b5b5] dark:text-[#706f6e]">{t('full_name')}</Text>
                    <View className="w-full h-[55px] py-2 px-6 flex-row justify-start items-center rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]">
                        <TextInput
                            placeholder=''
                            selectionColor={cursorColorChange}
                            placeholderTextColor={placeHolderTextColorChange}
                            onChangeText={inputNameChanged}
                            value={name}
                            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                            className="font-inter-medium w-full text-[15px] text-[#444343] dark:text-[#f2f2f2]"
                        />
                    </View>
                    {showError ? (
                        <Text className="text-[#ff633e] text-[13px] pt-3">{errorMessage}</Text>
                    ) : null}
                </View>


                <View className="h-10"></View>
            </ScrollView>
        </SafeAreaView>
    );
}