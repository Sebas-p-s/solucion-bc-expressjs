// ============================================
// MODELO: Child (entidad principal — referencia a Staff)
// Dominio: Jardín infantil privado
// ============================================

import { Schema, model, Types } from 'mongoose';

export type ChildGroup = 'párvulos' | 'pre-jardín' | 'jardín' | 'transición';

export interface IChild {
  fullName: string;
  age: number;
  group: ChildGroup;
  parentName: string;
  parentPhone: string;
  activities: string[];
  active: boolean;
  // Referencia a la entidad secundaria: profesor/cuidador asignado
  assignedStaff: Types.ObjectId;
}

const childSchema = new Schema<IChild>(
  {
    fullName: {
      type: String,
      required: [true, 'El nombre completo es requerido'],
      trim: true,
      maxlength: 150,
    },
    age: {
      type: Number,
      required: [true, 'La edad es requerida'],
      min: [1, 'La edad mínima es 1 año'],
      max: [6, 'La edad máxima para este jardín es 6 años'],
    },
    group: {
      type: String,
      enum: ['párvulos', 'pre-jardín', 'jardín', 'transición'],
      required: [true, 'El grupo/salón es requerido'],
    },
    parentName: {
      type: String,
      required: [true, 'El nombre del acudiente es requerido'],
      trim: true,
      maxlength: 150,
    },
    parentPhone: {
      type: String,
      required: [true, 'El teléfono del acudiente es requerido'],
      trim: true,
      maxlength: 20,
    },
    activities: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Campo de referencia — apunta al Model 'Staff'
    assignedStaff: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'El staff asignado es requerido'],
    },
  },
  { timestamps: true },
);

export const Child = model<IChild>('Child', childSchema);
