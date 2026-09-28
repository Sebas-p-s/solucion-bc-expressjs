// ============================================================
// UNIT TESTS — auth.middleware.ts (authenticate / authorize)
// ============================================================
import type { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { signAccessToken } from '../utils/jwt';

function buildRes(): Response {
  return { locals: {} } as unknown as Response;
}

describe('Auth Middleware — Unit Tests', () => {
  describe('authenticate()', () => {
    it('should call next with AppError 401 when there is no Authorization header', () => {
      const next = jest.fn() as unknown as NextFunction;

      authenticate({ headers: {} } as Request, buildRes(), next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should call next with AppError 401 when the token is invalid', () => {
      const next = jest.fn() as unknown as NextFunction;

      authenticate({ headers: { authorization: 'Bearer not-a-real-token' } } as Request, buildRes(), next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should store the payload in res.locals and call next() with a valid token', () => {
      const next = jest.fn() as unknown as NextFunction;
      const res = buildRes();
      const token = signAccessToken({ sub: 'user-1', role: 'admin' });

      authenticate({ headers: { authorization: `Bearer ${token}` } } as Request, res, next);

      expect(res.locals['user']).toMatchObject({ sub: 'user-1', role: 'admin' });
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authorize()', () => {
    it('should call next() when the user role is allowed', () => {
      const next = jest.fn() as unknown as NextFunction;
      const res = buildRes();
      res.locals['user'] = { role: 'admin' };

      authorize('admin')({} as Request, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with AppError 403 when the role is not allowed', () => {
      const next = jest.fn() as unknown as NextFunction;
      const res = buildRes();
      res.locals['user'] = { role: 'user' };

      authorize('admin')({} as Request, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should call next with AppError 403 when there is no authenticated user', () => {
      const next = jest.fn() as unknown as NextFunction;

      authorize('admin')({} as Request, buildRes(), next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });
});
