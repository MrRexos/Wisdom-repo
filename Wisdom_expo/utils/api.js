import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://wisdom-app-34b3fb420f18.herokuapp.com';
const ACCESS_KEY = 'auth.access_token';
const REFRESH_KEY = 'auth.refresh_token';

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

// ---------- Interceptor de REQUEST ----------
// Añade Authorization con el access token si existe.
// (Compatibilidad: si no hay access guardado, usa user.token si existe)
api.interceptors.request.use(async (config) => {
  try {
    const access = await AsyncStorage.getItem(ACCESS_KEY);
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
      return config;
    }
    // Fallback compat (hasta que todos migren)
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const user = JSON.parse(data);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (e) {
    console.log('Auth token error', e);
  }
  return config;
});

// ---------- Interceptor de RESPONSE con auto-refresh ----------
let isRefreshing = false;
let subscribers = [];
const subscribe = (cb) => subscribers.push(cb);
const notifyAll = (newAccess) => {
  subscribers.forEach((cb) => cb(newAccess));
  subscribers = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original.__isRetryRequest) {
      // Si ya hay un refresh en curso, esperamos y reintentamos
      if (isRefreshing) {
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
        if (!refresh) throw new Error('No refresh token');

        // Usamos axios "crudo" para no disparar recursivamente interceptores
        const resp = await axios.post(
          `${BASE_URL}/api/token/refresh`,
          { refresh_token: refresh },
          { timeout: 20000, headers: { 'Content-Type': 'application/json' } }
        );

        const newAccess = resp.data?.access_token;
        const newRefresh = resp.data?.refresh_token;
        if (!newAccess || !newRefresh) throw new Error('Respuesta de refresh inválida');

        await setTokens({ access: newAccess, refresh: newRefresh });

        notifyAll(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        await clearTokens();
        // Deja que el flujo actual maneje el 401 (redirigir a login, etc.)
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;