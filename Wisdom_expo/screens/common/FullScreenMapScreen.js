import React from 'react';
import { View, TouchableOpacity, StatusBar, Image } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Minimize2 } from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRegionForRadius } from '../../utils/mapUtils';
import {
  mapMarkerAnchor,
  mapMarkerCenterOffset,
  mapMarkerImage,
  mapMarkerStyle,
} from '../../utils/mapMarkerAssets';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FullScreenMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const { location, actionRate = 0, showMarker = true } = route.params;
  const latitude = location.latitude ?? location.lat;
  const longitude = location.longitude ?? location.lng;

  const region = actionRate && actionRate < 100
    ? getRegionForRadius(latitude, longitude, actionRate)
    : { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.03 };

  
  const topOffset = Math.max(insets.top, StatusBar.currentHeight || 0) + 8; //separa Xpx extra

  return (
    <View className="flex-1">
      <MapView style={{ flex: 1 }} region={region}>
        {showMarker && (
            <>
              <Marker
                coordinate={{ latitude, longitude }}
                anchor={mapMarkerAnchor}
                centerOffset={mapMarkerCenterOffset}
              >
                <Image
                  source={mapMarkerImage}
                  style={mapMarkerStyle}
                  resizeMode="contain"
                />
              </Marker>
              {actionRate < 100 && (
                <Circle
                  center={{ latitude, longitude }}
                  radius={actionRate * 1000}
                  strokeColor="rgba(182,181,181,0.8)"
                  fillColor="rgba(182,181,181,0.5)"
                  strokeWidth={2}
                />
              )}
          </>
        )}
      </MapView>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: topOffset,
          right: 20,
          backgroundColor: colorScheme === 'dark' ? '#3D3D3D' : '#FFFFFF',
          borderRadius: 20,
          padding: 10,
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Minimize2 width={18} height={18} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}
