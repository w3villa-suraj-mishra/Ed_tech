require('dotenv').config();

const buildDialectOptions = (useDatabaseUrl) => (
  useDatabaseUrl ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
);

const buildConnectionConfig = (overrides = {}) => {
  const useDatabaseUrl = Boolean(process.env.DATABASE_URL);

  if (useDatabaseUrl) {
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: buildDialectOptions(true),
      logging: false,
      ...overrides
    };
  }

  return {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'edtech',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    dialectOptions: buildDialectOptions(false),
    logging: false,
    ...overrides
  };
};

module.exports = {
  development: buildConnectionConfig(),
  test: buildConnectionConfig({
    database: process.env.DB_NAME_TEST || 'edtech_test'
  }),
  production: buildConnectionConfig({
    database: process.env.DB_NAME || 'edtech'
  })
};
