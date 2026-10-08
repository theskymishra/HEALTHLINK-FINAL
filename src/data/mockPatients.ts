import { Patient } from '../types';

export const initialPatients: Patient[] = [
  {
    id: 'PAT-1001',
    name: 'Aarav Mehta',
    age: 34,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98201 44521',
    email: 'aarav.mehta@healthlink.org',
    address: '42 Lotus Colony, Andheri West, Mumbai, MH 400053',
    emergencyContact: {
      name: 'Sunita Mehta',
      relationship: 'Spouse',
      phone: '+91 98201 44522',
    },
    lastVisit: '2026-10-05',
    status: 'Active',
    allergies: ['Penicillin', 'Peanuts'],
    medicalHistory: [
      {
        date: '2026-10-05',
        diagnosis: 'Hypertension Stage 1 Follow-up & ECG',
        doctor: 'Dr. Rahul Sharma',
        treatment: 'Prescribed Amlodipine 5mg OD, advised low-sodium diet and daily brisk walking.',
        notes: 'BP stabilized to 124/80 mmHg.'
      },
      {
        date: '2026-09-28',
        diagnosis: 'Comprehensive Lipid & Liver Panel',
        doctor: 'Dr. Priya Nair',
        treatment: 'Lab blood sample processed; normal cholesterol ranges verified.',
        notes: 'HDL 48 mg/dL, LDL 96 mg/dL.'
      },
      {
        date: '2026-06-15',
        diagnosis: 'Acute Bronchitis',
        doctor: 'Dr. Shalini Mukherjee',
        treatment: 'Course of Azithromycin and nebulizer sessions.',
        notes: 'Full recovery confirmed after 10 days.'
      }
    ]
  },
  {
    id: 'PAT-1002',
    name: 'Priya Sharma',
    age: 42,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 97123 88902',
    email: 'priya.sharma@example.com',
    address: 'B-104 Shantiniketan Apts, Navrangpura, Ahmedabad, GJ 380009',
    emergencyContact: {
      name: 'Ketan Sharma',
      relationship: 'Brother',
      phone: '+91 97123 88903',
    },
    lastVisit: '2026-10-01',
    status: 'Active',
    allergies: ['Sulfa drugs'],
    medicalHistory: [
      {
        date: '2026-10-01',
        diagnosis: 'Atypical Chest Discomfort',
        doctor: 'Dr. Rahul Sharma',
        treatment: 'Baseline 12-lead ECG and troponin testing advised.',
        notes: 'Scheduled for in-person cardiology review.'
      }
    ]
  },
  {
    id: 'PAT-1003',
    name: 'Rohan Verma',
    age: 56,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 94220 11984',
    email: 'rohan.verma@example.com',
    address: '15/3 Kothrud Greenview, Pune, MH 411038',
    emergencyContact: {
      name: 'Madhuri Verma',
      relationship: 'Spouse',
      phone: '+91 94220 11985',
    },
    lastVisit: '2026-09-22',
    status: 'Active',
    allergies: ['None reported'],
    medicalHistory: [
      {
        date: '2026-09-22',
        diagnosis: 'Hypertension & Lipid Maintenance',
        doctor: 'Dr. Rahul Sharma',
        treatment: 'Titrated Telmisartan 40mg with Atorvastatin 10mg.',
        notes: 'Medication adherence confirmed good.'
      }
    ]
  },
  {
    id: 'PAT-1004',
    name: 'Ananya Iyer',
    age: 8,
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+91 98402 77123',
    email: 'parent.iyer@example.com',
    address: '89 Besant Nagar, Chennai, TN 600090',
    emergencyContact: {
      name: 'Srinivasan Iyer',
      relationship: 'Father',
      phone: '+91 98402 77124',
    },
    lastVisit: '2026-10-06',
    status: 'Active',
    allergies: ['Egg Protein'],
    medicalHistory: [
      {
        date: '2026-10-06',
        diagnosis: 'Viral Pharyngitis with Mild Dehydration',
        doctor: 'Dr. Meera Nambiar',
        treatment: 'Oral rehydration salts, Paracetamol syrup 250mg SOS.',
        notes: 'Vitals stable, throat redness reduced.'
      }
    ]
  },
  {
    id: 'PAT-1005',
    name: 'Vikram Singh',
    age: 39,
    gender: 'Male',
    bloodGroup: 'O-',
    phone: '+91 98114 33201',
    email: 'vikram.singh@example.com',
    address: 'C-7 Sector 14, Gurugram, HR 122001',
    emergencyContact: {
      name: 'Harpreet Kaur',
      relationship: 'Spouse',
      phone: '+91 98114 33202',
    },
    lastVisit: '2026-08-14',
    status: 'Inactive',
    allergies: ['Iodine contrast dye'],
    medicalHistory: [
      {
        date: '2026-08-14',
        diagnosis: 'Lumbar Strain L4-L5',
        doctor: 'Dr. Vikramaditya Rao',
        treatment: 'Muscle relaxants, lumbar belt support, posture correction.',
        notes: 'Patient advised ergonomic workstation setup.'
      }
    ]
  },
  {
    id: 'PAT-1006',
    name: 'Neha Kulkarni',
    age: 27,
    gender: 'Female',
    bloodGroup: 'A-',
    phone: '+91 99234 66109',
    email: 'neha.kulkarni@example.com',
    address: ' फ्लैट 402, Shivajinagar, Pune, MH 411005',
    emergencyContact: {
      name: 'Rahul Kulkarni',
      relationship: 'Husband',
      phone: '+91 99234 66110',
    },
    lastVisit: '2026-10-04',
    status: 'Active',
    allergies: ['None'],
    medicalHistory: [
      {
        date: '2026-10-04',
        diagnosis: 'Iron Deficiency Anemia',
        doctor: 'Dr. Shalini Mukherjee',
        treatment: 'Ferrous ascorbate with folic acid 100mg tablets, dietary counselling.',
        notes: 'Hb at 10.2 g/dL. Retest planned after 60 days.'
      }
    ]
  },
  {
    id: 'PAT-1007',
    name: 'Suresh Nair',
    age: 63,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 94470 55182',
    email: 'suresh.nair@example.com',
    address: 'Plot 12, Panampilly Nagar, Kochi, KL 682036',
    emergencyContact: {
      name: 'Lakshmi Nair',
      relationship: 'Daughter',
      phone: '+91 94470 55183',
    },
    lastVisit: '2026-09-19',
    status: 'Active',
    allergies: ['Aspirin'],
    medicalHistory: [
      {
        date: '2026-09-19',
        diagnosis: 'Type 2 Diabetes Mellitus & Dyslipidemia',
        doctor: 'Dr. Shalini Mukherjee',
        treatment: 'Metformin 500mg SR BD, Atorvastatin 10mg HS.',
        notes: 'HbA1c 7.1%. Glycemic control improving.'
      }
    ]
  },
  {
    id: 'PAT-1008',
    name: 'Pooja Mehra',
    age: 34,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 98711 99042',
    email: 'pooja.mehra@example.com',
    address: 'H-52 Greater Kailash 1, New Delhi, DL 110048',
    emergencyContact: {
      name: 'Sameer Mehra',
      relationship: 'Spouse',
      phone: '+91 98711 99043',
    },
    lastVisit: '2026-10-01',
    status: 'Active',
    allergies: ['None'],
    medicalHistory: [
      {
        date: '2026-10-01',
        diagnosis: 'Cervical Radiculopathy',
        doctor: 'Dr. Farhan Rizvi',
        treatment: 'Gabapentin, gentle cervical traction.',
        notes: 'Numbness in right index finger receding.'
      }
    ]
  }
];
