const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentSubmissionFile = sequelize.define('AssignmentSubmissionFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'submission_id',
    references: {
      model: 'assignment_submissions',
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
  tableName: 'assignment_submission_files',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['submission_id'] }
  ]
});

module.exports = AssignmentSubmissionFile;
