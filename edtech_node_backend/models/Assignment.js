const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'instructor_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_at'
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    field: 'max_marks'
  },
  allowResubmission: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'allow_resubmission'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed'),
    allowNull: false,
    defaultValue: 'published'
  }
}, {
  tableName: 'assignments',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['instructor_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Assignment;
