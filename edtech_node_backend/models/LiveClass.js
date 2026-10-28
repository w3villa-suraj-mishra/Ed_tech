const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveClass = sequelize.define('LiveClass', {
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
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduledStartAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'scheduled_start_at'
  },
  scheduledEndAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'scheduled_end_at'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    field: 'duration_minutes'
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Asia/Kolkata'
  },
  meetingBanner: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meeting_banner'
  },
  materialsUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'materials_url'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'webrtc'
  },
  providerRoomId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'provider_room_id'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ended_at'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  },
  remindersSent: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'reminders_sent'
  }
}, {
  tableName: 'live_classes',
  underscored: true,
  timestamps: true
});

module.exports = LiveClass;
