import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function useRefreshOnFocus(callback) {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        callback();
      }
    });
    return () => subscription.remove();
  }, [callback]);
}
