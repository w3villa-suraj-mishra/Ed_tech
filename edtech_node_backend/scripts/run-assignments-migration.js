require('dotenv').config();

const sequelizeLib = require('sequelize');
const Sequelize = sequelizeLib.Sequelize || sequelizeLib;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    const qi = sequelize.getQueryInterface();

    const tables = [
      'assignments',
      'assignment_questions',
      'assignment_resources',
      'assignment_submissions',
      'assignment_submission_files'
    ];

    for (const table of tables) {
      if (await qi.tableExists(table)) {
        throw new Error(
          `Table "${table}" already exists. Stop and inspect the schema.`
        );
      }
    }

    const migration = require('../migrations/20261026000000-create-assignments.js');

    // Wrap the real QueryInterface methods so every schema operation
    // receives the same transaction.
    await sequelize.transaction(async (transaction) => {
      const originalCreateTable = qi.createTable.bind(qi);
      const originalAddIndex = qi.addIndex.bind(qi);
      const originalQuery = sequelize.query.bind(sequelize);

      qi.createTable = (table, attributes, options = {}) =>
        originalCreateTable(table, attributes, {
          ...options,
          transaction
        });

      qi.addIndex = (table, fields, options = {}) =>
        originalAddIndex(table, fields, {
          ...options,
          transaction
        });

      sequelize.query = (sql, options = {}) =>
        originalQuery(sql, {
          ...options,
          transaction
        });

      try {
        await migration.up(qi, Sequelize);
      } finally {
        qi.createTable = originalCreateTable;
        qi.addIndex = originalAddIndex;
        sequelize.query = originalQuery;
      }
    });

    console.log('Assignments migration completed successfully.');
  } finally {
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error('Assignments migration failed:', error.message);
  process.exitCode = 1;
});
