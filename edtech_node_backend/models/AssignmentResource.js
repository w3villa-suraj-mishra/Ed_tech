const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentResource = sequelize.define('AssignmentResource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assignment_id',
    references: {
      model: 'assignments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name'
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_url'
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_type'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mime_type'
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'assignment_resources',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['assignment_id'] }
  ]
});

module.exports = AssignmentResource;
