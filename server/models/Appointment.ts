import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointmentDoc extends Document {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: 'General Checkup' | 'Follow-up' | 'Emergency' | 'Consultation' | 'Specialist Review';
  status: 'Scheduled' | 'Completed' | 'Pending' | 'Cancelled';
  reason: string;
  tokenNumber: number;
}

const AppointmentSchema = new Schema<IAppointmentDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true },
    type: {
      type: String,
      enum: ['General Checkup', 'Follow-up', 'Emergency', 'Consultation', 'Specialist Review'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Pending', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    reason: { type: String, required: true },
    tokenNumber: { type: Number, required: true },
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

export const AppointmentModel =
  mongoose.models.Appointment || mongoose.model<IAppointmentDoc>('Appointment', AppointmentSchema);

export default AppointmentModel;
