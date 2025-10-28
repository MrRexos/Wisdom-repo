import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, StatusBar} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import '../../../languages/i18n';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import eventEmitter from '../../../utils/eventEmitter';

export default function DniCameraScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const { side = 'front' } = route.params || {};

  const { width: screenW, height: screenH } = Dimensions.get('window');
  const guide = useMemo(() => {
    const padding = 24;
    const guideWidth = screenW - padding * 2;
    const ratio = 85.6 / 53.98; // tarjeta DNI aprox 1.586
    const guideHeight = Math.min(guideWidth / ratio, screenH * 0.5);
    const x = (screenW - guideWidth) / 2;
    const y = (screenH - guideHeight) / 2;
    return { x, y, guideWidth, guideHeight, padding };
  }, [screenW, screenH]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
      const data = { uri: photo.uri, base64: photo.base64 };
      eventEmitter.emit('dniCapture', { side, data });
      navigation.goBack();
    } catch (e) {}
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#272626' : '#f2f2f2' }} />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1,  backgroundColor: colorScheme === 'dark' ? '#272626' : '#f2f2f2', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text className="font-inter-medium text-[16px]" style={{ color: iconColor, textAlign: 'center', marginBottom: 18 }}>{t('permission_denied')}</Text>
          <TouchableOpacity onPress={requestPermission} className="rounded-full px-5 py-3" style={{ backgroundColor: colorScheme === 'dark' ? '#fcfcfc' : '#323131' }}>
            <Text className="font-inter-semibold text-[14px]" style={{ color: colorScheme === 'dark' ? '#323131' : '#fcfcfc' }}>{t('continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
        <Svg height={screenH} width={screenW}>
          <Defs>
            <Mask id="dniMask">
              <Rect x={0} y={0} width={screenW} height={screenH} fill="#ffffff" />
              <Rect
                x={guide.x}
                y={guide.y}
                width={guide.guideWidth}
                height={guide.guideHeight}
                rx={18}
                ry={18}
                fill="#000000"
              />
            </Mask>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={screenW}
            height={screenH}
            fill={colorScheme === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)'}
            mask="url(#dniMask)"
          />
          <Rect
            x={guide.x}
            y={guide.y}
            width={guide.guideWidth}
            height={guide.guideHeight}
            rx={18}
            ry={18}
            fill="transparent"
            stroke="#ffffff"
            strokeWidth={3}
          />
        </Svg>
        <View style={{ position: 'absolute', top: 110, left: 16, right: 16, alignItems: 'center' }}>
          <Text className="font-inter-bold text-[24px]" style={{ color: '#ffffff', textAlign: 'center' }}>
            {side === 'front' ? t('add_front_of_dni') : t('add_back_of_dni')}
          </Text>
          <Text className="px-4 font-inter-medium text-[15px] mt-2" style={{ color: '#979797', textAlign: 'center' }}>
            {t('align_dni_with_frame')}
          </Text>
        </View>
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + insets.top : insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}>
        <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="pl-6 pt-5">
            <ChevronLeftIcon size={24} color={'#ffffff'} strokeWidth={1.8}/>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 60, alignItems: 'center' }}>
        <TouchableOpacity onPress={takePicture} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', borderColor:"#000000", borderWidth: 2 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

