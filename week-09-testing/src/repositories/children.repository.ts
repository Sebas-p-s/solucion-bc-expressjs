import { ChildModel, type IChild } from '../models/child.model.js';
import type { ChildFilters, CreateChildDto, UpdateChildDto } from '../types/index.js';

// ============================================================
// REPOSITORIO DE NIÑOS — capa de acceso a datos
// ============================================================
// En los unit tests, ESTE módulo se mockea con jest.mock().
// En los integration tests, accede a MongoDB Memory Server.
// ============================================================

export async function findAllChildren(filters: ChildFilters = {}): Promise<IChild[]> {
  const query: Record<string, unknown> = {};
  if (filters.group) query['group'] = filters.group;
  if (filters.createdBy) query['createdBy'] = filters.createdBy;
  return ChildModel.find(query).lean<IChild[]>().exec();
}

export async function findChildById(id: string): Promise<IChild | null> {
  return ChildModel.findById(id).lean<IChild>().exec();
}

export async function findChildByDocumentId(documentId: string): Promise<IChild | null> {
  return ChildModel.findOne({ documentId }).lean<IChild>().exec();
}

export async function createChild(dto: CreateChildDto, createdBy: string): Promise<IChild> {
  const child = new ChildModel({ ...dto, createdBy });
  return child.save() as unknown as IChild;
}

export async function updateChild(id: string, dto: UpdateChildDto): Promise<IChild | null> {
  return ChildModel.findByIdAndUpdate(id, dto, { new: true }).lean<IChild>().exec();
}

export async function deleteChild(id: string): Promise<IChild | null> {
  return ChildModel.findByIdAndDelete(id).lean<IChild>().exec();
}
