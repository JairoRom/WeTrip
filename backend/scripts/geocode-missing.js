import sequelize from '../src/config/database.js';
import City from '../src/models/City.js';
import axios from 'axios';

// Pausa obligatoria de Nominatim (1 petición por segundo)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCoords = async (cityName, country) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${cityName}, ${country}`,
        format: 'json',
        limit: 1,
        'accept-language': 'es'
      },
      headers: {
        'User-Agent': 'WeTrip-App/1.0 (https://github.com/JairoRom/WeTrip)'
      },
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

const geocodeMissing = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la BD');

    // Obtener TOTAL de ciudades sin coordenadas
    const total = await City.count({ where: { latitude: null } });
    console.log(`📍 Ciudades sin coordenadas: ${total}`);

    if (total === 0) {
      console.log('🎉 Todas las ciudades ya tienen coordenadas');
      process.exit(0);
    }

    // Procesar en lotes para no perder progreso si se corta
    const BATCH_SIZE = 500;
    let processed = 0;
    let updated = 0;

    while (processed < total) {
      const cities = await City.findAll({
        where: { latitude: null },
        limit: BATCH_SIZE,
        order: [['id', 'ASC']]
      });

      if (cities.length === 0) break;

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const coords = await getCoords(city.name, city.country);
        
        if (coords) {
          await city.update(coords);
          updated++;
          console.log(`✅ [${processed + i + 1}/${total}] ${city.name} → ${coords.latitude}, ${coords.longitude}`);
        } else {
          console.log(`⚠️ [${processed + i + 1}/${total}] ${city.name} → sin resultados`);
          // Marcar como procesada (coordenadas 0,0 para no reintentar)
          await city.update({ latitude: 0, longitude: 0 });
        }

        // Pausa obligatoria de 1 segundo
        await sleep(1100);
      }

      processed += cities.length;
    }

    console.log(`\n🎉 Proceso finalizado`);
    console.log(`   Actualizadas: ${updated}/${total}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

geocodeMissing();