import sequelize from '../config/database.js';
import User from './User.js';
import City from './City.js';
import TouristPlace from './TouristPlace.js';
import Favorite from './Favorite.js';
import Tag from './Tag.js';
import PlaceTag from './PlaceTag.js';

// ============ ASOCIACIONES ============

// User ↔ City (favoritos)
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

Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

// City ↔ TouristPlace
City.hasMany(TouristPlace, {
  foreignKey: 'cityId',
  as: 'places'
});

TouristPlace.belongsTo(City, {
  foreignKey: 'cityId',
  as: 'city'
});

// TouristPlace ↔ Tag (muchos-a-muchos)
TouristPlace.belongsToMany(Tag, {
  through: PlaceTag,
  foreignKey: 'placeId',
  otherKey: 'tagId',
  as: 'tags'
});

Tag.belongsToMany(TouristPlace, {
  through: PlaceTag,
  foreignKey: 'tagId',
  otherKey: 'placeId',
  as: 'places'
});

PlaceTag.belongsTo(TouristPlace, { foreignKey: 'placeId', as: 'place' });
PlaceTag.belongsTo(Tag, { foreignKey: 'tagId', as: 'tag' });

// ============ EXPORTS ============
export {
  sequelize,
  User,
  City,
  TouristPlace,
  Favorite,
  Tag,
  PlaceTag
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