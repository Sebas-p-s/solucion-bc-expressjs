// ============================================================
// UNIT TESTS — auth.service.ts
// ============================================================
// La capa de repositorio se MOCKEA — nunca toca una DB real.
// ============================================================

jest.mock('../repositories/users.repository');

import bcrypt from 'bcrypt';
import * as usersRepo from '../repositories/users.repository';
import * as authService from '../services/auth.service';
import type { IUser } from '../models/user.model';

const mockFindByEmail = usersRepo.findUserByEmail as jest.MockedFunction<typeof usersRepo.findUserByEmail>;
const mockFindById = usersRepo.findUserById as jest.MockedFunction<typeof usersRepo.findUserById>;
const mockCreateUser = usersRepo.createUser as jest.MockedFunction<typeof usersRepo.createUser>;

const userBase = {
  _id: 'user-id-abc123',
  name: 'Laura Ramírez',
  email: 'laura@jardin.edu.co',
  role: 'user' as const,
  createdAt: new Date('2025-01-01'),
};

const registerDto = { name: 'Laura Ramírez', email: 'laura@jardin.edu.co', password: 'Password1!' };
const loginDto = { email: 'laura@jardin.edu.co', password: 'Password1!' };

describe('Auth Service — Unit Tests', () => {
  it('should have mocked repository functions', () => {
    expect(jest.isMockFunction(usersRepo.findUserByEmail)).toBe(true);
    expect(jest.isMockFunction(usersRepo.createUser)).toBe(true);
    expect(jest.isMockFunction(usersRepo.findUserById)).toBe(true);
  });

  describe('register()', () => {
    it('should create a user and return it without the password', async () => {
      mockFindByEmail.mockResolvedValue(null);
      const hashedPwd = await bcrypt.hash(registerDto.password, 1);
      mockCreateUser.mockResolvedValue({ ...userBase, password: hashedPwd } as unknown as IUser);

      const result = await authService.register(registerDto);

      expect(result['email']).toBe(registerDto.email);
      expect(result['name']).toBe(registerDto.name);
      expect(result['role']).toBe('user');
      expect(result['password']).toBeUndefined();
      // la contraseña se guarda hasheada, nunca en texto plano
      const savedArg = mockCreateUser.mock.calls[0]![0];
      expect(savedArg.password).not.toBe(registerDto.password);
    });

    it('should throw AppError 409 if email already exists', async () => {
      mockFindByEmail.mockResolvedValue({ ...userBase, password: 'hashed' } as unknown as IUser);

      await expect(authService.register(registerDto)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already registered',
      });
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    it('should throw AppError 401 when user is not found', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw AppError 401 when password is wrong', async () => {
      const realHash = await bcrypt.hash('OtraContrasena1!', 1);
      mockFindByEmail.mockResolvedValue({ ...userBase, password: realHash } as unknown as IUser);

      await expect(authService.login(loginDto)).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should return accessToken on valid credentials', async () => {
      const correctHash = await bcrypt.hash(loginDto.password, 1);
      mockFindByEmail.mockResolvedValue({ ...userBase, password: correctHash } as unknown as IUser);

      const result = await authService.login(loginDto);

      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.split('.')).toHaveLength(3); // formato JWT
    });

    it('should call findByEmail with the correct email', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toBeDefined();

      expect(mockFindByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockFindByEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMe()', () => {
    it('should return the user without the password', async () => {
      mockFindById.mockResolvedValue({ ...userBase, password: 'hashed' } as unknown as IUser);

      const result = await authService.getMe('user-id-abc123');

      expect(result['email']).toBe(userBase.email);
      expect(result['password']).toBeUndefined();
    });

    it('should throw AppError 404 when the user does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(authService.getMe('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
