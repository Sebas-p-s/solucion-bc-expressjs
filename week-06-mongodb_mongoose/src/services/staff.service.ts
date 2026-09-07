// ============================================
// SERVICE: Staff (delega al repositorio)
// ============================================

import * as repo from '../repositories/staff.repository';
import type { CreateStaffDto, UpdateStaffDto } from '../schemas/staff.schema';

export async function getAll() {
  return repo.findAll();
}

export async function getById(id: string) {
  return repo.findById(id);
}

export async function createStaff(dto: CreateStaffDto) {
  return repo.create(dto);
}

export async function updateStaff(id: string, dto: UpdateStaffDto) {
  return repo.update(id, dto);
}

export async function deleteStaff(id: string) {
  return repo.remove(id);
}
