import { TouristPlace, City, Tag, PlaceTag } from '../models/index.js';
import { findTouristPlaces } from '../services/overpassService.js';
import { getCoordinatesFromAddress } from '../services/geocodingService.js';

// Obtener lugares de una ciudad (público)
export const getPlacesByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    
    const places = await TouristPlace.findAll({
      where: { cityId, active: true },
      include: [
        { model: City, as: 'city' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ],
      order: [['rating', 'DESC']],
      limit: 3
    });
    
    res.json({ success: true, data: places });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener lugares',
      error: error.message
    });
  }
};

// Obtener un lugar por ID (público)
export const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await TouristPlace.findByPk(id, {
      include: [
        { model: City, as: 'city' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Lugar turístico no encontrado'
      });
    }

    res.json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener lugar',
      error: error.message
    });
  }
};

// Crear lugar turístico (solo admin)
export const createPlace = async (req, res) => {
  try {
    let { cityId, name, description, address, category, image, latitude, longitude, rating, tagIds } = req.body;

    // Geocodificación si no hay coordenadas
    if ((!latitude || !longitude) && address) {
      try {
        const city = await City.findByPk(cityId);
        const cityName = city ? city.name : '';
        const countryName = city ? city.country : '';

        const coords = await getCoordinatesFromAddress(address, cityName, countryName);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          console.log(`📍 Coordenadas asignadas: ${latitude}, ${longitude}`);
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

    // Asignar etiquetas si las hay
    if (tagIds && tagIds.length > 0) {
      const relations = tagIds.map(tagId => ({ placeId: place.id, tagId }));
      await PlaceTag.bulkCreate(relations);
    }

    // Recargar con tags
    const placeWithTags = await TouristPlace.findByPk(place.id, {
      include: [
        { model: City, as: 'city' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Lugar turístico creado exitosamente',
      data: placeWithTags
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
    const { tagIds } = updateData;
    delete updateData.tagIds; // No guardar tagIds en el modelo

    // Re-geocodificar si cambió la dirección y no hay nuevas coordenadas
    const addressChanged = updateData.address && updateData.address !== place.address;
    const noCoordsProvided = !updateData.latitude || !updateData.longitude;

    if (addressChanged && noCoordsProvided) {
      try {
        const city = await City.findByPk(place.cityId);
        const coords = await getCoordinatesFromAddress(
          updateData.address,
          city ? city.name : '',
          city ? city.country : ''
        );
        if (coords) {
          updateData.latitude = coords.latitude;
          updateData.longitude = coords.longitude;
        }
      } catch (geoError) {
        console.warn('⚠️ Error en geocodificación:', geoError.message);
      }
    }

    await place.update(updateData);

    // Actualizar etiquetas si se enviaron
    if (tagIds !== undefined) {
      await PlaceTag.destroy({ where: { placeId: id } });
      if (tagIds.length > 0) {
        const relations = tagIds.map(tagId => ({ placeId: parseInt(id), tagId }));
        await PlaceTag.bulkCreate(relations);
      }
    }

    // Recargar con tags
    const placeWithTags = await TouristPlace.findByPk(id, {
      include: [
        { model: City, as: 'city' },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });

    res.json({
      success: true,
      message: 'Lugar turístico actualizado exitosamente',
      data: placeWithTags
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
    
    // Eliminar relaciones con tags primero
    await PlaceTag.destroy({ where: { placeId: id } });
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

// Importar lugares desde OpenStreetMap (solo admin)
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

    const placesData = await findTouristPlaces(latitude, longitude);

    if (placesData.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron lugares turísticos cerca de estas coordenadas.',
        data: []
      });
    }

    const insertedPlaces = [];
    for (const place of placesData) {
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