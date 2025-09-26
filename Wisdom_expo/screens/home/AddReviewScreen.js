import React, { useState, useRef } from 'react';
import { View, Text, Platform, StatusBar, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import StarFillIcon from 'react-native-bootstrap-icons/icons/star-fill';
import api from '../../utils/api.js';
import { getDataLocally } from '../../utils/asyncStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddReviewScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId } = route.params;
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const maxLength = 1000;
  const inputRef = useRef(null);

  const sendReview = async () => {
    try {
      const userData = await getDataLocally('user');
      const user = userData ? JSON.parse(userData) : null;
      await api.post(`/api/services/${serviceId}/reviews`, {
        user_id: user ? user.id : null,
        service_id: serviceId,
        rating,
        comment,
      });
    } catch (error) {
      console.error('sendReview error:', error);
    } finally {
      navigation.navigate('HomeScreen', { screen: 'Home', params: { screen: 'HomeScreen' } });
    }
  };

  const skip = () => {
    navigation.navigate('HomeScreen', { screen: 'Home', params: { screen: 'HomeScreen' } });
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} className="mx-[6px]">
          <StarFillIcon style={{ transform: [{ scale: 1.4 }] }} color={i <= rating ? '#F4B618' : '#D4D4D3'} />
        </TouchableOpacity>
      );
    }
    return <View className="flex-row justify-center items-center">{stars}</View>;
  };

  const handleClearText = () => {
    setComment('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className="flex-1 bg-[#f2f2f2] dark:bg-[#272626]">
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1 px-6 pt-5 pb-6 justify-between">
        <View>
          <TouchableOpacity onPress={skip}>
            <Text className="font-inter-medium text-[14px] text-right text-[#B6B5B5] dark:text-[#706f6e]">{t('skip')}</Text>
          </TouchableOpacity>
          <Text className="mt-6 font-inter-bold text-[24px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('rate_service')}</Text>
          <View className="mt-6 justify-center items-center">
            {renderStars()}
          </View>

          <View className="mt-12">
            <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
              <View className="w-full min-h-[150px] bg-[#E0E0E0] dark:bg-[#3D3D3D] rounded-2xl py-4 px-5">
                {comment.length > 0 ? (
                  <View className="flex-row justify-end">
                    <TouchableOpacity onPress={handleClearText}>
                      <Text className="mb-1 font-inter-medium text-[13px] text-[#d4d4d3] dark:text-[#474646]">{t('clear')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <TextInput
                  placeholder={t('write_comment')}
                  selectionColor={cursorColorChange}
                  placeholderTextColor={placeHolderTextColorChange}
                  onChangeText={setComment}
                  value={comment}
                  ref={inputRef}
                  keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                  className="w-full text-[15px] text-[#515150] dark:text-[#d4d4d3]"
                  multiline
                  maxLength={maxLength}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
            </TouchableWithoutFeedback>
            <View className="w-full flex-row justify-end">
              <Text className="pt-2 pr-2 font-inter-medium text-[12px] text-[#979797] dark:text-[#979797]">{comment.length}/{maxLength}</Text>
            </View>
          </View>

        </View>
        <TouchableOpacity onPress={sendReview} className='mt-6 bg-[#323131] dark:bg-[#fcfcfc] w-full h-[55px] rounded-full items-center justify-center'>
          <Text className='font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]'>{t('submit_review')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}