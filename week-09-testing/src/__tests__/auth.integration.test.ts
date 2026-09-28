// ============================================================
// INTEGRATION TESTS — auth routes
// ============================================================
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';
import { UserModel } from '../models/user.model';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await UserModel.init();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]!.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const credentials = { name: 'Laura Ramírez', email: 'laura@jardin.edu.co', password: 'Password1!' };

describe('Auth Routes — Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should return 201 and user data on valid registration', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(credentials);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ email: credentials.email, name: credentials.name, role: 'user' });
      expect(res.body.data.password).toBeUndefined();
      // regresión: no deben filtrarse campos internos de Mongoose ni el hash dentro de _doc
      expect(res.body.data._doc).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('$2b$');
    });

    it('should return 422 on invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'A', email: 'not-an-email', password: '123' });

      expect(res.status).toBe(422);
    });

    it('should return 409 when email is already registered', async () => {
      await request(app).post('/api/v1/auth/register').send(credentials);

      const res = await request(app).post('/api/v1/auth/register').send({ ...credentials, name: 'Duplicada' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Email already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(credentials);
    });

    it('should return 200 and accessToken on valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: credentials.email, password: credentials.password });

      expect(res.status).toBe(200);
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('should return 401 on wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: credentials.email, password: 'WrongPassword1!' });

      expect(res.status).toBe(401);
    });

    it('should return 401 when the user does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nadie@jardin.edu.co', password: 'Password1!' });

      expect(res.status).toBe(401);
    });

    it('should use the token to access GET /auth/me', async () => {
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: credentials.email, password: credentials.password });

      const me = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${login.body.accessToken as string}`);

      expect(me.status).toBe(200);
      expect(me.body.data.email).toBe(credentials.email);
    });

    it('should return 401 on GET /auth/me without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
