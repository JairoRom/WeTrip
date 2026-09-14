import { Favorite, City } from '../models/index.js';

// Obtener todos los favoritos del usuario autenticado
export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [{
        model: City,
        as: 'city',
        attributes: ['id', 'name', 'country', 'description', 'image', 'latitude', 'longitude']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos',
      error: error.message
    });
  }
};

// Añadir ciudad a favoritos
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cityId } = req.body;

    if (!cityId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cityId'
      });
    }

    // Verificar que la ciudad existe
    const city = await City.findByPk(cityId);
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Ciudad no encontrada'
      });
    }

    // Verificar si ya está en favoritos
    const existing = await Favorite.findOne({ where: { userId, cityId } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Esta ciudad ya está en tus favoritos'
      });
    }

    const favorite = await Favorite.create({ userId, cityId });

    res.status(201).json({
      success: true,
      message: 'Ciudad añadida a favoritos',
      data: favorite
    });
  } catch (error) {
    console.error('Error al añadir favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al añadir a favoritos',
      error: error.message
    });
  }
};

// Quitar ciudad de favoritos
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cityId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, cityId }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Esta ciudad no está en tus favoritos'
      });
    }

    await favorite.destroy();

    res.json({
      success: true,
      message: 'Ciudad eliminada de favoritos'
    });
  } catch (error) {
    console.error('Error al quitar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al quitar de favoritos',
      error: error.message
    });
  }
};

// Verificar si una ciudad es favorita del usuario
export const isFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cityId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, cityId }
    });

    res.json({
      success: true,
      data: { isFavorite: !!favorite }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar favorito',
      error: error.message
    });
  }
};