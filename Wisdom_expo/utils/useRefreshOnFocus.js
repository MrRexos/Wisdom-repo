import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

export default function useRefreshOnFocus(callback) {
  const callbackRef = useRef(callback);
  const isFocused = useIsFocused();
  callbackRef.current = callback;

  useFocusEffect(
    useCallback(() => {
      callbackRef.current?.();
    }, [])
  );

  useEffect(() => {
    if (!isFocused) return;

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        callbackRef.current?.();
      }
    });

    return () => subscription.remove();
  }, [isFocused]);
}
