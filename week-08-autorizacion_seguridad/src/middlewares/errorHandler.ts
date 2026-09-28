import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

// Nunca se expone stack trace ni información interna al cliente.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Errores de validación (Zod) → 400 en vez de 500
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues.map((i) => i.message).join(', ') });
    return;
  }

  // Origen bloqueado por la whitelist de CORS → 403
  if (err.message.startsWith('CORS blocked')) {
    res.status(403).json({ error: 'Origin not allowed by CORS policy' });
    return;
  }

  // El detalle solo va al log del servidor, nunca a la respuesta
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
