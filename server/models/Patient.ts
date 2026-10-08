import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientDoc extends Document {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  lastVisit: string;
  status: 'Active' | 'Inactive';
  allergies: string[];
  medicalHistory: Array<{
    date: string;
    diagnosis: string;
    doctor: string;
    treatment: string;
    notes?: string;
  }>;
}

const PatientSchema = new Schema<IPatientDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    lastVisit: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    allergies: { type: [String], default: [] },
    medicalHistory: [
      {
        date: { type: String, required: true },
        diagnosis: { type: String, required: true },
        doctor: { type: String, required: true },
        treatment: { type: String, required: true },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const PatientModel =
  mongoose.models.Patient || mongoose.model<IPatientDoc>('Patient', PatientSchema);

export default PatientModel;
