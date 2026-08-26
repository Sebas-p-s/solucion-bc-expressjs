// ============================================
// MIDDLEWARES — notFound
// ============================================
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

// TODO: Implementar el middleware notFound que:
// 1. Reciba (req, _res, next) — 3 parámetros (middleware normal, no error handler)
// 2. Construya un AppError con statusCode 404 y mensaje descriptivo
//    usando req.method y req.path para identificar la ruta solicitada
// 3. Pase el error a next()

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  // TODO: reemplaza este comentario con la implementación
  // Pista: next(new AppError(404, `Ruta ${req.method} ${req.path} no encontrada`));
  next(new AppError(404, `Ruta ${req.method} ${req.path} no encontrada`));
}
