const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentQuestion = sequelize.define('AssignmentQuestion', {
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
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text'
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'assignment_questions',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['assignment_id'] }
  ]
});

module.exports = AssignmentQuestion;
