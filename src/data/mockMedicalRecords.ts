import { MedicalRecord } from '../types';

export const initialMedicalRecords: MedicalRecord[] = [
  // Aarav Mehta (PAT-1001) - 8 Records (matching patient stats and prompt requirements)
  {
    id: 'REC-401',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Consultation',
    doctorId: 'DOC-201',
    doctorName: 'Dr. Rahul Sharma',
    date: '2026-10-05',
    status: 'Completed',
    title: 'Cardiology Comprehensive Evaluation',
    description: 'Patient presented for routine hypertension maintenance. Heart sounds S1, S2 audible, no murmurs. ECG displays normal sinus rhythm without ischemic ST-T changes.',
    fileSize: '1.4 MB PDF',
    diagnosis: 'Essential Stage 1 Hypertension (Controlled)',
    medications: [
      { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (Morning)', duration: '90 days' },
      { name: 'Aspirin (Cardiprin)', dosage: '75 mg', frequency: 'Once daily (Post dinner)', duration: '90 days' }
    ]
  },
  {
    id: 'REC-402',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Lab Report',
    doctorId: 'DOC-207',
    doctorName: 'Dr. Priya Nair',
    date: '2026-09-28',
    status: 'Completed',
    title: 'Lipid Profile & Renal Function Panel',
    description: 'Fasting venous blood analysis automated via Beckman Coulter AU5800 clinical chemistry system.',
    fileSize: '820 KB PDF',
    labResults: [
      { test: 'Total Cholesterol', result: '184 mg/dL', normalRange: '< 200 mg/dL', flag: 'Normal' },
      { test: 'Triglycerides', result: '142 mg/dL', normalRange: '< 150 mg/dL', flag: 'Normal' },
      { test: 'HDL Cholesterol', result: '48 mg/dL', normalRange: '> 40 mg/dL', flag: 'Normal' },
      { test: 'LDL Cholesterol', result: '96 mg/dL', normalRange: '< 100 mg/dL', flag: 'Normal' },
      { test: 'Serum Creatinine', result: '0.88 mg/dL', normalRange: '0.7 - 1.3 mg/dL', flag: 'Normal' }
    ]
  },
  {
    id: 'REC-403',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Prescription',
    doctorId: 'DOC-201',
    doctorName: 'Dr. Rahul Sharma',
    date: '2026-09-15',
    status: 'Completed',
    title: 'Hypertension Maintenance & Anticoagulant Protocol',
    description: 'Quarterly medication refill and preventative coronary health guidance.',
    fileSize: '540 KB PDF',
    medications: [
      { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily morning', duration: '90 days' },
      { name: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily at bedtime', duration: '90 days' }
    ]
  },
  {
    id: 'REC-404',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Scan',
    doctorId: 'DOC-205',
    doctorName: 'Dr. Farhan Rizvi',
    date: '2026-08-10',
    status: 'Completed',
    title: 'Cervical Spine Radiography (AP & Lateral)',
    description: 'Vertebral alignment preserved. Normal disk spaces. No evidence of nerve compression.',
    fileSize: '3.6 MB DICOM/PDF',
    diagnosis: 'Mild postural cervical spasm; ergonomics recommended.'
  },
  {
    id: 'REC-405',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Consultation',
    doctorId: 'DOC-201',
    doctorName: 'Dr. Rahul Sharma',
    date: '2026-07-14',
    status: 'Completed',
    title: 'Treadmill Stress Test (TMT) Assessment',
    description: 'Standard Bruce protocol achieved Stage 4. Target heart rate attained without angina or ST deviations.',
    fileSize: '1.8 MB PDF',
    diagnosis: 'Negative for inducible myocardial ischemia.'
  },
  {
    id: 'REC-406',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Lab Report',
    doctorId: 'DOC-207',
    doctorName: 'Dr. Priya Nair',
    date: '2026-05-22',
    status: 'Completed',
    title: 'Complete Hemogram & Fasting Blood Sugar',
    description: 'Annual corporate health check screening.',
    fileSize: '650 KB PDF',
    labResults: [
      { test: 'Fasting Glucose', result: '92 mg/dL', normalRange: '70 - 99 mg/dL', flag: 'Normal' },
      { test: 'HbA1c', result: '5.4 %', normalRange: '< 5.7 %', flag: 'Normal' },
      { test: 'Hemoglobin', result: '14.8 g/dL', normalRange: '13.5 - 17.5 g/dL', flag: 'Normal' }
    ]
  },
  {
    id: 'REC-407',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Prescription',
    doctorId: 'DOC-201',
    doctorName: 'Dr. Rahul Sharma',
    date: '2026-02-11',
    status: 'Completed',
    title: 'Anti-hypertensive Titration Note',
    description: 'Initial commencement on calcium channel blocker therapy.',
    fileSize: '410 KB PDF',
    medications: [
      { name: 'Amlodipine', dosage: '2.5 mg', frequency: 'Once daily morning', duration: '30 days' }
    ]
  },
  {
    id: 'REC-408',
    patientId: 'PAT-1001',
    patientName: 'Aarav Mehta',
    recordType: 'Consultation',
    doctorId: 'DOC-202',
    doctorName: 'Dr. Shalini Mukherjee',
    date: '2025-11-08',
    status: 'Completed',
    title: 'Annual Executive Health Physical Examination',
    description: 'Comprehensive wellness checkup. Systemic examination within normal limits.',
    fileSize: '1.1 MB PDF',
    diagnosis: 'Good general physical health; advised salt restriction.'
  },

  // Other hospital patient records (Dr. Rahul Sharma and colleagues)
  {
    id: 'REC-409',
    patientId: 'PAT-1002',
    patientName: 'Priya Sharma',
    recordType: 'Consultation',
    doctorId: 'DOC-201',
    doctorName: 'Dr. Rahul Sharma',
    date: '2026-10-01',
    status: 'Completed',
    title: 'Atypical Chest Pain Diagnostic Summary',
    description: 'Normal resting ECG. Referred for cardiac enzymatic markers and ambulatory monitoring.',
    fileSize: '1.2 MB PDF',
    diagnosis: 'Musculoskeletal chest wall discomfort with mild anxiety overlay.'
  },
  {
    id: 'REC-410',
    patientId: 'PAT-1003',
    patientName: 'Rohan Verma',
    recordType: 'Prescription',
    doctorId: 'DOC-201',
    doctorName: 'Dr. Rahul Sharma',
    date: '2026-09-22',
    status: 'Completed',
    title: 'Cardio-Renal Protective Prescriptions',
    description: 'Telmisartan 40mg once daily titrated with Atorvastatin 10mg.',
    fileSize: '480 KB PDF',
    medications: [
      { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily morning', duration: '90 days' },
      { name: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily night', duration: '90 days' }
    ]
  },
  {
    id: 'REC-411',
    patientId: 'PAT-1004',
    patientName: 'Ananya Iyer',
    recordType: 'Prescription',
    doctorId: 'DOC-204',
    doctorName: 'Dr. Meera Nambiar',
    date: '2026-10-06',
    status: 'Completed',
    title: 'Pediatric Acute Pharyngitis Prescription',
    description: 'Symptomatic supportive treatment for acute viral throat inflammation in pediatric patient.',
    fileSize: '450 KB PDF',
    medications: [
      { name: 'Paracetamol Suspension (120mg/5ml)', dosage: '7.5 ml', frequency: 'Every 6 hours SOS', duration: '3 days' },
      { name: 'Cetirizine Syrup (5mg/5ml)', dosage: '2.5 ml', frequency: 'At bedtime', duration: '5 days' }
    ]
  },
  {
    id: 'REC-412',
    patientId: 'PAT-1006',
    patientName: 'Neha Kulkarni',
    recordType: 'Lab Report',
    doctorId: 'DOC-202',
    doctorName: 'Dr. Shalini Mukherjee',
    date: '2026-10-04',
    status: 'Pending Review',
    title: 'Complete Hemogram & Serum Ferritin Assay',
    description: 'Automated 5-part differential cell counter report investigating generalized lethargy and pallor.',
    fileSize: '650 KB PDF',
    labResults: [
      { test: 'Hemoglobin (Hb)', result: '10.2 g/dL', normalRange: '12.0 - 15.5 g/dL', flag: 'Low' },
      { test: 'Packed Cell Volume (PCV)', result: '32.1 %', normalRange: '36.0 - 46.0 %', flag: 'Low' },
      { test: 'Serum Ferritin', result: '14 ng/mL', normalRange: '20 - 200 ng/mL', flag: 'Low' }
    ]
  }
];
