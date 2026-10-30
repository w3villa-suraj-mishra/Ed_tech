require('dotenv').config();

// New Relic APM agent must load before instrumented modules (express, pg/sequelize, socket.io, axios).
// It initializes only when NEW_RELIC_LICENSE_KEY is provided.
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

const express = require('express');
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/database');
const routes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const logger = require('./utils/logger');
const { configurePassport, passport } = require('./config/passport');
const startSilverExpirationCron = require('./utils/cron');

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { socketService } = require('./services/notificationService');
const { initLiveClassSocket } = require('./services/liveClassSocketService');
const { startLiveClassScheduler } = require('./services/liveClassSchedulerService');
const {
  Assignment,
  AssignmentQuestion,
  AssignmentResource,
  AssignmentSubmission,
  AssignmentSubmissionFile,
  LiveClass,
  LiveClassAttendance,
  ReferralCode,
  ReferralRelationship,
  ReferralTree,
  ReferralAttribution,
  ReferralRewardRule,
  ReferralRewardLedger,
  Wallet,
  WalletTransaction
} = require('./models');

const ensureRequiredTables = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const existingTables = new Set(
    (await queryInterface.showAllTables()).map((tableName) => String(tableName).toLowerCase())
  );

  const requiredModels = [
    Assignment,
    AssignmentQuestion,
    AssignmentResource,
    AssignmentSubmission,
    AssignmentSubmissionFile,
    LiveClass,
    LiveClassAttendance,
    ReferralCode,
    ReferralRelationship,
    ReferralTree,
    ReferralAttribution,
    ReferralRewardRule,
    ReferralRewardLedger,
    Wallet,
    WalletTransaction
  ];

  for (const model of requiredModels) {
    const tableName = model?.getTableName?.() || model?.tableName || model?.name || '';
    const normalized = String(tableName).toLowerCase();
    if (!normalized || existingTables.has(normalized)) continue;

    await model.sync();
    existingTables.add(normalized);
  }

  // Seed default referral rules if none exist
  try {
    const ruleCount = await ReferralRewardRule.count();
    if (ruleCount === 0) {
      const now = new Date();
      await ReferralRewardRule.bulkCreate([
        { rewardType: 'REGISTRATION', level: 0, rewardPercentage: 0.00, fixedAmountPaise: 2000, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 1, rewardPercentage: 10.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 2, rewardPercentage: 5.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 3, rewardPercentage: 2.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 4, rewardPercentage: 1.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now }
      ]);
    }
  } catch (ruleSeedErr) {
    logger.warn(`Default reward rule seed check warning: ${ruleSeedErr.message}`);
  }
};

const app = express();
const server = http.createServer(app);

app.use(async (req, res, next) => {
  const criticalPath = req.path.includes('/assignments') || req.path.includes('/live-classes') || req.path.includes('/live-class');
  if (!criticalPath) return next();

  try {
    await ensureRequiredTables();
    return next();
  } catch (error) {
    logger.error('CRITICAL TABLE CHECK FAILED:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database schema is not ready yet. Please retry in a moment.'
    });
  }
});

if (!process.env.VERCEL) {
  // Initialize Socket.IO with CORS (Only on full Node.js servers like Render/local)
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3001',
        'http://localhost:3001',
        'http://localhost:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallbackSecretKeyForJWT12345');
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socketService.init(io);
  initLiveClassSocket(io);
  startSilverExpirationCron();
  startLiveClassScheduler();
}

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  'http://localhost:3001',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// DB connection safety check middleware for Vercel Serverless
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/') {
    return next();
  }
  if (!process.env.DATABASE_URL && (process.env.DB_HOST === 'localhost' || !process.env.DB_HOST) && process.env.VERCEL) {
    return res.status(500).json({
      success: false,
      message: "Database Error: Vercel serverless function cannot connect to localhost PostgreSQL. Please configure DATABASE_URL in Vercel Environment Variables pointing to a remote PostgreSQL database (Supabase, Neon, Render, etc.)."
    });
  }
  next();
});

// Body parsing middleware
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Passport OAuth
configurePassport();
app.use(passport.initialize());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check & root route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'EdTech API Backend is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Public DB migration trigger endpoint for Vercel production
app.get('/run-migrations', async (req, res) => {
  try {
    await sequelize.authenticate();
    const {
      Announcement,
      AnnouncementDismissal,
      Offer,
      OfferCourse,
      Assignment,
      AssignmentQuestion,
      AssignmentResource,
      AssignmentSubmission,
      AssignmentSubmissionFile
    } = require('./models');
    await Announcement.sync();
    await AnnouncementDismissal.sync();
    await Offer.sync();
    await OfferCourse.sync();
    await ensureRequiredTables();
    await sequelize.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_practice_questions_testCategory') THEN 
          CREATE TYPE "public"."enum_practice_questions_testCategory" AS ENUM('MCQ', 'Coding', 'Topic Practice', 'Mock Test', 'Interview Test', 'Daily Quiz'); 
        END IF; 
      END $$;
    `);
    await sequelize.query(`ALTER TABLE "practice_questions" ADD COLUMN IF NOT EXISTS "testCategory" "public"."enum_practice_questions_testCategory" NOT NULL DEFAULT 'MCQ';`);
    await sequelize.query(`ALTER TABLE "practice_questions" ADD COLUMN IF NOT EXISTS "answerDetails" JSON;`);
    await sequelize.query(`
      ALTER TYPE "public"."enum_practice_questions_type" ADD VALUE IF NOT EXISTS 'Multiple Select';
      ALTER TYPE "public"."enum_practice_questions_type" ADD VALUE IF NOT EXISTS 'True/False';
      ALTER TYPE "public"."enum_practice_questions_type" ADD VALUE IF NOT EXISTS 'Short Answer';
      ALTER TYPE "public"."enum_practice_questions_type" ADD VALUE IF NOT EXISTS 'Fill in the Blank';
    `).catch(() => {});
    return res.status(200).json({ success: true, message: 'Database migration and sync executed successfully!' });
  } catch (err) {
    console.error('Migration endpoint error:', err);
    return res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

// ==========================================
// ROUTES
// ==========================================
app.use('/', routes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  console.error('[UNHANDLED SERVER ERROR STACK]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.message,
    stack: err.stack
  });
});

// ==========================================
// DATABASE & SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await sequelize.sync({ alter: true });
      await ensureRequiredTables();
      logger.info('Database synchronized successfully');
      try {
        const fixTestCaseInputs = require('./scripts/fixTestCaseInputs');
        await fixTestCaseInputs();
      } catch (fixErr) {
        logger.error('Fix test case inputs script error:', fixErr.message);
      }
    } catch (error) {
      logger.error('Database connection warning (server started without DB):', error.message);
    }

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use by another process.`);
        console.error(`\n❌ Error: Port ${PORT} is already in use.`);
        console.error(`👉 Run 'npx kill-port ${PORT}' or 'fuser -k ${PORT}/tcp' to kill the existing process, then restart.\n`);
        process.exit(1);
      } else {
        logger.error('Server error:', err.message);
        process.exit(1);
      }
    });

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`\n✓ EdTech Backend Server with Socket.IO`);
      console.log(`✓ Running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}\n`);
    });
  };
  startServer();
}

module.exports = app;
