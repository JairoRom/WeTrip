import axios from 'axios';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Busca lugares turísticos cerca de unas coordenadas usando Overpass API (OpenStreetMap).
 * @param {number} lat Latitud
 * @param {number} lon Longitud
 * @param {number} radius Radio de búsqueda en metros
 * @returns {Promise<Array>} Lista de lugares formateados
 */
export const findTouristPlaces = async (lat, lon, radius = 2000) => {
  const query = `
    [out:json][timeout:25];
    (
      nwr["tourism"="attraction"](around:${radius},${lat},${lon});
      nwr["tourism"="museum"](around:${radius},${lat},${lon});
      nwr["historic"="monument"](around:${radius},${lat},${lon});
      nwr["leisure"="park"](around:${radius},${lat},${lon});
    );
    out center 20;
  `;

  try {
    const response = await axios.post(OVERPASS_API_URL, query, {
      headers: { 'Content-Type': 'text/plain' }
    });

    if (!response.data.elements) return [];

    return response.data.elements
      .filter(el => el.tags && el.tags.name)
      .map(el => {
        let category = 'Monumento';
        if (el.tags.tourism === 'museum') category = 'Museo';
        else if (el.tags.leisure === 'park') category = 'Parque';
        else if (el.tags.historic === 'monument') category = 'Monumento';

        const latitude = el.lat || el.center?.lat;
        const longitude = el.lon || el.center?.lon;

        return {
          name: el.tags.name,
          category: category,
          address: el.tags['addr:street'] || null,
          description: el.tags.description || null,
          latitude,
          longitude,
          rating: null
        };
      })
      .filter(place => place.latitude && place.longitude);

  } catch (error) {
    console.error('Error en la consulta a Overpass API:', error.message);
    throw new Error('No se pudieron obtener los lugares turísticos.');
  }
};