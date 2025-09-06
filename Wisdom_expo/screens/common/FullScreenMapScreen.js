import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Minimize2 } from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { getRegionForRadius } from '../../utils/mapUtils';

export default function FullScreenMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const { location, actionRate = 0 } = route.params;
  const latitude = location.latitude ?? location.lat;
  const longitude = location.longitude ?? location.lng;

  const region = actionRate && actionRate < 100
    ? getRegionForRadius(latitude, longitude, actionRate)
    : { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.03 };

  return (
    <View className="flex-1">
      <MapView style={{ flex: 1 }} region={region}>
        <Marker
          coordinate={{ latitude, longitude }}
          image={require('../../assets/MapMarker.png')}
          anchor={{ x: 0.5, y: 1 }}
          centerOffset={{ x: 0.5, y: -20 }}
        />
        {actionRate < 100 && (
          <Circle
            center={{ latitude, longitude }}
            radius={actionRate * 1000}
            strokeColor="rgba(182,181,181,0.8)"
            fillColor="rgba(182,181,181,0.5)"
            strokeWidth={2}
          />
        )}
      </MapView>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ position: 'absolute', top: 16, right: 16, backgroundColor: colorScheme === 'dark' ? '#3D3D3D' : '#FFFFFF', borderRadius: 20, padding: 6 }}
      >
        <Minimize2 width={16} height={16} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}
