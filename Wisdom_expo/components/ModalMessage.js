import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Modal, StyleSheet } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DEFAULT_PALETTE = {
  // Superficies
  surfaceLight: '#FCFCFC',    // fondo en claro (tu: fcfcfc)
  surfaceDark:  '#202020',    // fondo en oscuro (ajústalo si usas otro)

  // Texto principal (títulos)
  textDarkOnLight: '#323131', // texto oscuro para fondo claro
  textLightOnDark: '#F2F2F2', // texto claro para fondo oscuro

  // Texto secundario / descripción
  descOnLight: '#979797',
  descOnDark:  '#979797',

  // Botón principal (confirmar)
  primaryLight:    '#323131',
  onPrimaryLight:  '#F2F2F2',
  primaryDark:     '#FCFCFC',
  onPrimaryDark:   '#323131',

  // Botón secundario (cancelar)
  secondaryLight:   '#E5E5E5',
  onSecondaryLight: '#323131',
  secondaryDark:    '#3D3D3D',
  onSecondaryDark:  '#F2F2F2',

  // Sombras
  shadowOpacityLight: 0.10,
  shadowOpacityDark:  0.25,
};

function getTheme(colorScheme, palette) {
  const isDark = colorScheme === 'dark';
  return {
    isDark,
    surface: isDark ? palette.surfaceDark : palette.surfaceLight,
    title: isDark ? palette.textLightOnDark : palette.textDarkOnLight,
    description: isDark ? palette.descOnDark : palette.descOnLight,

    // Botones
    btnPrimaryBg:   isDark ? palette.primaryDark     : palette.primaryLight,
    btnPrimaryText: isDark ? palette.onPrimaryDark   : palette.onPrimaryLight,
    btnSecBg:       isDark ? palette.secondaryDark   : palette.secondaryLight,
    btnSecText:     isDark ? palette.onSecondaryDark : palette.onSecondaryLight,

    shadowOpacity:  isDark ? palette.shadowOpacityDark : palette.shadowOpacityLight,
    overlay: isDark? "rgba(0, 0, 0, 0.5)": "rgba(0, 0, 0, 0.3)",
  };
}

const ModalMessage = ({
  visible = false,
  title = "Missatge",
  description = "Descripció",
  onConfirm,
  onCancel,
  onDismiss,
  confirmText = "D'acord",
  cancelText = "Cancel·lar",
  showCancel = true,
  showCancelColor = false,
  style = {},
  titleStyle = {},
  descriptionStyle = {},
  confirmButtonStyle = {},
  cancelButtonStyle = {},
  confirmButtonTextStyle = {},
  cancelButtonTextStyle = {},

  // Overrides opcionales (si los pasas, pisan el tema)
  backgroundColor: backgroundColorProp,
  titleColor: titleColorProp,
  descriptionColor: descriptionColorProp,
  confirmButtonColor: confirmBgProp,
  cancelButtonColor: cancelBgProp,
  confirmButtonTextColor: confirmFgProp,
  cancelButtonTextColor: cancelFgProp,

  overlayColor: overlayColorProp, //missing
  dismissOnBackdropPress = true,
  palette = DEFAULT_PALETTE,
}) => {
  const { colorScheme } = useColorScheme();
  const theme = getTheme(colorScheme, { ...DEFAULT_PALETTE, ...palette });

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      if (onDismiss) onDismiss();
    });
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    hideModal();
  };

  if (!isMounted) return null;

  // Resueltos finales con posibilidad de override por props
  const resolved = {
    surface: backgroundColorProp ?? theme.surface,
    title: titleColorProp ?? theme.title,
    description: descriptionColorProp ?? theme.description,
    confirmBg: confirmBgProp ?? theme.btnPrimaryBg,
    confirmFg: confirmFgProp ?? theme.btnPrimaryText,
    cancelBg: cancelBgProp ?? theme.btnSecBg,
    cancelFg: cancelFgProp ?? theme.btnSecText,
    overlay: overlayColorProp?? theme.overlay,
  };


  return (
    <Modal 
      visible={isMounted} 
      transparent 
      animationType="fade" 
      statusBarTranslucent 
      onRequestClose={hideModal} 
    > 
      <Animated.View 
        style={{ 
          flex: 1, 
          backgroundColor: resolved.overlay, 
          justifyContent: 'center', 
          alignItems: 'center', 
          opacity: opacityAnim, 
        }} 
      >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={dismissOnBackdropPress ? hideModal : undefined}
      />

      <Animated.View
        style={[
          {
            backgroundColor: resolved.surface,
            margin: 32,
            padding: 24,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme.shadowOpacity,
            shadowRadius: 6,
            elevation: 8,
            transform: [{ scale: scaleAnim }],
            minWidth: screenWidth * 0.8,
            maxWidth: screenWidth * 0.9,
          },
          style,
        ]}
      >
        <Text
          style={[
            {
              fontSize: 16,
              fontWeight: '600',
              color: resolved.title,
              textAlign: 'center',
              marginBottom: description===""? 40 : 12,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>

        {!!description && (
          <Text
            style={[
              {
                fontSize: 13,
                fontWeight: '400',
                color: resolved.description,
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 22,
              },
              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleConfirm}
          style={[
            {
              backgroundColor: resolved.confirmBg,
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 28,
              alignItems: 'center',
              marginBottom: showCancel ? 12 : 0,
            },
            confirmButtonStyle,
          ]}
        >
          <Text
            style={[
              { color: resolved.confirmFg, fontSize: 14, fontWeight: '500' },
              confirmButtonTextStyle,
            ]}
          >
            {confirmText}
          </Text>
        </TouchableOpacity>

        {showCancel && (
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              {
                backgroundColor: showCancelColor? resolved.cancelBg : null,
                paddingVertical: showCancelColor? 14 : 7,
                paddingHorizontal: 28,
                borderRadius: 28,
                alignItems: 'center',
              },
              cancelButtonStyle,
            ]}
          >
            <Text
              style={[
                { color: resolved.cancelFg, fontSize: 14, fontWeight: '500' },
                cancelButtonTextStyle,
              ]}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
    </Modal>
  );
};

export default ModalMessage;
