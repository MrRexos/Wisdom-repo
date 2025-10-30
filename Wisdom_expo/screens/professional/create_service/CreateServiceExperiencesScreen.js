import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform, TouchableOpacity, Text, TextInput, ScrollView, Keyboard, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../../languages/i18n';
import { useColorScheme } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { XMarkIcon } from 'react-native-heroicons/outline';
import ServiceFormHeader from '../../../components/ServiceFormHeader';
import ServiceFormUnsavedModal from '../../../components/ServiceFormUnsavedModal';
import ModalMessage from '../../../components/ModalMessage';
import { useServiceFormEditing } from '../../../utils/serviceFormEditing';


export default function CreateServiceExperiencesScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';
  const navigation = useNavigation();
  const placeHolderTextColorChange = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const cursorColorChange = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const route = useRoute();
  const prevParams = route.params?.prevParams || {};
  const { title, family, category, description, selectedLanguages, isIndividual, hobbies, tags, location, actionRate } = prevParams;
  const [position, setPosition] = useState('');
  const [place, setPlace] = useState('');
  const [experiences, setExperiences] = useState(prevParams.experiences || []);
  const [experienceId, setExperienceId] = useState(1);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState();
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    isEditing,
    hasChanges,
    saving,
    requestBack,
    handleSave: handleFormSave,
    confirmVisible,
    handleConfirmSave,
    handleDiscardChanges,
    handleDismissConfirm,
    invalidPriceVisible,
    dismissInvalidPriceModal,
  } = useServiceFormEditing({ prevParams, currentValues: { experiences }, t });

  const inputPositionChanged = (text) => {
    setPosition(text);
  };

  const inputPlaceChanged = (text) => {
    setPlace(text);
  };

  const handleStartDateChange = (event, date) => {
    if (date !== undefined) {
      setTempDate(date); // Almacena la fecha seleccionada temporalmente
    }
    if (Platform.OS === 'android') {
      setShowStartPicker(false)
      setStartDate(tempDate);
      setTempDate(new Date());
      setOpenStartDate(false);
    }
  };

  const handleAcceptStartDate = () => {
    setStartDate(tempDate);
    setTempDate(new Date());
    setOpenStartDate(false);
  };

  const handleCancelStartDate = () => {
    setTempDate(new Date());
    setOpenStartDate(false);

  };

  const handleEndDateChange = (event, date) => {
    if (date !== undefined) {
      setTempDate(date);
    }
    if (Platform.OS === 'android') {
      setShowEndPicker(false)
      const today = new Date();

      const isToday = (
        tempDate.getDate() === today.getDate() &&
        tempDate.getMonth() === today.getMonth() &&
        tempDate.getFullYear() === today.getFullYear()
      );

      if (tempDate >= today || isToday) {
        setEndDate(null);
      } else {
        setEndDate(tempDate); // Si es en el pasado, establecer la fecha seleccionada
      }

      setTempDate(new Date()); // Restablecer la fecha temporal a la fecha actual
      setOpenEndDate(false); // Cerrar el DateTimePicker
    }
  };

  const handleAcceptEndDate = () => {
    const today = new Date();

    const isToday = (
      tempDate.getDate() === today.getDate() &&
      tempDate.getMonth() === today.getMonth() &&
      tempDate.getFullYear() === today.getFullYear()
    );

    if (tempDate >= today || isToday) {
      setEndDate(null);
    } else {
      setEndDate(tempDate); // Si es en el pasado, establecer la fecha seleccionada
    }

    setTempDate(new Date()); // Restablecer la fecha temporal a la fecha actual
    setOpenEndDate(false); // Cerrar el DateTimePicker
  };

  const handleCancelEndDate = () => {
    setTempDate(new Date());
    setOpenEndDate(false);
  };

  const handleSave = () => {
    experiences.push({ id: experienceId, position: position, place: place, startDate: startDate.getTime(), endDate: endDate ? endDate.getTime() : null })
    setPosition('');
    setPlace('');
    setStartDate(new Date());
    setEndDate();
    setExperienceId(experienceId + 1);
    setShowAddExperience(false);
  };

  const handleCloseAddExperience = () => {
    setPosition('');
    setPlace('');
    setStartDate(new Date());
    setEndDate();
    setShowAddExperience(false);
  };

  const deleteExperience = (experienceId) => {
    setExperiences(experiences.filter(item => item.id !== experienceId))
  };



  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

        <View className="flex-1 px-6 pt-5 pb-10">
          <ServiceFormHeader
            onBack={requestBack}
            onSave={handleFormSave}
            showSave={isEditing && hasChanges}
            saving={saving}
          />

          <View className="justify-center items-center">
            <Text className="mt-[55px] font-inter-bold text-[28px] text-center text-[#444343] dark:text-[#f2f2f2]">{t('your_experience')}</Text>
            <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('show_your_entire_career_with_this_service')}</Text>
          </View>

          {experiences.length > 0 ? (
            <View className="justify-center items-center mt-[110px]">

              {experiences.map((exp, index) => (
                <View key={index} className="flex-row w-full justify-center items-center">

                  <View className="w-[30px] h-full items-center pr-5">
                    <View className={`flex-1  bg-[#b6b5b5] dark:bg-[#706F6E] ${index > 0 && 'w-[2]'}`} />
                    <View className={`w-4 h-4 rounded-full border-2 border-[#444343] dark:border-[#f2f2f2] ${exp.endDate ? null : colorScheme == 'dark' ? 'bg-[#f2f2f2]' : 'bg-[#444343]'}`}>
                    </View>
                    <View className={`flex-1 w-[2] bg-[#b6b5b5] dark:bg-[#706F6E] ${index === experiences.length - 1 ? 'w-[0]' : 'w-[2]'}`} />
                  </View>

                  <View className="flex-1 py-3 px-5 mb-3 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

                    <View className="mt-1 flex-row justify-between">
                      <Text className="font-inter-semibold text-[17px] text-[#444343] dark:text-[#f2f2f2]">{exp.position}</Text>
                      <TouchableOpacity onPress={() => deleteExperience(exp.id)} className="justify-center items-end">
                        <XMarkIcon size={21} color={iconColor} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>

                    <View className="mt-3 flex-row justify-between items-center mb-[6px]">
                      <Text className="font-inter-medium text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{exp.place}</Text>
                      <Text>
                        <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                        <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]"> - </Text>
                        <Text className=" text-[12px] text-[#706F6E] dark:text-[#b6b5b5]">{exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Still here'}</Text>
                      </Text>
                    </View>

                  </View>
                </View>
              ))}

            </View>
          ) : null}

          {!showAddExperience ? (

            <View className={`${experiences.length > 0 ? 'mt-10' : 'flex-1'} justify-center items-center`}>
              <TouchableOpacity onPress={() => setShowAddExperience(true)}>
                <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#706F6E]  dark:text-[#b6b5b5]">{t('add_an_experience')}</Text>
              </TouchableOpacity>
            </View>

          ) : (
            <View className="flex-1 justify-center items-center">
              <View className="w-full mt-7 mb-7 py-4 px-5 bg-[#fcfcfc] dark:bg-[#323131] rounded-2xl">

                <TouchableOpacity onPress={() => handleCloseAddExperience()} className="justify-center items-end">
                  <XMarkIcon size={23} color={iconColor} strokeWidth={2} />
                </TouchableOpacity>

                <View className="mb-5 w-full justify-center items-start">
                  <Text className="mb-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('position_or_study_placeholder')}</Text>
                  <View className="w-full  px-5 justify-center items-start rounded-full bg-[#f2f2f2] dark:bg-[#272626]">
                    <TextInput
                      placeholder={t('position_or_study_placeholder')}
                      selectionColor={cursorColorChange}
                      placeholderTextColor={placeHolderTextColorChange}
                      onChangeText={inputPositionChanged}
                      value={position}
                      keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                      className="py-3 font-inter-medium w-full text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                    />
                  </View>
                </View>

                <View className="mb-7 w-full justify-center items-start">
                  <Text className="mb-2 font-inter-semibold text-[14px] text-[#444343] dark:text-[#f2f2f2]">{t('place_or_company_placeholder')}</Text>
                  <View className="w-full px-5 justify-center items-start rounded-full bg-[#f2f2f2] dark:bg-[#272626]">
                    <TextInput
                      placeholder={t('place_or_company_placeholder')}
                      selectionColor={cursorColorChange}
                      placeholderTextColor={placeHolderTextColorChange}
                      onChangeText={inputPlaceChanged}
                      value={place}
                      keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                      className="py-3 font-inter-medium w-full text-[13px] text-[#444343] dark:text-[#f2f2f2]"
                    />
                  </View>
                </View>

                <View className="flex-row justify-center items-center">

                  {(!openStartDate && !openEndDate) && (
                    <>
                      <TouchableOpacity onPress={() => { setOpenStartDate(true); setShowStartPicker(true) }} className="flex-1 justify-center items-center">
                        <Text className="font-inter-semibold text-[14px] text-center underline underline-offset-2 text-[#444343] dark:text-[#f2f2f2]">{t('started')}</Text>
                        <Text className="mt-3 font-inter-medium text-[14px] text-center  text-[#b6b5b5] dark:text-[#706f6e]">{startDate.toLocaleDateString()}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => { setOpenEndDate(true); setShowEndPicker(true) }} className="flex-1 justify-center items-center">
                        <Text className={`font-inter-semibold text-[14px] text-center underline underline-offset-2 ${endDate && endDate < startDate ? 'text-[#ff633e]' : 'text-[#444343] dark:text-[#f2f2f2]'}`}>{t('end')}</Text>
                        <Text className="mt-3 font-inter-medium text-[14px] text-center  text-[#b6b5b5] dark:text-[#706f6e]">{endDate ? endDate.toLocaleDateString() : t('still_here')}</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {openStartDate && (
                    <View>
                      {showStartPicker && (
                        <View className={Platform.OS === 'ios' ? 'w-[300px] h-[110px] items-center justify-center' : 'w-[0px] h-[0px] items-center justify-center'}>
                          <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={handleStartDateChange}
                            style={styles.picker}
                          />
                        </View>
                      )}
                      {Platform.OS === 'ios' ? (
                        <View className="flex-row justify-between px-12">
                          <TouchableOpacity onPress={handleCancelStartDate}>
                            <Text className="mt-3 font-inter-medium text-[15px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleAcceptStartDate}>
                            <Text className="mt-3 font-inter-semibold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">{t('accept')}</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}

                    </View>
                  )}

                  {openEndDate && (
                    <View>
                      {showEndPicker && (
                        <View className={Platform.OS === 'ios' ? 'w-[300px] h-[110px] items-center justify-center' : 'w-[0px] h-[0px] items-center justify-center'}>
                          <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={handleEndDateChange}
                            style={styles.picker}
                          />
                        </View>
                      )}
                      {Platform.OS === 'ios' ? (
                        <View className="flex-row justify-between px-12">
                          <TouchableOpacity onPress={handleCancelEndDate}>
                            <Text className="mt-3 font-inter-medium text-[15px] text-center text-[#b6b5b5] dark:text-[#706f6e]">{t('cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleAcceptEndDate}>
                            <Text className="mt-3 font-inter-semibold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">{t('accept')}</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}

                    </View>
                  )}


                </View>

                <TouchableOpacity
                  disabled={endDate && endDate < startDate || position.length === 0}
                  style={{ opacity: endDate && endDate < startDate || position.length === 0 ? 0.2 : 1 }}
                  className={`mt-3 justify-center items-center`}
                  onPress={() => handleSave()}
                >
                  <Text className="mt-5 font-inter-bold text-[15px] text-center text-[#706F6E] dark:text-[#b6b5b5]">
                    {t('save')}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          )}


        </View>
      </ScrollView>

      {/* Botones fijos abajo */}
      <View className="flex-row justify-center items-center pt-4 pb-6 px-6">
        <TouchableOpacity onPress={() => navigation.navigate('CreateServiceLocation', { prevParams: { ...prevParams, experiences } })} style={{ opacity: 1 }} className="bg-[#e0e0e0] dark:bg-[#3d3d3d] w-1/4 h-[55px] rounded-full items-center justify-center">
          <Text className="font-inter-medium text-[15px] text-[#323131] dark:text-[#fcfcfc]">{t('back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={false}
onPress={() => navigation.navigate('CreateServiceImages', { prevParams: { ...prevParams, experiences } })}
          style={{ opacity: 1 }}
          className="ml-[10px] bg-[#323131] dark:bg-[#fcfcfc] w-3/4 h-[55px] rounded-full items-center justify-center"
        >
          <Text className="font-inter-semibold text-[15px] text-[#fcfcfc] dark:text-[#323131]">{t('continue')}</Text>
        </TouchableOpacity>
      </View>

      <ModalMessage
        visible={invalidPriceVisible}
        title={t('invalid_price')}
        description={t('set_a_valid_price')}
        showCancel={false}
        confirmText={t('ok')}
        onConfirm={dismissInvalidPriceModal}
        onDismiss={dismissInvalidPriceModal}
      />
      <ServiceFormUnsavedModal
        visible={confirmVisible}
        onSave={handleConfirmSave}
        onDiscard={handleDiscardChanges}
        onDismiss={handleDismissConfirm}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  picker: {
    flex: 1,
  },
});