import axios from 'axios';

export const getWeatherByCity = async (cityName) => {
  try {
    // 1. Geocodificar la ciudad (obtener lat/lon)
    const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: cityName,
        count: 1,
        language: 'es',
        format: 'json'
      }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      throw new Error('Ciudad no encontrada');
    }

    const { latitude, longitude, name, country } = geoResponse.data.results[0];

    // 2. Obtener clima actual
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        timezone: 'auto'
      }
    });

    const current = weatherResponse.data.current;

    // 3. Mapear código de clima a descripción
    const weatherCodes = {
      0: 'cielo despejado',
      1: 'mayormente despejado',
      2: 'parcialmente nublado',
      3: 'nublado',
      45: 'niebla',
      48: 'niebla con escarcha',
      51: 'llovizna ligera',
      53: 'llovizna moderada',
      55: 'llovizna densa',
      61: 'lluvia ligera',
      63: 'lluvia moderada',
      65: 'lluvia fuerte',
      71: 'nieve ligera',
      73: 'nieve moderada',
      75: 'nieve fuerte',
      95: 'tormenta'
    };

    return {
      city: name,
      country,
      temperature: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature),
      description: weatherCodes[current.weather_code] || 'desconocido',
      icon: '',
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      pressure: 0
    };
  } catch (error) {
    console.error('Error obteniendo clima:', error.message);
    throw new Error('No se pudo obtener el clima de la ciudad');
  }
};