import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorDoc extends Document {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string;
  department: string;
  experienceYears: number;
  qualification: string;
  phone: string;
  email: string;
  availability: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  roomNumber: string;
  bio?: string;
  schedule: Array<{
    day: string;
    slots: string;
    status: 'Available' | 'Surgery' | 'Off' | 'OPD';
  }>;
}

const DoctorSchema = new Schema<IDoctorDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    specialization: { type: String, required: true },
    department: { type: String, required: true, index: true },
    experienceYears: { type: Number, required: true },
    qualification: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    availability: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
      index: true,
    },
    roomNumber: { type: String, required: true },
    bio: { type: String },
    schedule: [
      {
        day: { type: String, required: true },
        slots: { type: String, required: true },
        status: {
          type: String,
          enum: ['Available', 'Surgery', 'Off', 'OPD'],
          required: true,
        },
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

export const DoctorModel =
  mongoose.models.Doctor || mongoose.model<IDoctorDoc>('Doctor', DoctorSchema);

export default DoctorModel;
