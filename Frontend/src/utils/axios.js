import axios from 'axios';

const instance = axios.create({
  // Use the environment variable, or fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

instance.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default instance;