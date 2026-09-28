import { Schema, model, Document } from 'mongoose';

// Recurso principal del dominio: Jardín infantil privado.
// parents, staff y activities se modelan como atributos del niño.
export type ChildGroup = 'párvulos' | 'pre-jardín' | 'jardín' | 'transición';

export interface IChild extends Document {
  fullName: string;
  age: number;
  group: ChildGroup;
  documentId: string;      // registro civil / T.I. (campo único)
  parentName: string;
  parentPhone: string;
  assignedStaff?: string;
  activities: string[];
  active: boolean;
  createdBy: string;       // ID del usuario que matriculó al niño
  createdAt: Date;
  updatedAt: Date;
}

const childSchema = new Schema<IChild>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    age: { type: Number, required: true, min: 1, max: 6 },
    group: {
      type: String,
      enum: ['párvulos', 'pre-jardín', 'jardín', 'transición'],
      required: true,
    },
    documentId: { type: String, required: true, unique: true, trim: true },
    parentName: { type: String, required: true, trim: true, maxlength: 150 },
    parentPhone: { type: String, required: true, trim: true, maxlength: 20 },
    assignedStaff: { type: String, trim: true, maxlength: 150 },
    activities: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const Child = model<IChild>('Child', childSchema);
