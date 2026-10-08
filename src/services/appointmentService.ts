import { Appointment } from '../types';
import { apiRequest } from './api';

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>('/appointments');
  },

  getToday: async (): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>('/appointments/today');
  },

  getByPatientId: async (patientId: string): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>(`/appointments/patient/${patientId}`);
  },

  getByDoctorId: async (doctorId: string): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>(`/appointments/doctor/${doctorId}`);
  },

  create: async (newApt: Omit<Appointment, 'id' | 'tokenNumber'>): Promise<Appointment> => {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(newApt),
    });
  },

  updateStatus: async (id: string, status: Appointment['status']): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/appointments/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

export default appointmentService;
