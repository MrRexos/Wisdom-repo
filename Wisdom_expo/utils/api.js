import axios from 'axios';

const api = axios.create({
  baseURL: 'https://wisdom-app-34b3fb420f18.herokuapp.com',
  headers: {
    'Content-Type': 'application/json',
  },
  
});

export default api;