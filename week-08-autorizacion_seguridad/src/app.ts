import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import childRoutes from './routes/child.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { sanitizeInputs } from './middlewares/sanitize.js';
import { globalLimiter, corsOptions } from './config/security.js';

const app = express();

// Security layers — order matters
app.use(helmet());
app.use(globalLimiter);
// cors() como middleware global ya responde los preflight (OPTIONS).
// (app.options('*') no es válido en Express 5)
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize inputs AFTER parsing, BEFORE routes
app.use(sanitizeInputs);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/children', childRoutes);

// Error handling (always last)
app.use(notFound);
app.use(errorHandler);

export { app };
