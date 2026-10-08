import { Doctor } from '../types';
import { apiRequest } from './api';

export const doctorService = {
  getAll: async (): Promise<Doctor[]> => {
    return apiRequest<Doctor[]>('/doctors');
  },

  getById: async (id: string): Promise<Doctor | undefined> => {
    try {
      return await apiRequest<Doctor>(`/doctors/${id}`);
    } catch {
      return undefined;
    }
  },

  create: async (newDoc: Omit<Doctor, 'id'>): Promise<Doctor> => {
    return apiRequest<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(newDoc),
    });
  },

  update: async (id: string, updates: Partial<Doctor>): Promise<Doctor> => {
    return apiRequest<Doctor>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/doctors/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

export default doctorService;
