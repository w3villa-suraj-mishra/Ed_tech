'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const addIndexSafely = async (table, fields, options) => {
      try {
        await queryInterface.addIndex(table, fields, options);
      } catch (error) {
        if (error.message && (error.message.includes('already exists') || error.parent?.code === '42P07')) {
          return;
        }
        throw error;
      }
    };

    // 1. Create live_classes table
    await queryInterface.createTable('live_classes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      agenda: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scheduled_start_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      scheduled_end_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Asia/Kolkata'
      },
      meeting_banner: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      materials_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'live', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'webrtc'
      },
      provider_room_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ended_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reminders_sent: {
        type: Sequelize.JSONB || Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await addIndexSafely('live_classes', ['course_id'], { name: 'live_classes_course_id_idx' });
    await addIndexSafely('live_classes', ['instructor_id'], { name: 'live_classes_instructor_id_idx' });
    await addIndexSafely('live_classes', ['status'], { name: 'live_classes_status_idx' });
    await addIndexSafely('live_classes', ['scheduled_start_at'], { name: 'live_classes_scheduled_start_at_idx' });

    // 2. Create live_class_attendances table
    await queryInterface.createTable('live_class_attendances', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      live_class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'live_classes', key: 'id' },
        onDelete: 'CASCADE'
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      first_joined_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      last_left_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      total_attended_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      attendance_status: {
        type: Sequelize.ENUM('present', 'partially_attended', 'absent'),
        allowNull: false,
        defaultValue: 'partially_attended'
      },
      join_history: {
        type: Sequelize.JSONB || Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await addIndexSafely('live_class_attendances', ['live_class_id', 'student_id'], {
      unique: true,
      name: 'live_class_attendances_class_student_unique'
    });
    await addIndexSafely('live_class_attendances', ['live_class_id'], { name: 'live_class_attendances_class_id_idx' });
    await addIndexSafely('live_class_attendances', ['student_id'], { name: 'live_class_attendances_student_id_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('live_class_attendances');
    await queryInterface.dropTable('live_classes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_live_classes_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_live_class_attendances_attendance_status"');
  }
};
