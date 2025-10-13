import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function ServiceFormHeader({ onBack, onSave, showSave, saving }) {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#706F6E' : '#B6B5B5';

  return (
    <View className="flex-row items-center justify-between">
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <ChevronLeftIcon size={26} color={iconColor} strokeWidth={2} />
      </TouchableOpacity>
      {showSave ? (
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
          className="px-3 py-2 rounded-full bg-[#E0E0E0] dark:bg-[#3D3D3D]"
        >
          <Text className="font-inter-medium text-[12px] text-[#706f6e] dark:text-[#b6b5b5]">
            {saving ? t('saving') : t('save')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 70 }} />
      )}
    </View>
  );
}
