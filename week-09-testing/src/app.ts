import express from 'express';
import helmet from 'helmet';
import { authRouter } from './routes/auth.routes.js';
import { childrenRouter } from './routes/children.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

// ============================================================
// app.ts — configuración de Express SIN app.listen()
// ============================================================
// Importar { app } en los tests — NUNCA server.ts
// ============================================================

export const app = express();

app.use(helmet());
app.use(express.json());

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/children', childrenRouter);

app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);
