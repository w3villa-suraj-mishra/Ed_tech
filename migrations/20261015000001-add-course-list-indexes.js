'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS courses_status_created_at_idx
      ON courses (status, created_at DESC);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS courses_status_category_created_at_idx
      ON courses (status, category_id, created_at DESC);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS courses_status_price_idx
      ON courses (status, price);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS courses_description_trgm_idx
      ON courses USING GIN (course_description gin_trgm_ops);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS rating_and_reviews_course_id_idx
      ON rating_and_reviews (course_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS courses_status_created_at_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS courses_status_category_created_at_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS courses_status_price_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS courses_description_trgm_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS rating_and_reviews_course_id_idx;');
  }
};
