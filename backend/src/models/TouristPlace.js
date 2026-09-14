import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TouristPlace = sequelize.define('TouristPlace', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'Monumento',
      'Museo',
      'Parque',
      'Playa',
      'Restaurante',
      'Centro Comercial',
      'Histórico',
      'Naturaleza'
    ),
    defaultValue: 'Monumento'
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default TouristPlace;