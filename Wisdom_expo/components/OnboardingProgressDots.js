import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function OnboardingProgressDots({ currentStep = 0, totalSteps = 1 }) {
  const { colorScheme } = useColorScheme();
  const activeColor = colorScheme === 'dark' ? '#f2f2f2' : '#323131';
  const inactiveColor = colorScheme === 'dark' ? '#3D3D3D' : '#E0E0E0';

  return (
    <View className="flex-row items-center justify-center mt-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: index === currentStep ? activeColor : inactiveColor,
            opacity: index === currentStep ? 1 : 0.45,
            marginRight: index !== totalSteps - 1 ? 8 : 0,
          }}
          className="h-[8px] w-[8px] rounded-full"
        />
      ))}
    </View>
  );
}
