import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceDoc extends Document {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  consultationFee: number;
  labFee: number;
  medicineFee: number;
  otherCharges: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Insurance';
  status: 'Paid' | 'Pending' | 'Overdue';
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

const InvoiceSchema = new Schema<IInvoiceDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    dueDate: { type: String, required: true },
    consultationFee: { type: Number, required: true, default: 0 },
    labFee: { type: Number, required: true, default: 0 },
    medicineFee: { type: Number, required: true, default: 0 },
    otherCharges: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Insurance'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
      index: true,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
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

export const InvoiceModel =
  mongoose.models.Invoice || mongoose.model<IInvoiceDoc>('Invoice', InvoiceSchema);

export default InvoiceModel;
