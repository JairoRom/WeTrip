import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'favorites'
  // Sin indexes aquí: la unicidad se controla en el controlador
});

export default Favorite;