const { Sequelize } = require('sequelize');
require('dotenv').config();

const poolOptions = {
  max: Math.max(1, Number.parseInt(process.env.DB_POOL_MAX, 10) || 5),
  min: Math.max(0, Number.parseInt(process.env.DB_POOL_MIN, 10) || 0),
  acquire: Math.max(1000, Number.parseInt(process.env.DB_POOL_ACQUIRE_MS, 10) || 30000),
  idle: Math.max(1000, Number.parseInt(process.env.DB_POOL_IDLE_MS, 10) || 10000)
};

const shouldUseSupabaseUrl = () => {
  if (process.env.USE_SUPABASE_DB === 'true') return true;
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') return Boolean(process.env.DATABASE_URL);
  return false;
};

let sequelize;

if (shouldUseSupabaseUrl() && process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: poolOptions
  });
} else {
  sequelize = new Sequelize({
    dialect: 'postgres',
    dialectModule: require('pg'),
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'edtech',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    timezone: '+00:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: poolOptions
  });
}

if (!process.env.VERCEL) {
  sequelize.authenticate()
    .then(() => console.log('Database connection established successfully'))
    .catch(err => console.error('Unable to connect to the database:', err));
}

module.exports = sequelize;
