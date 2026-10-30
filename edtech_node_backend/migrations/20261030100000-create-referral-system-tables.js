'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. referral_codes
    await queryInterface.createTable('referral_codes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('referral_codes', ['referral_code'], { unique: true });

    // 2. referral_relationships
    await queryInterface.createTable('referral_relationships', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      referrer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT'
      },
      referred_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT'
      },
      referral_code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      attribution_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'active'
      },
      registered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('referral_relationships', ['referrer_id']);
    await queryInterface.addIndex('referral_relationships', ['referral_code']);

    // 3. referral_tree (Closure Table)
    await queryInterface.createTable('referral_tree', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ancestor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      descendant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      depth: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('referral_tree', ['ancestor_id', 'descendant_id'], { unique: true });
    await queryInterface.addIndex('referral_tree', ['descendant_id']);
    await queryInterface.addIndex('referral_tree', ['depth']);

    // 4. referral_attributions (Custom attribution tracking)
    await queryInterface.createTable('referral_attributions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      anonymous_id: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      referral_code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      channel: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'web'
      },
      landing_page: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: '/register'
      },
      campaign: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'referral'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('referral_attributions', ['anonymous_id']);
    await queryInterface.addIndex('referral_attributions', ['referral_code']);

    // 6. referral_reward_rules
    await queryInterface.createTable('referral_reward_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reward_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reward_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      fixed_amount_paise: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      maximum_reward_paise: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      effective_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('referral_reward_rules', ['reward_type', 'level', 'is_active']);

    // Seed default reward rules
    const now = new Date();
    await queryInterface.bulkInsert('referral_reward_rules', [
      {
        reward_type: 'REGISTRATION',
        level: 0,
        reward_percentage: 0.00,
        fixed_amount_paise: 2000, // ₹20 in paise
        is_active: true,
        effective_from: now,
        created_at: now,
        updated_at: now
      },
      {
        reward_type: 'COURSE_PURCHASE',
        level: 1,
        reward_percentage: 10.00, // 10%
        fixed_amount_paise: 0,
        is_active: true,
        effective_from: now,
        created_at: now,
        updated_at: now
      },
      {
        reward_type: 'COURSE_PURCHASE',
        level: 2,
        reward_percentage: 5.00, // 5%
        fixed_amount_paise: 0,
        is_active: true,
        effective_from: now,
        created_at: now,
        updated_at: now
      },
      {
        reward_type: 'COURSE_PURCHASE',
        level: 3,
        reward_percentage: 2.00, // 2%
        fixed_amount_paise: 0,
        is_active: true,
        effective_from: now,
        created_at: now,
        updated_at: now
      },
      {
        reward_type: 'COURSE_PURCHASE',
        level: 4,
        reward_percentage: 1.00, // 1%
        fixed_amount_paise: 0,
        is_active: true,
        effective_from: now,
        created_at: now,
        updated_at: now
      }
    ]);

    // 7. referral_reward_ledger
    await queryInterface.createTable('referral_reward_ledger', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      referral_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'referral_relationships', key: 'id' },
        onDelete: 'SET NULL'
      },
      order_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      reward_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      referral_level: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      amount_paise: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'INR'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'AVAILABLE'
      },
      idempotency_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('referral_reward_ledger', ['idempotency_key'], { unique: true });
    await queryInterface.addIndex('referral_reward_ledger', ['user_id']);
    await queryInterface.addIndex('referral_reward_ledger', ['order_id']);

    // 8. wallets
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      available_balance_paise: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      pending_balance_paise: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      lifetime_earned_paise: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      lifetime_spent_paise: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('wallets', ['user_id'], { unique: true });

    // 9. wallet_transactions
    await queryInterface.createTable('wallet_transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'wallets', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount_paise: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'SUCCESS'
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      reference_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      balance_after_paise: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('wallet_transactions', ['wallet_id']);
    await queryInterface.addIndex('wallet_transactions', ['user_id']);
    await queryInterface.addIndex('wallet_transactions', ['transaction_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wallet_transactions');
    await queryInterface.dropTable('wallets');
    await queryInterface.dropTable('referral_reward_ledger');
    await queryInterface.dropTable('referral_reward_rules');
    await queryInterface.dropTable('referral_attributions');
    await queryInterface.dropTable('referral_tree');
    await queryInterface.dropTable('referral_relationships');
    await queryInterface.dropTable('referral_codes');
  }
};

