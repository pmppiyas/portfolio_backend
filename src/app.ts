import compression from 'compression';
import cors from 'cors';
import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import router from './routes/index.js';
import config from './config/index.js';

const app: Application = express();

const allowedOrigins = (config.frontend_url || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'Accept',
    'X-Requested-With',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);

app.get('/', (_req, res) => {
  res.send('Portfolio API is running...');
});

app.use('/api/v1', router);

// 404 Handler
app.use((_req, res, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'API Route not found',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('>>> Global Error Handler Caught:', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

export default app;
