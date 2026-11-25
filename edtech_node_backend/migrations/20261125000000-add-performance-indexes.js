'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS course_progress_videos_course_progress_id_idx
      ON course_progress_videos (course_progress_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS enrollments_course_id_idx
      ON enrollments (course_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS categories_name_idx
      ON categories (name);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS sub_sections_section_id_idx
      ON sub_sections (section_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS live_sessions_course_id_idx
      ON live_sessions (course_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS live_chat_messages_live_session_id_idx
      ON live_chat_messages (live_session_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS course_price_status_idx
      ON courses (price, status);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS course_discount_status_idx
      ON courses (discount_type, discount_value, status);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS assignment_course_id_status_idx
      ON assignments (course_id, status);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS assignment_submission_assignment_id_idx
      ON assignment_submissions (assignment_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS course_progress_user_id_idx
      ON course_progresses (user_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_progress_videos_course_progress_id_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS enrollments_course_id_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS categories_name_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS sub_sections_section_id_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS live_sessions_course_id_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS live_chat_messages_live_session_id_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_price_status_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_discount_status_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS assignment_course_id_status_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS assignment_submission_assignment_id_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_progress_user_id_idx;');
  }
};