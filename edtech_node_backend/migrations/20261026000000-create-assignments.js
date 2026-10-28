'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assignments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
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
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      instructions: { type: Sequelize.TEXT },
      due_at: { type: Sequelize.DATE },
      max_marks: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
      allow_resubmission: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'closed'),
        allowNull: false,
        defaultValue: 'published'
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('assignments', ['course_id'], { name: 'assignments_course_id_idx' });
    await queryInterface.addIndex('assignments', ['instructor_id'], { name: 'assignments_instructor_id_idx' });
    await queryInterface.addIndex('assignments', ['status'], { name: 'assignments_status_idx' });

    await queryInterface.createTable('assignment_questions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'assignments', key: 'id' },
        onDelete: 'CASCADE'
      },
      question_text: { type: Sequelize.TEXT, allowNull: false },
      marks: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('assignment_questions', ['assignment_id'], { name: 'assignment_questions_assignment_id_idx' });

    await queryInterface.createTable('assignment_resources', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'assignments', key: 'id' },
        onDelete: 'CASCADE'
      },
      file_name: { type: Sequelize.STRING, allowNull: false },
      file_url: { type: Sequelize.TEXT, allowNull: false },
      file_type: { type: Sequelize.STRING, allowNull: false },
      mime_type: { type: Sequelize.STRING },
      size: { type: Sequelize.INTEGER },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('assignment_resources', ['assignment_id'], { name: 'assignment_resources_assignment_id_idx' });

    await queryInterface.createTable('assignment_submissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'assignments', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('submitted', 'under_review', 'verified', 'resubmission_requested', 'rejected'),
        allowNull: false,
        defaultValue: 'submitted'
      },
      note: { type: Sequelize.TEXT },
      marks_awarded: { type: Sequelize.INTEGER },
      feedback: { type: Sequelize.TEXT },
      is_late: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      submitted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      verified_at: { type: Sequelize.DATE },
      verified_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('assignment_submissions', ['assignment_id', 'user_id'], {
      unique: true,
      name: 'assignment_submissions_assignment_user_unique'
    });
    await queryInterface.addIndex('assignment_submissions', ['user_id'], { name: 'assignment_submissions_user_id_idx' });
    await queryInterface.addIndex('assignment_submissions', ['status'], { name: 'assignment_submissions_status_idx' });

    await queryInterface.createTable('assignment_submission_files', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      submission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'assignment_submissions', key: 'id' },
        onDelete: 'CASCADE'
      },
      file_name: { type: Sequelize.STRING, allowNull: false },
      file_url: { type: Sequelize.TEXT, allowNull: false },
      file_type: { type: Sequelize.STRING, allowNull: false },
      mime_type: { type: Sequelize.STRING },
      size: { type: Sequelize.INTEGER },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('assignment_submission_files', ['submission_id'], { name: 'assignment_submission_files_submission_id_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assignment_submission_files');
    await queryInterface.dropTable('assignment_submissions');
    await queryInterface.dropTable('assignment_resources');
    await queryInterface.dropTable('assignment_questions');
    await queryInterface.dropTable('assignments');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assignments_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assignment_submissions_status"');
  }
};
