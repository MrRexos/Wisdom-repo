import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://wisdom-app-34b3fb420f18.herokuapp.com',
  headers: {
    'Content-Type': 'application/json',
  },
  
});

// Añade el token JWT a cada solicitud si está disponible
api.interceptors.request.use(async config => {
  try {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const user = JSON.parse(data);
      if (user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch (e) {
    console.log('Auth token error', e);
  }
  return config;
});

export default api;