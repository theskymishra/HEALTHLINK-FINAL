import { Department } from '../types';

export const initialDepartments: Department[] = [
  {
    id: 'DEP-01',
    name: 'Cardiology',
    headOfDepartment: 'Dr. Rahul Sharma',
    doctorCount: 12,
    todayAppointments: 9,
    totalBeds: 45,
    occupiedBeds: 38,
    iconName: 'HeartPulse'
  },
  {
    id: 'DEP-02',
    name: 'General Medicine',
    headOfDepartment: 'Dr. Shalini Mukherjee',
    doctorCount: 15,
    todayAppointments: 11,
    totalBeds: 60,
    occupiedBeds: 44,
    iconName: 'Stethoscope'
  },
  {
    id: 'DEP-03',
    name: 'Orthopedics',
    headOfDepartment: 'Dr. Vikramaditya Rao',
    doctorCount: 8,
    todayAppointments: 5,
    totalBeds: 30,
    occupiedBeds: 22,
    iconName: 'Bone'
  },
  {
    id: 'DEP-04',
    name: 'Pediatrics',
    headOfDepartment: 'Dr. Meera Nambiar',
    doctorCount: 7,
    todayAppointments: 4,
    totalBeds: 25,
    occupiedBeds: 18,
    iconName: 'Baby'
  },
  {
    id: 'DEP-05',
    name: 'Neurology',
    headOfDepartment: 'Dr. Farhan Rizvi',
    doctorCount: 6,
    todayAppointments: 3,
    totalBeds: 20,
    occupiedBeds: 14,
    iconName: 'Brain'
  }
];
