// Core TypeScript types for HEALTHLINK

export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PatientStatus = 'Active' | 'Inactive';

export interface Patient {
  id: string; // e.g., 'PAT-1001'
  name: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  lastVisit: string; // YYYY-MM-DD
  status: PatientStatus;
  allergies?: string[];
  medicalHistory?: Array<{
    date: string;
    diagnosis: string;
    doctor: string;
    treatment: string;
    notes?: string;
  }>;
}

export type DoctorStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Doctor {
  id: string; // e.g., 'DOC-201'
  name: string;
  avatarUrl?: string;
  specialization: string;
  department: string;
  experienceYears: number;
  qualification: string;
  phone: string;
  email: string;
  availability: string; // e.g. "Mon - Fri, 9:00 AM - 4:00 PM"
  status: DoctorStatus;
  roomNumber: string;
  bio?: string;
  schedule: Array<{
    day: string;
    slots: string;
    status: 'Available' | 'Surgery' | 'Off' | 'OPD';
  }>;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Pending' | 'Cancelled';
export type AppointmentType = 'General Checkup' | 'Follow-up' | 'Emergency' | 'Consultation' | 'Specialist Review';

export interface Appointment {
  id: string; // e.g., 'APT-301'
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  tokenNumber: number;
}

export type RecordType = 'Consultation' | 'Lab Report' | 'Prescription' | 'Scan';

export interface MedicalRecord {
  id: string; // e.g., 'REC-401'
  patientId: string;
  patientName: string;
  recordType: RecordType;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
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

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';
export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Insurance';

export interface Invoice {
  id: string; // e.g., 'INV-501'
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  dueDate: string;
  consultationFee: number;
  labFee: number;
  medicineFee: number;
  otherCharges: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface Department {
  id: string;
  name: string;
  headOfDepartment: string;
  doctorCount: number;
  todayAppointments: number;
  totalBeds: number;
  occupiedBeds: number;
  iconName: string;
}

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Doctor' | 'Patient' | string;
  roleKey: UserRole;
  avatarUrl?: string;
  phone?: string;
}

