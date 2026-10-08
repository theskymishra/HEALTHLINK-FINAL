import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecordDoc extends Document {
  id: string;
  patientId: string;
  patientName: string;
  recordType: 'Consultation' | 'Lab Report' | 'Prescription' | 'Scan';
  doctorId: string;
  doctorName: string;
  date: string;
  status: 'Completed' | 'Pending Review' | 'Archived';
  title: string;
  description: string;
  fileSize?: string;
  diagnosis?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  labResults?: Array<{
    test: string;
    result: string;
    normalRange: string;
    flag?: 'Normal' | 'High' | 'Low';
  }>;
}

const MedicalRecordSchema = new Schema<IMedicalRecordDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    recordType: {
      type: String,
      enum: ['Consultation', 'Lab Report', 'Prescription', 'Scan'],
      required: true,
      index: true,
    },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Completed', 'Pending Review', 'Archived'],
      default: 'Completed',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    fileSize: { type: String },
    diagnosis: { type: String },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
    labResults: [
      {
        test: { type: String, required: true },
        result: { type: String, required: true },
        normalRange: { type: String, required: true },
        flag: { type: String, enum: ['Normal', 'High', 'Low'] },
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

export const MedicalRecordModel =
  mongoose.models.MedicalRecord ||
  mongoose.model<IMedicalRecordDoc>('MedicalRecord', MedicalRecordSchema);

export default MedicalRecordModel;
