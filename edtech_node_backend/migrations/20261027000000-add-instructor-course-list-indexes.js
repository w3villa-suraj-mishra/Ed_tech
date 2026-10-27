'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS courses_instructor_created_at_idx
      ON courses (instructor_id, created_at DESC);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS sections_course_id_idx
      ON sections (course_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX CONCURRENTLY IF EXISTS courses_instructor_created_at_idx;');
    await queryInterface.sequelize.query('DROP INDEX CONCURRENTLY IF EXISTS sections_course_id_idx;');
  }
};
