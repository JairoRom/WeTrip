import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ENDPOINTS PÚBLICOS
export const getCities = () => api.get('/cities');
export const getCityById = (id) => api.get(`/cities/${id}`);
export const getCityDetail = (id) => api.get(`/city-detail/${id}`);
export const getWeather = (city) => api.get(`/weather/${city}`);
export const getPlacesByCity = (cityId) => api.get(`/places/city/${cityId}`);

// AUTENTICACIÓN
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => localStorage.removeItem('token');

// ADMIN - CIUDADES
export const createCity = (data) => api.post('/cities', data);
export const updateCity = (id, data) => api.put(`/cities/${id}`, data);
export const deleteCity = (id) => api.delete(`/cities/${id}`);

// ADMIN - LUGARES
export const createPlace = (data) => api.post('/places', data);
export const updatePlace = (id, data) => api.put(`/places/${id}`, data);
export const deletePlace = (id) => api.delete(`/places/${id}`);
export const togglePlace = (id) => api.patch(`/places/${id}/toggle`);

export default api;