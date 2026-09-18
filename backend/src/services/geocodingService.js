import axios from 'axios';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Obtiene las coordenadas de una dirección o nombre de lugar.
 * @param {string} address Dirección completa (ej: "Puerta del Sol, Madrid, España")
 * @param {string} cityName Nombre de la ciudad (opcional, ayuda a filtrar)
 * @param {string} countryName Nombre del país (opcional, ayuda a filtrar)
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const getCoordinatesFromAddress = async (address, cityName = '', countryName = '') => {
  if (!address || address.trim() === '') {
    console.warn('⚠️ Dirección vacía');
    return null;
  }

  // Construir la búsqueda añadiendo ciudad y país si no están ya en la dirección
  let searchQuery = address.trim();
  
  if (cityName && !searchQuery.toLowerCase().includes(cityName.toLowerCase())) {
    searchQuery += `, ${cityName}`;
  }
  if (countryName && !searchQuery.toLowerCase().includes(countryName.toLowerCase())) {
    searchQuery += `, ${countryName}`;
  }

  console.log(`🔍 Buscando coordenadas para: "${searchQuery}"`);

  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q: searchQuery,
        format: 'json',
        limit: 5,           // Pedimos 5 resultados para elegir el mejor
        addressdetails: 1,
        'accept-language': 'es'
      },
      headers: {
        // User-Agent específico y válido (Nominatim lo exige)
        'User-Agent': 'WeTrip-App/1.0 (https://github.com/JairoRom/WeTrip)'
      },
      timeout: 10000
    });

    if (!response.data || response.data.length === 0) {
      console.warn(`⚠️ Sin resultados para: "${searchQuery}"`);
      return null;
    }

    // Log de todos los resultados para depurar
    console.log(`📍 Resultados encontrados (${response.data.length}):`);
    response.data.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.display_name} → ${r.lat}, ${r.lon} (tipo: ${r.type})`);
    });

    // Elegir el mejor resultado
    // Preferimos resultados que sean de tipo "house", "building", "amenity", "tourism", "attraction"
    const preferredTypes = ['house', 'building', 'amenity', 'tourism', 'attraction', 'monument', 'museum', 'historic'];
    let best = response.data.find(r => preferredTypes.includes(r.type));

    // Si no hay uno preferido, tomar el primero
    if (!best) best = response.data[0];

    console.log(`✅ Seleccionado: ${best.display_name} → ${best.lat}, ${best.lon}`);

    return {
      latitude: parseFloat(best.lat),
      longitude: parseFloat(best.lon)
    };

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Timeout en Nominatim');
    } else if (error.response) {
      console.error('❌ Error de Nominatim:', error.response.status, error.response.statusText);
    } else {
      console.error('❌ Error en geocodificación:', error.message);
    }
    return null;
  }
};