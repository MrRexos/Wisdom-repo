import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function useRefreshOnFocus(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useFocusEffect(
    useCallback(() => {
      callbackRef.current?.();
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        callbackRef.current?.();
      }
    });
    return () => subscription.remove();
  }, []);
}
