import { Patient } from '../types';
import { apiRequest } from './api';

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    return apiRequest<Patient[]>('/patients');
  },

  getById: async (id: string): Promise<Patient | undefined> => {
    try {
      return await apiRequest<Patient>(`/patients/${id}`);
    } catch {
      return undefined;
    }
  },

  create: async (newPatient: Omit<Patient, 'id' | 'lastVisit'>): Promise<Patient> => {
    return apiRequest<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(newPatient),
    });
  },

  update: async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    return apiRequest<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/patients/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

export default patientService;
