import { MedicalRecord } from '../types';
import { apiRequest } from './api';

export const medicalRecordService = {
  getAll: async (): Promise<MedicalRecord[]> => {
    return apiRequest<MedicalRecord[]>('/medical-records');
  },

  getByPatientId: async (patientId: string): Promise<MedicalRecord[]> => {
    return apiRequest<MedicalRecord[]>(`/medical-records/patient/${patientId}`);
  },

  getById: async (id: string): Promise<MedicalRecord | undefined> => {
    try {
      return await apiRequest<MedicalRecord>(`/medical-records/${id}`);
    } catch {
      return undefined;
    }
  },

  create: async (newRecord: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
    return apiRequest<MedicalRecord>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(newRecord),
    });
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/medical-records/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

export default medicalRecordService;
