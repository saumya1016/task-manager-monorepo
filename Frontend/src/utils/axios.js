import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

instance.interceptors.request.use((config) => {
  const user = JSON.parse(
    sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo')
  );

  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default instance;