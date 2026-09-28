import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// MODELO DEL RECURSO PRINCIPAL — Jardín infantil privado
// ============================================
// Recurso principal: Child (niño matriculado).
// Las demás entidades del dominio se modelan como atributos del niño:
//   parents    → parentName / parentPhone
//   staff      → assignedStaff
//   activities → activities[]
// Campo único: documentId (registro civil / T.I.)
// ============================================

export type ChildGroup = 'párvulos' | 'pre-jardín' | 'jardín' | 'transición';

export interface IChild extends Document {
  fullName: string;
  age: number;
  group: ChildGroup;
  documentId: string;               // registro civil / T.I. (único)
  parentName: string;
  parentPhone: string;
  assignedStaff?: string;
  activities: string[];
  active: boolean;
  createdBy: mongoose.Types.ObjectId; // usuario que matriculó al niño
  createdAt: Date;
  updatedAt: Date;
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
      min: 1,
      max: 6,
    },
    group: {
      type: String,
      enum: ['párvulos', 'pre-jardín', 'jardín', 'transición'],
      required: [true, 'El grupo es requerido'],
    },
    documentId: {
      type: String,
      required: [true, 'El documento es requerido'],
      unique: true,
      trim: true,
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
    assignedStaff: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    activities: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const ChildModel = mongoose.model<IChild>('Child', childSchema);
