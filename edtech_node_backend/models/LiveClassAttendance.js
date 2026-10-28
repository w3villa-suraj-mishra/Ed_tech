const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveClassAttendance = sequelize.define('LiveClassAttendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  liveClassId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'live_class_id',
    references: {
      model: 'live_classes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  firstJoinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'first_joined_at'
  },
  lastLeftAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_left_at'
  },
  totalAttendedSeconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_attended_seconds'
  },
  attendanceStatus: {
    type: DataTypes.ENUM('present', 'partially_attended', 'absent'),
    allowNull: false,
    defaultValue: 'partially_attended',
    field: 'attendance_status'
  },
  joinHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'join_history'
  }
}, {
  tableName: 'live_class_attendances',
  underscored: true,
  timestamps: true
});

module.exports = LiveClassAttendance;
