import { Tag, TouristPlace, PlaceTag } from '../models/index.js';

// Listar todas las etiquetas (público)
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener etiquetas',
      error: error.message
    });
  }
};

// Crear etiqueta (admin)
export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }

    // Verificar duplicados
    const existing = await Tag.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre'
      });
    }

    const tag = await Tag.create({
      name: name.trim(),
      color: color || '#3b82f6'
    });

    res.status(201).json({
      success: true,
      message: 'Etiqueta creada',
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear etiqueta',
      error: error.message
    });
  }
};

// Actualizar etiqueta (admin)
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, active } = req.body;

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }

    await tag.update({ name, color, active });

    res.json({
      success: true,
      message: 'Etiqueta actualizada',
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar etiqueta',
      error: error.message
    });
  }
};

// Eliminar etiqueta (admin)
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }

    // Eliminar las relaciones con lugares primero
    await PlaceTag.destroy({ where: { tagId: id } });
    await tag.destroy();

    res.json({
      success: true,
      message: 'Etiqueta eliminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar etiqueta',
      error: error.message
    });
  }
};

// Asignar etiquetas a un lugar (admin)
export const setPlaceTags = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { tagIds } = req.body; // Array de IDs

    const place = await TouristPlace.findByPk(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }

    // Eliminar relaciones actuales
    await PlaceTag.destroy({ where: { placeId } });

    // Crear nuevas relaciones
    if (tagIds && tagIds.length > 0) {
      const relations = tagIds.map(tagId => ({ placeId, tagId }));
      await PlaceTag.bulkCreate(relations);
    }

    res.json({
      success: true,
      message: 'Etiquetas actualizadas'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al asignar etiquetas',
      error: error.message
    });
  }
};