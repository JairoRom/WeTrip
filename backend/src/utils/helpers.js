// Funciones auxiliares reutilizables

// Formatear respuesta de API
export const formatResponse = (success, data, message = '') => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

// Validar si un string está vacío
export const isEmpty = (value) => {
  return !value || value.trim() === '';
};

// Generar slug a partir de texto
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Obtener solo los primeros N elementos
export const getTopItems = (array, limit = 3) => {
  return array.slice(0, limit);
};

// Manejar errores de forma consistente
export const handleError = (error) => {
  console.error('❌ Error:', error);
  return {
    message: error.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
};

export default {
  formatResponse,
  isEmpty,
  generateSlug,
  getTopItems,
  handleError
};