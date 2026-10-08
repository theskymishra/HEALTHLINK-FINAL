import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartmentDoc extends Document {
  id: string;
  name: string;
  headOfDepartment: string;
  doctorCount: number;
  todayAppointments: number;
  totalBeds: number;
  occupiedBeds: number;
  iconName: string;
}

const DepartmentSchema = new Schema<IDepartmentDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    headOfDepartment: { type: String, required: true },
    doctorCount: { type: Number, required: true },
    todayAppointments: { type: Number, required: true },
    totalBeds: { type: Number, required: true },
    occupiedBeds: { type: Number, required: true },
    iconName: { type: String, required: true },
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

export const DepartmentModel =
  mongoose.models.Department || mongoose.model<IDepartmentDoc>('Department', DepartmentSchema);

export default DepartmentModel;
