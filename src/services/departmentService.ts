import { Department } from '../types';
import { apiRequest } from './api';

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    return apiRequest<Department[]>('/departments');
  },
};

export default departmentService;
