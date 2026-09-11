import { City, TouristPlace } from '../models/index.js';
import { getWeatherByCity } from '../services/weatherService.js';

export const getCityDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Obtener ciudad por ID
    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Ciudad no encontrada'
      });
    }

    // 2. Obtener clima actual (usando el nombre de la ciudad)
    let weather = null;
    try {
      weather = await getWeatherByCity(city.name);
    } catch (error) {
      console.warn('No se pudo obtener clima para:', city.name, '-', error.message);
    }

    // 3. Obtener hasta 3 lugares turísticos activos, ordenados por rating
    const places = await TouristPlace.findAll({
      where: { cityId: id, active: true },
      order: [['rating', 'DESC']],
      limit: 3
    });

    res.json({
      success: true,
      data: {
        city,
        weather,
        places
      }
    });
  } catch (error) {
    console.error('Error en getCityDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la ciudad',
      error: error.message
    });
  }
};