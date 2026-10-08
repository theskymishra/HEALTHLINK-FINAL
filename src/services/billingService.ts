import { Invoice } from '../types';
import { apiRequest } from './api';

export const billingService = {
  getAll: async (): Promise<Invoice[]> => {
    return apiRequest<Invoice[]>('/billing');
  },

  getByPatientId: async (patientId: string): Promise<Invoice[]> => {
    return apiRequest<Invoice[]>(`/billing/patient/${patientId}`);
  },

  getById: async (id: string): Promise<Invoice | undefined> => {
    try {
      return await apiRequest<Invoice>(`/billing/${id}`);
    } catch {
      return undefined;
    }
  },

  create: async (newInvoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    return apiRequest<Invoice>('/billing', {
      method: 'POST',
      body: JSON.stringify(newInvoice),
    });
  },

  updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
    return apiRequest<Invoice>(`/billing/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/billing/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  getStats: async (): Promise<{ totalRevenue: number; paid: number; pending: number; overdue: number }> => {
    return apiRequest<{ totalRevenue: number; paid: number; pending: number; overdue: number }>('/billing/stats');
  },
};

export default billingService;
