import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

const DEFAULT_PALETTE = {
  // Ajusta estos valores a tu paleta si quieres
  brand: '#706B5B',
  success: '#22C55E',
  error: '#EF4444',
  surfaceLight: '#FCFCFC',
  surfaceDark: '#202020',
  textLight: '#444343',
  textDark: '#f2f2f2',
  mutedLight: '#6B7280',
  mutedDark: '#A3A3A3',
};

function getTheme(colorScheme, palette, mark) {
  const isDark = colorScheme === 'dark';
  const surface = isDark ? palette.surfaceDark : palette.surfaceLight;
  const title = isDark ? palette.textDark : palette.textLight;
  const description = isDark ? palette.mutedDark : palette.mutedLight;
  const accent = colorScheme === 'dark' ? '#fcfcfc' : '#323131';

  return { isDark, surface, title, description, accent };
}

const SlideMessage = ({
  visible = false,
  title = 'Missatge',
  description = 'Descripció',
  onDismiss,
  autoHide = true,
  autoHideDelay = 2200,
  style = {},
  titleStyle = {},
  descriptionStyle = {},
  palette = DEFAULT_PALETTE,
  // Nueva prop: 'check' | 'cross'
  mark = 'check',
}) => {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = getTheme(colorScheme, { ...DEFAULT_PALETTE, ...palette }, mark);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      showMessage();
    } else {
      hideMessage(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [visible]);

  const showMessage = () => {
    slideAnim.setValue(-100);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    if (autoHide) {
      timeoutRef.current = setTimeout(() => hideMessage(), autoHideDelay);
    }
  };

  const hideMessage = (emit = true) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (emit && onDismiss) onDismiss();
    });
  };

  const onGestureEvent = (event) => {
    const { translationY } = event.nativeEvent;
    if (translationY < -50) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      hideMessage();
    }
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      if (translationY < -50) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        hideMessage();
      }
    }
  };

  if (!visible) return null;

  // Offset para “bajar un poco más”: se coloca bajo el notch + margen extra
  const topOffset = (insets?.top ?? 0) + 5;

  const Icon = mark === 'cross' ? XCircleIcon : CheckCircleIcon;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: topOffset,
            left: 0,
            right: 0,
            zIndex: 1000,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
          style,
        ]}
        pointerEvents="box-none"
      >
        <View
          style={{
            marginHorizontal: 16,
          }}
          pointerEvents="box-none"
        >
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 14,
              paddingVertical: 9,
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: colorScheme === 'dark' ? 0.2 : 0.1,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <View
              style={{
                width: 41,
                height: 41,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={25} color={theme.accent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  {
                    fontSize: 15,
                    fontWeight: '400',
                    color: theme.title,
                    marginBottom: description ? 2 : 0,
                  },
                  titleStyle,
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>

              {/* {!!description && (
                <Text
                  style={[
                    {
                      fontSize: 13,
                      color: theme.description,
                    },
                    descriptionStyle,
                  ]}
                  numberOfLines={3}
                >
                  {description}
                </Text>
              )} */}

            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default SlideMessage;
