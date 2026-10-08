import mongoose from 'mongoose';
import { PatientModel } from '../models/Patient';
import { DoctorModel } from '../models/Doctor';
import { AppointmentModel } from '../models/Appointment';
import { MedicalRecordModel } from '../models/MedicalRecord';
import { InvoiceModel } from '../models/Invoice';
import { DepartmentModel } from '../models/Department';
import { UserModel } from '../models/User';

import { initialPatients } from '../../src/data/mockPatients';
import { initialDoctors } from '../../src/data/mockDoctors';
import { initialAppointments } from '../../src/data/mockAppointments';
import { initialMedicalRecords } from '../../src/data/mockMedicalRecords';
import { initialInvoices } from '../../src/data/mockInvoices';
import { initialDepartments } from '../../src/data/mockDepartments';
import { DEMO_USERS } from '../../src/context/AuthContext';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined in .env');
  }

  try {
    await mongoose.connect(mongoUri, { dbName: 'healthlink_clinical_os' });
    isConnected = true;
    console.log('MongoDB Atlas connected successfully.');
    await seedInitialData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function seedInitialData(): Promise<void> {
  try {
    // 1. Seed Patients
    for (const patient of initialPatients) {
      await PatientModel.findOneAndUpdate(
        { id: patient.id },
        patient,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // 2. Seed Doctors
    for (const doctor of initialDoctors) {
      await DoctorModel.findOneAndUpdate(
        { id: doctor.id },
        doctor,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // 3. Seed Appointments
    for (const appt of initialAppointments) {
      await AppointmentModel.findOneAndUpdate(
        { id: appt.id },
        appt,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // 4. Seed Medical Records
    for (const record of initialMedicalRecords) {
      await MedicalRecordModel.findOneAndUpdate(
        { id: record.id },
        record,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // 5. Seed Invoices
    for (const invoice of initialInvoices) {
      await InvoiceModel.findOneAndUpdate(
        { id: invoice.id },
        invoice,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // 6. Seed Departments
    for (const dept of initialDepartments) {
      await DepartmentModel.findOneAndUpdate(
        { id: dept.id },
        dept,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    // 7. Seed Demo Users
    for (const userKey of Object.keys(DEMO_USERS) as Array<keyof typeof DEMO_USERS>) {
      const demoUser = DEMO_USERS[userKey];
      await UserModel.findOneAndUpdate(
        { id: demoUser.id },
        { ...demoUser, password: 'securePass123' },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    console.log('MongoDB Atlas initial datasets verified and seeded.');
  } catch (seedErr) {
    console.error('Error seeding initial datasets:', seedErr);
  }
}
