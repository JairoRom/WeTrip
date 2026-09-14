import { City } from '../models/index.js';

// Obtener todas las ciudades (público, con paginación y búsqueda)
export const getCities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    
    // Si limit=all o limit=0, devolver TODAS las ciudades (sin paginación)
    const returnAll = req.query.limit === 'all' || req.query.limit === '0';
    
    let limit, offset;
    if (returnAll) {
      limit = null; // Sin límite
      offset = null;
    } else {
      limit = parseInt(req.query.limit) || 20;
      offset = (page - 1) * limit;
    }

    // Construir filtro de búsqueda
    const where = { active: true };
    if (search) {
      const { Op } = await import('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } }
      ];
    }

    const queryOptions = {
      where,
      order: [['name', 'ASC']]
    };

    if (!returnAll) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { count, rows } = await City.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        totalPages: returnAll ? 1 : Math.ceil(count / limit),
        currentPage: returnAll ? 1 : page,
        limit: returnAll ? count : limit
      }
    });
  } catch (error) {
    console.error('Error en getCities:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ciudades',
      error: error.message
    });
  }
};

// Obtener una ciudad por ID (público)
export const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Ciudad no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ciudad',
      error: error.message
    });
  }
};

// Crear ciudad (solo admin)
export const createCity = async (req, res) => {
  try {
    const { name, country, description, image, latitude, longitude, population } = req.body;
    
    const city = await City.create({
      name,
      country,
      description,
      image,
      latitude,
      longitude,
      population,
      active: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Ciudad creada exitosamente',
      data: city
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear ciudad',
      error: error.message
    });
  }
};

// Actualizar ciudad (solo admin)
export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Ciudad no encontrada'
      });
    }
    
    await city.update(req.body);
    
    res.json({
      success: true,
      message: 'Ciudad actualizada exitosamente',
      data: city
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ciudad',
      error: error.message
    });
  }
};

// Eliminar ciudad (solo admin)
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Ciudad no encontrada'
      });
    }
    
    await city.destroy();
    
    res.json({
      success: true,
      message: 'Ciudad eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar ciudad',
      error: error.message
    });
  }
};