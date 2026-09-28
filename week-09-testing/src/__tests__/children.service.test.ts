// ============================================================
// UNIT TESTS — children.service.ts (Jardín infantil privado)
// ============================================================
// El repositorio se MOCKEA con jest.mock(): nunca se toca una DB real.
// Patrón AAA: Arrange → Act → Assert
// ============================================================

jest.mock('../repositories/children.repository');

import * as childrenRepo from '../repositories/children.repository';
import * as childrenService from '../services/children.service';
import type { IChild } from '../models/child.model';
import type { CreateChildDto } from '../types';

const mockFindAll = childrenRepo.findAllChildren as jest.MockedFunction<typeof childrenRepo.findAllChildren>;
const mockFindById = childrenRepo.findChildById as jest.MockedFunction<typeof childrenRepo.findChildById>;
const mockFindByDoc = childrenRepo.findChildByDocumentId as jest.MockedFunction<typeof childrenRepo.findChildByDocumentId>;
const mockCreate = childrenRepo.createChild as jest.MockedFunction<typeof childrenRepo.createChild>;
const mockUpdate = childrenRepo.updateChild as jest.MockedFunction<typeof childrenRepo.updateChild>;
const mockDelete = childrenRepo.deleteChild as jest.MockedFunction<typeof childrenRepo.deleteChild>;

const OWNER_ID = 'user-owner-1';
const OTHER_ID = 'user-other-2';

const childBase = {
  _id: 'child-id-123',
  fullName: 'Sofía Ramírez',
  age: 4,
  group: 'pre-jardín',
  documentId: 'RC-0001',
  parentName: 'Laura Ramírez',
  parentPhone: '3011234567',
  activities: ['pintura'],
  active: true,
  createdBy: OWNER_ID,
  createdAt: new Date('2025-02-01'),
  updatedAt: new Date('2025-02-01'),
} as unknown as IChild;

const createDto: CreateChildDto = {
  fullName: 'Sofía Ramírez',
  age: 4,
  group: 'pre-jardín',
  documentId: 'RC-0001',
  parentName: 'Laura Ramírez',
  parentPhone: '3011234567',
  activities: ['pintura'],
};

describe('ChildrenService — Unit Tests', () => {
  describe('getAll()', () => {
    it('should return all children', async () => {
      mockFindAll.mockResolvedValue([childBase, { ...childBase, documentId: 'RC-0002' } as IChild]);

      const result = await childrenService.getAll();

      expect(result).toHaveLength(2);
      expect(mockFindAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no children exist', async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await childrenService.getAll();

      expect(result).toEqual([]);
    });

    it('should forward the group filter to the repository', async () => {
      mockFindAll.mockResolvedValue([childBase]);

      await childrenService.getAll({ group: 'jardín' });

      expect(mockFindAll).toHaveBeenCalledWith({ group: 'jardín' });
    });
  });

  describe('getById()', () => {
    it('should return the child when found', async () => {
      mockFindById.mockResolvedValue(childBase);

      const result = await childrenService.getById('child-id-123');

      expect(result.documentId).toBe('RC-0001');
      expect(mockFindById).toHaveBeenCalledWith('child-id-123');
    });

    it('should throw AppError 404 when the child does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(childrenService.getById('missing')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Child not found',
      });
    });
  });

  describe('create()', () => {
    it('should create and return the new child', async () => {
      mockFindByDoc.mockResolvedValue(null);
      mockCreate.mockResolvedValue(childBase);

      const result = await childrenService.create(createDto, OWNER_ID);

      expect(result.fullName).toBe('Sofía Ramírez');
      expect(mockCreate).toHaveBeenCalledWith(createDto, OWNER_ID);
    });

    it('should throw AppError 409 when the documentId is already registered', async () => {
      mockFindByDoc.mockResolvedValue(childBase);

      await expect(childrenService.create(createDto, OWNER_ID)).rejects.toMatchObject({ statusCode: 409 });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it.each([0, 7, 15])('should throw AppError 400 when age is %i (out of 1-6 range)', async (age) => {
      await expect(childrenService.create({ ...createDto, age }, OWNER_ID)).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(mockFindByDoc).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should update and return the child when requester is the owner', async () => {
      mockFindById.mockResolvedValue(childBase);
      mockUpdate.mockResolvedValue({ ...childBase, age: 5 } as IChild);

      const result = await childrenService.update('child-id-123', { age: 5 }, OWNER_ID, 'user');

      expect(result.age).toBe(5);
      expect(mockUpdate).toHaveBeenCalledWith('child-id-123', { age: 5 });
    });

    it('should allow an admin to update a child registered by someone else', async () => {
      mockFindById.mockResolvedValue(childBase);
      mockUpdate.mockResolvedValue({ ...childBase, active: false } as IChild);

      const result = await childrenService.update('child-id-123', { active: false }, OTHER_ID, 'admin');

      expect(result.active).toBe(false);
    });

    it('should throw AppError 403 when requester is not the owner nor admin', async () => {
      mockFindById.mockResolvedValue(childBase);

      await expect(
        childrenService.update('child-id-123', { age: 5 }, OTHER_ID, 'user'),
      ).rejects.toMatchObject({ statusCode: 403 });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw AppError 404 when the child does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        childrenService.update('missing', { age: 5 }, OWNER_ID, 'user'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw AppError 404 when the child disappears before being updated', async () => {
      mockFindById.mockResolvedValue(childBase);
      mockUpdate.mockResolvedValue(null);

      await expect(
        childrenService.update('child-id-123', { age: 5 }, OWNER_ID, 'user'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw AppError 400 when the new age is out of range', async () => {
      mockFindById.mockResolvedValue(childBase);

      await expect(
        childrenService.update('child-id-123', { age: 9 }, OWNER_ID, 'user'),
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should delete the child when requester is the owner', async () => {
      mockFindById.mockResolvedValue(childBase);
      mockDelete.mockResolvedValue(childBase);

      await expect(childrenService.remove('child-id-123', OWNER_ID, 'user')).resolves.toBeUndefined();

      expect(mockDelete).toHaveBeenCalledWith('child-id-123');
    });

    it('should delete the child when requester is admin', async () => {
      mockFindById.mockResolvedValue(childBase);
      mockDelete.mockResolvedValue(childBase);

      await childrenService.remove('child-id-123', OTHER_ID, 'admin');

      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError 403 when requester is not owner or admin', async () => {
      mockFindById.mockResolvedValue(childBase);

      await expect(childrenService.remove('child-id-123', OTHER_ID, 'user')).rejects.toMatchObject({
        statusCode: 403,
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should throw AppError 404 when the child does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(childrenService.remove('missing', OWNER_ID, 'admin')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
