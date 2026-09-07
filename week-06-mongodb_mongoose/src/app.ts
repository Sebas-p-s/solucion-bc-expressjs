// ============================================
// app.ts — Configuración de Express
// Dominio: Jardín infantil privado
// ============================================

import express from 'express';
import staffRouter from './routes/staff.routes';
import childRouter from './routes/child.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/children', childRouter);

app.use(notFound);
app.use(errorHandler);
