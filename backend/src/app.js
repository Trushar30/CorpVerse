const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const createApp = () => {
  const app = express();

  // ─── Reverse Proxy & Security ───────────────────
  app.set('trust proxy', 1);
  app.use(helmet());

  const allowedOrigins = config.clientUrl
    ? config.clientUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : ['http://localhost:5173'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        if (/\.vercel\.app$/.test(cleanOrigin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ─── Rate Limiting ─────────────────────────────
  if (config.isProd) {
    app.use(generalLimiter);
  }

  // ─── Logging ───────────────────────────────────
  app.use(morgan(config.isDev ? 'dev' : 'combined'));

  // ─── Body Parsing ──────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Static Files (Resume uploads) ─────────────
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // ─── API Routes ────────────────────────────────
  app.use('/api', routes);

  // ─── 404 Handler ───────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // ─── Global Error Handler ─────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
