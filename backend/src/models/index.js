import sequelize from '../config/database.js';
import User from './User.js';
import City from './City.js';
import TouristPlace from './TouristPlace.js';

export {
  sequelize,
  User,
  City,
  TouristPlace
};

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sync sin alter para evitar el error ER_TOO_MANY_KEYS
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    throw error;
  }
};