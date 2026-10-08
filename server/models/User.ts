import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  id: string;
  name: string;
  email: string;
  role: string;
  roleKey: 'admin' | 'doctor' | 'patient';
  avatarUrl?: string;
  phone?: string;
  password?: string;
}

const UserSchema = new Schema<IUserDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, required: true },
    roleKey: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      required: true,
      index: true,
    },
    avatarUrl: { type: String },
    phone: { type: String },
    password: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
        delete (ret as Record<string, unknown>).password;
        return ret;
      },
    },
  }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);

export default UserModel;
