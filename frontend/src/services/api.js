import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
export const getCities = (params = {}) => api.get('/cities', { params });
export const getCityById = (id) => api.get(`/cities/${id}`);
export const getCityDetail = (id) => api.get(`/city-detail/${id}`);
export const getWeather = (city) => api.get(`/weather/${city}`);
export const getPlacesByCity = (cityId) => api.get(`/places/city/${cityId}`);
export const getPlaceById = (id) => api.get(`/places/${id}`);

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

// ============ ADMIN - USUARIOS ============
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const changeUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
export const toggleUser = (id) => api.patch(`/users/${id}/toggle`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ============ FAVORITOS (usuarios logueados) ============
export const getMyFavorites = () => api.get('/favorites');
export const addFavorite = (cityId) => api.post('/favorites', { cityId });
export const removeFavorite = (cityId) => api.delete(`/favorites/${cityId}`);
export const checkFavorite = (cityId) => api.get(`/favorites/check/${cityId}`);

// ============ ETIQUETAS (TAGS) ============
export const getTags = () => api.get('/tags');
export const createTag = (data) => api.post('/tags', data);
export const updateTag = (id, data) => api.put(`/tags/${id}`, data);
export const deleteTag = (id) => api.delete(`/tags/${id}`);
export const setPlaceTags = (placeId, tagIds) => api.post(`/tags/place/${placeId}`, { tagIds });

export default api;