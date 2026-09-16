import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#3b82f6'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default Tag;