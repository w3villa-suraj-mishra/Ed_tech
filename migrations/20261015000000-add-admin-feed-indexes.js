'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS contact_us_status_created_at_idx
      ON "ContactUs" (status, "createdAt" DESC);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS rating_and_reviews_created_at_idx
      ON rating_and_reviews (created_at DESC);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS enrollments_created_at_idx
      ON enrollments (created_at DESC);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS contact_us_status_created_at_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS rating_and_reviews_created_at_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS enrollments_created_at_idx;');
  }
};
