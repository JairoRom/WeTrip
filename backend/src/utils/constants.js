// Constantes globales de la aplicación
export const CATEGORIES = {
  MONUMENT: 'Monumento',
  PARK: 'Parque',
  MUSEUM: 'Museo',
  RESTAURANT: 'Restaurante',
  BEACH: 'Playa',
  SHOPPING: 'Centro Comercial'
};

export const MAX_PLACES_PER_CITY = 3;
export const DEFAULT_LANGUAGE = 'es';
export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de'];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export default {
  CATEGORIES,
  MAX_PLACES_PER_CITY,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  HTTP_STATUS,
  USER_ROLES
};