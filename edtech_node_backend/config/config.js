require('dotenv').config();

const shouldUseSupabaseUrl = () => {
  if (process.env.USE_SUPABASE_DB === 'true') return true;
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') return Boolean(process.env.DATABASE_URL);
  return false;
};

const buildDialectOptions = (useDatabaseUrl) => (
  useDatabaseUrl ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
);

const poolOptions = {
  max: Math.max(1, Number.parseInt(process.env.DB_POOL_MAX, 10) || 5),
  min: 0,
  acquire: Math.max(1000, Number.parseInt(process.env.DB_POOL_ACQUIRE_MS, 10) || 30000),
  idle: Math.max(1000, Number.parseInt(process.env.DB_POOL_IDLE_MS, 10) || 10000),
  evict: Math.max(1000, Number.parseInt(process.env.DB_POOL_EVICT_MS, 10) || 1000)
};

const getEffectiveDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) return null;
  if (/pooler\.supabase\.com:5432/.test(url)) {
    url = url.replace(/pooler\.supabase\.com:5432/g, 'pooler.supabase.com:6543');
  }
  return url;
};

const buildConnectionConfig = (overrides = {}) => {
  const effectiveUrl = getEffectiveDatabaseUrl();
  const useDatabaseUrl = shouldUseSupabaseUrl() && Boolean(effectiveUrl);

  if (useDatabaseUrl) {
    return {
      url: effectiveUrl,
      dialect: 'postgres',
      dialectOptions: buildDialectOptions(true),
      logging: false,
      pool: poolOptions,
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
    pool: poolOptions,
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
