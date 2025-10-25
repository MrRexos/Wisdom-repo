import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function OnboardingProgressDots({ totalSteps, currentStep, style }) {
  const { colorScheme } = useColorScheme();
  const activeColor = colorScheme === 'dark' ? '#f2f2f2' : '#323131';
  const inactiveColor = colorScheme === 'dark' ? '#3D3D3D' : '#D9D9D9';

  return (
    <View className="flex-row items-center justify-center" style={style}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 === currentStep;
        return (
          <View
            key={index}
            style={{
              width: isActive ? 18 : 6,
              height: 6,
              borderRadius: 9999,
              marginHorizontal: 4,
              backgroundColor: isActive ? activeColor : inactiveColor,
              opacity: isActive ? 1 : 0.5,
            }}
          />
        );
      })}
    </View>
  );
}
