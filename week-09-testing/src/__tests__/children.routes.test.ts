// ============================================================
// INTEGRATION TESTS — /api/v1/children (Jardín infantil privado)
// ============================================================
// Ciclo completo HTTP → controller → service → repository → MongoDB en memoria.
// Sin mocks: Supertest + MongoDB Memory Server.
// ============================================================

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';
import { UserModel } from '../models/user.model';

const BASE = '/api/v1/children';

let mongod: MongoMemoryServer;
let userToken: string;   // usuario que matricula niños
let otherToken: string;  // otro usuario (no dueño)
let adminToken: string;

const validChild = {
  fullName: 'Sofía Ramírez',
  age: 4,
  group: 'pre-jardín',
  documentId: 'RC-0001',
  parentName: 'Laura Ramírez',
  parentPhone: '3011234567',
  activities: ['pintura', 'música'],
};

async function registerAndLogin(email: string, role?: 'admin'): Promise<string> {
  await request(app).post('/api/v1/auth/register').send({ name: 'Usuario Test', email, password: 'Password1!' });
  if (role) await UserModel.updateOne({ email }, { role });
  const login = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password1!' });
  return login.body.accessToken as string;
}

async function createChild(token: string, overrides: Record<string, unknown> = {}): Promise<string> {
  const res = await request(app).post(BASE).set('Authorization', `Bearer ${token}`).send({ ...validChild, ...overrides });
  return res.body.data._id as string;
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await UserModel.init();

  userToken = await registerAndLogin('user@jardin.edu.co');
  otherToken = await registerAndLogin('other@jardin.edu.co');
  adminToken = await registerAndLogin('admin@jardin.edu.co', 'admin');
});

afterEach(async () => {
  // Solo se limpia la colección de niños: los usuarios/tokens del beforeAll se conservan
  await mongoose.connection.collection('children').deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Children Routes — Integration Tests', () => {
  describe('GET /api/v1/children', () => {
    it('should return 200 and an empty array initially', async () => {
      const res = await request(app).get(BASE);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('should list the registered children', async () => {
      await createChild(userToken);
      await createChild(userToken, { documentId: 'RC-0002', fullName: 'Mateo Gómez' });

      const res = await request(app).get(BASE);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
    });

    it('should filter children by group', async () => {
      await createChild(userToken, { documentId: 'RC-0001', group: 'jardín' });
      await createChild(userToken, { documentId: 'RC-0002', group: 'párvulos' });

      const res = await request(app).get(`${BASE}?group=jardín`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].group).toBe('jardín');
    });

    it('should return 422 when the group filter is invalid', async () => {
      const res = await request(app).get(`${BASE}?group=inexistente`);

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/children', () => {
    it('should return 201 with valid data and token', async () => {
      const res = await request(app).post(BASE).set('Authorization', `Bearer ${userToken}`).send(validChild);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ fullName: 'Sofía Ramírez', documentId: 'RC-0001', active: true });
      expect(res.body.data._id).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app).post(BASE).send(validChild);

      expect(res.status).toBe(401);
    });

    it('should return 422 with invalid data', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ fullName: 'X', age: 'cuatro', group: 'no-existe' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 422 when age is outside the 1-6 range', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validChild, age: 12 });

      expect(res.status).toBe(422);
    });

    it('should return 409 when the documentId is already registered', async () => {
      await createChild(userToken);

      const res = await request(app).post(BASE).set('Authorization', `Bearer ${userToken}`).send(validChild);

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/children/:id', () => {
    it('should return 200 with an existing child', async () => {
      const id = await createChild(userToken);

      const res = await request(app).get(`${BASE}/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.documentId).toBe('RC-0001');
    });

    it('should return 404 with a non-existent ID', async () => {
      const res = await request(app).get(`${BASE}/${new mongoose.Types.ObjectId().toString()}`);

      expect(res.status).toBe(404);
    });

    it('should return 422 with a malformed ID', async () => {
      const res = await request(app).get(`${BASE}/123`);

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/v1/children/:id', () => {
    it('should return 200 when the owner updates', async () => {
      const id = await createChild(userToken);

      const res = await request(app)
        .put(`${BASE}/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ age: 5, activities: ['danza'] });

      expect(res.status).toBe(200);
      expect(res.body.data.age).toBe(5);
      expect(res.body.data.activities).toEqual(['danza']);
    });

    it('should return 200 when an admin updates a child registered by someone else', async () => {
      const id = await createChild(userToken);

      const res = await request(app)
        .put(`${BASE}/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: false });

      expect(res.status).toBe(200);
      expect(res.body.data.active).toBe(false);
    });

    it('should return 403 when a non-owner tries to update', async () => {
      const id = await createChild(userToken);

      const res = await request(app)
        .put(`${BASE}/${id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ age: 5 });

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const id = await createChild(userToken);

      const res = await request(app).put(`${BASE}/${id}`).send({ age: 5 });

      expect(res.status).toBe(401);
    });

    it('should return 404 when the child does not exist', async () => {
      const res = await request(app)
        .put(`${BASE}/${new mongoose.Types.ObjectId().toString()}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ age: 5 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/children/:id', () => {
    it('should return 204 when the owner deletes', async () => {
      const id = await createChild(userToken);

      const res = await request(app).delete(`${BASE}/${id}`).set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(204);
      const after = await request(app).get(`${BASE}/${id}`);
      expect(after.status).toBe(404);
    });

    it('should return 204 when an admin deletes', async () => {
      const id = await createChild(userToken);

      const res = await request(app).delete(`${BASE}/${id}`).set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 403 when a non-owner and non-admin tries to delete', async () => {
      const id = await createChild(userToken);

      const res = await request(app).delete(`${BASE}/${id}`).set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      const after = await request(app).get(`${BASE}/${id}`);
      expect(after.status).toBe(200); // el niño sigue existiendo
    });

    it('should return 404 when the child does not exist', async () => {
      const res = await request(app)
        .delete(`${BASE}/${new mongoose.Types.ObjectId().toString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});
