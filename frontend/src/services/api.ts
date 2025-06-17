import axios from 'axios';
import type { Student, StudentCodeforcesResponse, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const studentApi = {
  // Get all students
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/students');
    return response.data;
  },

  // Get student by ID
  getById: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create new student
  create: async (studentData: Omit<Student, '_id' | 'createdAt' | 'updatedAt' | 'currentRating' | 'maxRating' | 'lastUpdated' | 'reminderCount' | 'isActive'>): Promise<Student> => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  // Update student
  update: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  // Delete student
  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  // Get student's Codeforces data
  getCodeforcesData: async (id: string, days?: number): Promise<StudentCodeforcesResponse> => {
    const params = days ? { days } : {};
    const response = await api.get(`/students/${id}/codeforces`, { params });
    return response.data;
  },

  // Manual sync student data
  syncData: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/students/${id}/sync`);
    return response.data;
  },

  // Export students as CSV
  exportCSV: async (): Promise<Blob> => {
    const response = await api.get('/students/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const settingsApi = {
  // Get settings
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update cron schedule
  updateSchedule: async (schedule: string) => {
    const response = await api.put('/settings/cron', { schedule });
    return response.data;
  },

  // Manual sync all students
  manualSync: async () => {
    const response = await api.post('/settings/sync');
    return response.data;
  },
};

export default api;