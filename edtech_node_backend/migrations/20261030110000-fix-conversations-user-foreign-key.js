'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if conversations table exists before altering constraints
    const tables = await queryInterface.showAllTables();
    const hasConversations = tables.map(t => String(t).toLowerCase()).includes('conversations');

    if (hasConversations) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_user_id_fkey";
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_assigned_to_fkey";
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_fkey" 
          FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasConversations = tables.map(t => String(t).toLowerCase()).includes('conversations');

    if (hasConversations) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_user_id_fkey";
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id");

        ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_assigned_to_fkey";
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_fkey" 
          FOREIGN KEY ("assigned_to") REFERENCES "users"("id");
      `);
    }
  }
};

