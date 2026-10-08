import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { DoctorDashboard } from './dashboard/DoctorDashboard';
import { PatientDashboard } from './dashboard/PatientDashboard';

export const Dashboard: React.FC = () => {
  const { role } = useAuth();

  if (role === 'doctor') {
    return <DoctorDashboard />;
  }

  if (role === 'patient') {
    return <PatientDashboard />;
  }

  return <AdminDashboard />;
};

export default Dashboard;
