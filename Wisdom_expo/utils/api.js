import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://wisdom-app-34b3fb420f18.herokuapp.com';
const ACCESS_KEY = 'auth.access_token';
const REFRESH_KEY = 'auth.refresh_token';

// Callback global para reaccionar a expiración de sesión
let onAuthExpired = null;
export function setOnAuthExpired(cb) {
  onAuthExpired = typeof cb === 'function' ? cb : null;
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

export async function getTokens() {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem(ACCESS_KEY),
    AsyncStorage.getItem(REFRESH_KEY),
  ]);
  return { access, refresh };
}

export async function setTokens({ access, refresh }) {
  const ops = [];
  if (typeof access === 'string') ops.push(AsyncStorage.setItem(ACCESS_KEY, access));
  if (typeof refresh === 'string') ops.push(AsyncStorage.setItem(REFRESH_KEY, refresh));
  await Promise.all(ops);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}

// ---------- REQUEST: añade Authorization ----------
api.interceptors.request.use(async (config) => {
    // --- Anti-304 en API autenticada --- 
  // Evita revalidación condicional que podría devolver 304 en lugar de 401 
  if (config && config.headers) { 
    delete config.headers['If-None-Match']; 
    delete config.headers['If-Modified-Since']; 
    config.headers['Cache-Control'] = 'no-cache'; 
  } 

  try {
    const access = await AsyncStorage.getItem(ACCESS_KEY);
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
      return config;
    }
    // Fallback compat: user.token
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const user = JSON.parse(data);
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (e) {
    console.log('Auth token error', e);
  }
  return config;
});

// ---------- RESPONSE: auto-refresh + redirección si refresh caduca ----------
let isRefreshing = false;
let subscribers = [];
const subscribe = (cb) => subscribers.push(cb);
const notifyAll = (newAccess) => { subscribers.forEach((cb) => cb(newAccess)); subscribers = []; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status; 
    const errStr = error.response?.data?.error; 
    const www = error.response?.headers?.['www-authenticate'] || ''; 
    const rfcExpired = /error="invalid_token".*expired/i.test(www); 
    // Dispara refresh si: 401, o 403 con token_expired, o cabecera RFC indicando token expirado 
    const isAuthError = status === 401 || rfcExpired || (status === 403 && errStr === 'token_expired'); 

    
    if (isAuthError && !original.__isRetryRequest) {
      console.log('[auth] intentando refresh…', { status, errStr, www });
      if (isRefreshing) {
        // espera a que termine otro refresh y reintenta
        return new Promise((resolve) => {
          subscribe((newAccess) => {
            original.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      original.__isRetryRequest = true;

      try {
        const refresh = await AsyncStorage.getItem(REFRESH_KEY);
        if (!refresh) throw { response: { status: 401 } }; // fuerza flujo de expiración

        const resp = await axios.post(
          `${BASE_URL}/api/token/refresh`,
          { refresh_token: refresh },
          { timeout: 20000, headers: { 'Content-Type': 'application/json' } }
        );


        const newAccess = resp.data?.access_token;
        const newRefresh = resp.data?.refresh_token;
        if (!newAccess || !newRefresh) throw { response: { status: 401 } };

        await setTokens({ access: newAccess, refresh: newRefresh });

        notifyAll(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        // Solo redirigimos si es 401 (caducado/invalid). Si es red/timeout no expulsamos.
        const st = e?.response?.status; 
        const errStr2 = e?.response?.data?.error; 
        const www2 = e?.response?.headers?.['www-authenticate'] || ''; 
        const rfcExpired2 = /error="invalid_token".*expired/i.test(www2); 
        const isExpired = st === 401 || rfcExpired2 || (st === 403 && errStr2 === 'token_expired'); 
        if (isExpired) {
          try {
            await clearTokens();
            await AsyncStorage.setItem('user', JSON.stringify({ token: false }));
          } finally {
            if (onAuthExpired) onAuthExpired(); // dispara redirección global
          }
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;