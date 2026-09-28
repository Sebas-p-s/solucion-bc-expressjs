import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import childRouter from './routes/child.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const app = express();

app.use(express.json());
app.use(cookieParser());

// Rutas de autenticación
app.use('/api/v1/auth', authRouter);

// Recurso principal del dominio: niños del jardín infantil
app.use('/api/v1/children', childRouter);

// Middlewares de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);
