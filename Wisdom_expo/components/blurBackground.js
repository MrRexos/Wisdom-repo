
import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';

const BlurBackground = ({ visible, children }) => {
  return (
    <Modal transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <BlurView style={styles.blur} blurType="light" blurAmount={10} intensity={70}/>
          {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(151, 151, 151, 0.5)', // Blanco con poca opacidad
  },
  blur: {
    ...StyleSheet.absoluteFillObject, // Ocupa todo el fondo
  },
});

export default BlurBackground;
