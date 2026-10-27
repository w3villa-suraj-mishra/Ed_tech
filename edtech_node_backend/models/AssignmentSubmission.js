const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'verified', 'resubmission_requested', 'rejected'),
    allowNull: false,
    defaultValue: 'submitted'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  marksAwarded: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'marks_awarded'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_late'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'submitted_at'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  },
  verifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'verified_by',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'assignment_submissions',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['assignment_id', 'user_id']
    },
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = AssignmentSubmission;
