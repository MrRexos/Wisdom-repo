import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function OnboardingProgressDots({ currentStep = 0, totalSteps = 1 }) {
  const { colorScheme } = useColorScheme();
  const activeColor = colorScheme === 'dark' ? '#706f6e' : '#b6b5b5';
  const inactiveColor = colorScheme === 'dark' ? '#474646' : '#d4d4d3';

  return (
    <View className="flex-row items-center justify-center mt-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: index === currentStep ? activeColor : inactiveColor,
            opacity: index === currentStep ? 1 : 0.45,
            marginRight: index !== totalSteps - 1 ? 5 : 0,
          }}
          className="h-[7px] w-[7px] rounded-full"
        />
      ))}
    </View>
  );
}
