import sequelize from '../config/database.js';
import User from './User.js';
import City from './City.js';
import TouristPlace from './TouristPlace.js';
import Favorite from './Favorite.js';

// ============ ASOCIACIONES ============

// User ↔ City (favoritos, relación muchos-a-muchos)
User.belongsToMany(City, {
  through: Favorite,
  foreignKey: 'userId',
  otherKey: 'cityId',
  as: 'favoriteCities'
});

City.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'cityId',
  otherKey: 'userId',
  as: 'favoritedBy'
});

// Favorite → User y Favorite → City (asociaciones directas, necesarias para include)
Favorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Favorite.belongsTo(City, {
  foreignKey: 'cityId',
  as: 'city'
});

// City ↔ TouristPlace (una ciudad tiene muchos lugares)
City.hasMany(TouristPlace, {
  foreignKey: 'cityId',
  as: 'places'
});

TouristPlace.belongsTo(City, {
  foreignKey: 'cityId',
  as: 'city'
});

// ============ EXPORTS ============
export {
  sequelize,
  User,
  City,
  TouristPlace,
  Favorite
};

// ============ SYNC ============
export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    await sequelize.sync();
    console.log('✅ Modelos sincronizados');
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    throw error;
  }
};