import { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import type { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getAll();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      const newStudent = await studentApi.create(studentData);
      setStudents(prev => [newStudent, ...prev]);
      return newStudent;
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
      throw err;
    }
  };

  const updateStudent = async (id: string, studentData: any) => {
    try {
      const updatedStudent = await studentApi.update(id, studentData);
      setStudents(prev => 
        prev.map(student => 
          student._id === id ? updatedStudent : student
        )
      );
      return updatedStudent;
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await studentApi.delete(id);
      setStudents(prev => prev.filter(student => student._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
      throw err;
    }
  };

  const syncStudent = async (id: string) => {
    try {
      await studentApi.syncData(id);
      await fetchStudents(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to sync student data');
      throw err;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    syncStudent
  };
};