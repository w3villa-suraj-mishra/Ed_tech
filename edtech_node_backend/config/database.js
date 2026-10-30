const { Sequelize } = require('sequelize');
require('dotenv').config();

const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const poolOptions = {
  max: isServerless ? 1 : Math.max(1, Number.parseInt(process.env.DB_POOL_MAX, 10) || 4),
  min: 0,
  acquire: Math.max(1000, Number.parseInt(process.env.DB_POOL_ACQUIRE_MS, 10) || 30000),
  idle: Math.max(1000, Number.parseInt(process.env.DB_POOL_IDLE_MS, 10) || 5000),
  evict: Math.max(1000, Number.parseInt(process.env.DB_POOL_EVICT_MS, 10) || 1000)
};

const getEffectiveDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) return null;
  // If Supabase pooler is set to port 5432 (Session mode limit: 15), automatically use port 6543 (Transaction mode)
  if (url.includes('.pooler.supabase.com:5432')) {
    url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
  }
  return url;
};

const shouldUseSupabaseUrl = () => {
  if (process.env.USE_SUPABASE_DB === 'true') return true;
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') return Boolean(process.env.DATABASE_URL);
  return false;
};

let sequelize;
const effectiveDbUrl = getEffectiveDatabaseUrl();

if (shouldUseSupabaseUrl() && effectiveDbUrl) {
  sequelize = new Sequelize(effectiveDbUrl, {
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
