import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Errores de validación de Zod → 400 (antes caían en el 500)
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues.map((i) => i.message).join(', ') });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
