import React from 'react';
import { Platform } from 'react-native';

if (typeof React.useInsertionEffect === 'function' && Platform.OS !== 'web') {
  React.useInsertionEffect = React.useLayoutEffect;
}
export {};

//hotfix temporal para que no salga el useinsertioneffect must not schedule updates error (revisar en futuro cuando nativewind sea compatible con tailwind v4)