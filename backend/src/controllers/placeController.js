import { TouristPlace, City } from '../models/index.js';
import { findTouristPlaces } from '../services/overpassService.js';
import { getCoordinatesFromAddress } from '../services/geocodingService.js';

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
// Crear lugar turístico (solo admin)
export const createPlace = async (req, res) => {
  try {
    let { cityId, name, description, address, category, image, latitude, longitude, rating } = req.body;

    // Si no se proporcionan coordenadas pero sí una dirección, geocodificamos
    if ((!latitude || !longitude) && address) {
      try {
        // Obtener la ciudad para incluirla en la búsqueda
        const city = await City.findByPk(cityId);
        const cityName = city ? city.name : '';
        const countryName = city ? city.country : '';

        const coords = await getCoordinatesFromAddress(address, cityName, countryName);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          console.log(`📍 Coordenadas asignadas: ${latitude}, ${longitude}`);
        } else {
          console.warn(`⚠️ No se pudieron obtener coordenadas para: ${address}`);
        }
      } catch (geoError) {
        console.warn('⚠️ Error en geocodificación:', geoError.message);
      }
    }

    const place = await TouristPlace.create({
      cityId,
      name,
      description,
      address,
      category,
      image,
      latitude: latitude || null,
      longitude: longitude || null,
      rating,
      active: true
    });

    res.status(201).json({
      success: true,
      message: 'Lugar turístico creado exitosamente',
      data: place
    });
  } catch (error) {
    console.error('Error al crear lugar turístico:', error);
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

    let updateData = { ...req.body };

    // Si se cambió la dirección y no se proporcionaron nuevas coordenadas, re-geocodificamos
    const addressChanged = updateData.address && updateData.address !== place.address;
    const noCoordsProvided = !updateData.latitude || !updateData.longitude;

    if (addressChanged && noCoordsProvided) {
      try {
        const coords = await getCoordinatesFromAddress(updateData.address);
        if (coords) {
          updateData.latitude = coords.latitude;
          updateData.longitude = coords.longitude;
          console.log(`📍 Coordenadas actualizadas para "${updateData.address}": ${coords.latitude}, ${coords.longitude}`);
        }
      } catch (geoError) {
        console.warn('⚠️ Error en geocodificación:', geoError.message);
      }
    }

    await place.update(updateData);
    
    res.json({
      success: true,
      message: 'Lugar turístico actualizado exitosamente',
      data: place
    });
  } catch (error) {
    console.error('Error al actualizar lugar turístico:', error);
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

// Importar lugares desde OpenStreetMap (Overpass API) - solo admin
export const importPlacesFromOSM = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren latitud y longitud.'
      });
    }

    // Buscar lugares en OpenStreetMap
    const placesData = await findTouristPlaces(latitude, longitude);

    if (placesData.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron lugares turísticos cerca de estas coordenadas.',
        data: []
      });
    }

    // Insertar los lugares en nuestra base de datos
    const insertedPlaces = [];
    for (const place of placesData) {
      // Evitar duplicados por nombre y ciudad
      const [newPlace, created] = await TouristPlace.findOrCreate({
        where: { name: place.name, cityId },
        defaults: { ...place, cityId, active: true }
      });
      if (created) insertedPlaces.push(newPlace);
    }

    res.json({
      success: true,
      message: `Se importaron ${insertedPlaces.length} lugares nuevos.`,
      data: insertedPlaces
    });

  } catch (error) {
    console.error('Error al importar lugares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar lugares desde OpenStreetMap.'
    });
  }
};

// Obtener un lugar por ID (público)
export const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await TouristPlace.findByPk(id, {
      include: [{ model: City, as: 'city' }]
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Lugar turístico no encontrado'
      });
    }

    res.json({
      success: true,
      data: place
    });
  } catch (error) {
    console.error('Error al obtener lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lugar',
      error: error.message
    });
  }
};