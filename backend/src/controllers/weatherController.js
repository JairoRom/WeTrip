import { getWeatherByCity } from '../services/weatherService.js';

export const getWeather = async (req, res) => {
  try {
    const { city } = req.params;
    const weather = await getWeatherByCity(city);
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};