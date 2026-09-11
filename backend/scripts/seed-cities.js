import axios from 'axios';
import sequelize from '../src/config/database.js';
import City from '../src/models/City.js';

// Mapeo de país (API) → nombre en español (BD)
const PAISES_A_IMPORTAR = [
  { apiName: 'Spain', displayName: 'España' }
];

// Función para obtener coordenadas desde Open-Meteo Geocoding
const getCoordinates = async (cityName, country) => {
  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: cityName,
        count: 1,
        language: 'es',
        format: 'json'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      // Verificar que sea del país correcto
      if (result.country && result.country.toLowerCase().includes(country.toLowerCase())) {
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          population: result.population || null
        };
      }
      // Si no coincide el país, igualmente devolvemos las coordenadas
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        population: result.population || null
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Pausa para no saturar la API
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const importarCiudades = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    for (const pais of PAISES_A_IMPORTAR) {
      console.log(`\n🌍 Importando ciudades de: ${pais.displayName}...`);

      try {
        const response = await axios.post(
          'https://countriesnow.space/api/v0.1/countries/cities',
          { country: pais.apiName }
        );

        const ciudades = response.data.data;

        if (!ciudades || ciudades.length === 0) {
          console.warn(`   - No se encontraron ciudades para ${pais.displayName}.`);
          continue;
        }

        console.log(`   - Se encontraron ${ciudades.length} ciudades.`);
        console.log(`   - Obteniendo coordenadas (esto puede tardar)...`);

        let insertadas = 0;
        let conCoords = 0;
        let procesadas = 0;

        for (const nombreCiudad of ciudades) {
          procesadas++;

          // Verificar si ya existe
          const existing = await City.findOne({
            where: { name: nombreCiudad, country: pais.displayName }
          });

          // Si ya existe y tiene coordenadas, saltar
          if (existing && existing.latitude && existing.longitude) {
            continue;
          }

          // Obtener coordenadas
          const coords = await getCoordinates(nombreCiudad, pais.displayName);

          if (existing) {
            // Actualizar coordenadas de ciudad existente
            if (coords) {
              await existing.update(coords);
              conCoords++;
            }
          } else {
            // Crear nueva ciudad con coordenadas
            await City.create({
              name: nombreCiudad,
              country: pais.displayName,
              latitude: coords?.latitude || null,
              longitude: coords?.longitude || null,
              population: coords?.population || null,
              active: true
            });
            insertadas++;
            if (coords) conCoords++;
          }

          // Pausa cada 10 ciudades para no saturar la API
          if (procesadas % 10 === 0) {
            console.log(`   - Procesadas ${procesadas}/${ciudades.length}...`);
            await sleep(500);
          }
        }

        console.log(`   ✅ ${insertadas} ciudades nuevas insertadas.`);
        console.log(`   📍 ${conCoords} ciudades con coordenadas.`);

      } catch (error) {
        console.error(`   ❌ Error al importar ${pais.displayName}:`, error.message);
      }
    }

    console.log('\n🎉 Proceso de importación finalizado.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error general en el script:', error);
    process.exit(1);
  }
};

importarCiudades();