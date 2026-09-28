import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

// express-mongo-sanitize v2 intenta REASIGNAR req.query, pero en Express 5
// esa propiedad es de solo lectura y lanza un error en cada petición.
// Solución: usar su función sanitize() que limpia los objetos IN PLACE
// (elimina claves que empiezan con "$" o contienen ".") sin reasignarlos.
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
}
