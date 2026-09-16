import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PlaceTag = sequelize.define('PlaceTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  placeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'place_tags'
});

export default PlaceTag;