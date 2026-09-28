import mongoose, { Schema, Document } from 'mongoose';
import type { ChildGroup } from '../types/index.js';

// Recurso principal del dominio: Jardín infantil privado.
// parents → parentName/parentPhone · staff → assignedStaff · activities → activities[]
export interface IChild extends Document {
  fullName: string;
  age: number;
  group: ChildGroup;
  documentId: string;
  parentName: string;
  parentPhone: string;
  assignedStaff?: string;
  activities: string[];
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChildSchema = new Schema<IChild>(
  {
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 6 },
    group: { type: String, enum: ['párvulos', 'pre-jardín', 'jardín', 'transición'], required: true },
    documentId: { type: String, required: true, unique: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    assignedStaff: { type: String, trim: true },
    activities: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const ChildModel = mongoose.model<IChild>('Child', ChildSchema);
