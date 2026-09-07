// ============================================
// MODELO: Staff (entidad secundaria — sin referencias)
// Dominio: Jardín infantil privado
// ============================================

import { Schema, model } from 'mongoose';

export type StaffRole = 'profesora' | 'auxiliar' | 'coordinadora';

export interface IStaff {
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
}

const staffSchema = new Schema<IStaff>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['profesora', 'auxiliar', 'coordinadora'],
      required: [true, 'El rol es requerido'],
    },
    phone: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: [true, 'El correo es requerido'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 150,
    },
  },
  { timestamps: true },
);

// El nombre del Model (singular, PascalCase) determina la colección: 'Staff' → 'staff'
export const Staff = model<IStaff>('Staff', staffSchema);
