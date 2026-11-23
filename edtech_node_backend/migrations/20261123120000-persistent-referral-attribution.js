'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update referral_attributions table
    const tableAttributions = await queryInterface.describeTable('referral_attributions');

    if (!tableAttributions.referred_identity_hash) {
      await queryInterface.addColumn('referral_attributions', 'referred_identity_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await queryInterface.addIndex('referral_attributions', ['referred_identity_hash']);
    }

    if (!tableAttributions.referrer_user_id) {
      await queryInterface.addColumn('referral_attributions', 'referrer_user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      });
      await queryInterface.addIndex('referral_attributions', ['referrer_user_id']);
    }

    if (!tableAttributions.original_attributed_at) {
      await queryInterface.addColumn('referral_attributions', 'original_attributed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('NOW')
      });
    }

    if (!tableAttributions.current_user_id) {
      await queryInterface.addColumn('referral_attributions', 'current_user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      });
      await queryInterface.addIndex('referral_attributions', ['current_user_id']);

      // Backfill current_user_id from user_id if present
      await queryInterface.sequelize.query(`
        UPDATE referral_attributions 
        SET current_user_id = user_id, original_attributed_at = created_at
        WHERE current_user_id IS NULL AND user_id IS NOT NULL;
      `);
    }

    // 2. Update referral_relationships table
    const tableRelationships = await queryInterface.describeTable('referral_relationships');

    if (!tableRelationships.referred_identity_hash) {
      await queryInterface.addColumn('referral_relationships', 'referred_identity_hash', {
        type: Sequelize.STRING(64),
        allowNull: true
      });
      await queryInterface.addIndex('referral_relationships', ['referred_identity_hash']);
    }

    if (!tableRelationships.deleted_user_id) {
      await queryInterface.addColumn('referral_relationships', 'deleted_user_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    // Change referred_user_id to allow NULL so deletion doesn't break relationships
    try {
      await queryInterface.changeColumn('referral_relationships', 'referred_user_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    } catch (e) {
      // ignore if already nullable
    }

    // Update foreign key constraint on referred_user_id to SET NULL
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE referral_relationships 
        DROP CONSTRAINT IF EXISTS referral_relationships_referred_user_id_fkey;
        ALTER TABLE referral_relationships 
        ADD CONSTRAINT referral_relationships_referred_user_id_fkey 
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    } catch (e) {
      // ignore
    }

    // Drop unique constraint on referred_user_id if exists so NULLs or history don't conflict
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE referral_relationships 
        DROP CONSTRAINT IF EXISTS referral_relationships_referred_user_id_key;
      `);
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('referral_relationships', 'deleted_user_id');
      await queryInterface.removeColumn('referral_relationships', 'referred_identity_hash');
      await queryInterface.removeColumn('referral_attributions', 'current_user_id');
      await queryInterface.removeColumn('referral_attributions', 'original_attributed_at');
      await queryInterface.removeColumn('referral_attributions', 'referrer_user_id');
      await queryInterface.removeColumn('referral_attributions', 'referred_identity_hash');
    } catch (e) {}
  }
};
