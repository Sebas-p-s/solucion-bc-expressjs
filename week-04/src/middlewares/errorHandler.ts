// ============================================
// MIDDLEWARES — errorHandler (4 parámetros)
// ============================================
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';

// ⚠️ Express detecta los error handlers por la cantidad de parámetros.
//    Con 3 parámetros lo trataría como middleware normal.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Error de validación de Zod → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Datos de entrada inválidos',
      issues: err.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      })),
    });
    return;
  }

  // 2. Error operacional conocido (AppError) → statusCode propio
  if (err instanceof AppError) {
    logger.warn(`AppError ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      error: 'Application Error',
      message: err.message,
    });
    return;
  }

  // 3. Error genérico / no controlado → 500
  const isProduction = process.env['NODE_ENV'] === 'production';
  const error = err instanceof Error ? err : new Error('Error desconocido');

  logger.error(`Unhandled error: ${error.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Ha ocurrido un error inesperado' : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  });
}
