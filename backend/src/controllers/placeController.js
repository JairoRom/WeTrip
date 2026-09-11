import { TouristPlace, City } from '../models/index.js';

// Obtener lugares de una ciudad (público)
export const getPlacesByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    
    const places = await TouristPlace.findAll({
      where: { cityId, active: true },
      include: [{ model: City, as: 'city' }],
      order: [['rating', 'DESC']],
      limit: 3
    });
    
    res.json({
      success: true,
      data: places
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener lugares',
      error: error.message
    });
  }
};

// Crear lugar turístico (solo admin)
export const createPlace = async (req, res) => {
  try {
    const { cityId, name, description, address, category, image, latitude, longitude, rating } = req.body;
    
    const place = await TouristPlace.create({
      cityId,
      name,
      description,
      address,
      category,
      image,
      latitude,
      longitude,
      rating,
      active: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Lugar turístico creado exitosamente',
      data: place
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear lugar turístico',
      error: error.message
    });
  }
};

// Actualizar lugar turístico (solo admin)
export const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await TouristPlace.findByPk(id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Lugar turístico no encontrado'
      });
    }
    
    await place.update(req.body);
    
    res.json({
      success: true,
      message: 'Lugar turístico actualizado exitosamente',
      data: place
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar lugar turístico',
      error: error.message
    });
  }
};

// Activar/desactivar lugar (solo admin)
export const togglePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await TouristPlace.findByPk(id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Lugar turístico no encontrado'
      });
    }
    
    place.active = !place.active;
    await place.save();
    
    res.json({
      success: true,
      message: `Lugar ${place.active ? 'activado' : 'desactivado'} exitosamente`,
      data: place
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del lugar',
      error: error.message
    });
  }
};

// Eliminar lugar turístico (solo admin)
export const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await TouristPlace.findByPk(id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Lugar turístico no encontrado'
      });
    }
    
    await place.destroy();
    
    res.json({
      success: true,
      message: 'Lugar turístico eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar lugar turístico',
      error: error.message
    });
  }
};