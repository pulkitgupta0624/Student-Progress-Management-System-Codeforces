import { useState, useCallback } from 'react';
import { studentApi } from '../services/api';
import type { StudentCodeforcesResponse } from '../types';

export const useCodeforces = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStudentData = useCallback(async (studentId: string, days?: number): Promise<StudentCodeforcesResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getCodeforcesData(studentId, days);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Codeforces data');
      console.error('Error fetching Codeforces data:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncStudentData = useCallback(async (studentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await studentApi.syncData(studentId);
    } catch (err: any) {
      setError(err.message || 'Failed to sync student data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getStudentData,
    syncStudentData
  };
};