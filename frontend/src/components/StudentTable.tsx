import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Eye, 
  Mail,
  MailX,
  Search,
  Filter,
  TrendingUp,
  Award,
  Users,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { studentApi } from '../services/api';
import type { Student } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Card from './ui/Card';
import StudentForm from './StudentForm';

const StudentTable: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: any) => {
    try {
      await studentApi.create(studentData);
      setShowAddModal(false);
      fetchStudents();
      showNotification('success', 'Student added successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  };

  const handleEditStudent = async (studentData: any) => {
    if (!editingStudent) return;
    
    try {
      await studentApi.update(editingStudent._id, studentData);
      setEditingStudent(null);
      fetchStudents();
      showNotification('success', 'Student updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudent) return;
    
    try {
      await studentApi.delete(deleteStudent._id);
      setDeleteStudent(null);
      fetchStudents();
      showNotification('success', 'Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      showNotification('error', 'Failed to delete student');
    }
  };

  const handleSyncStudent = async (studentId: string) => {
    try {
      setSyncingId(studentId);
      await studentApi.syncData(studentId);
      fetchStudents();
      showNotification('success', 'Student data synced successfully!');
    } catch (error) {
      console.error('Error syncing student:', error);
      showNotification('error', 'Failed to sync student data');
    } finally {
      setSyncingId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await studentApi.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `students_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification('success', 'CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showNotification('error', 'Failed to export CSV');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating: number) => {
    if (rating === 0) return 'rating-unrated';
    if (rating < 1200) return 'rating-newbie';
    if (rating < 1400) return 'rating-pupil';
    if (rating < 1600) return 'rating-specialist';
    if (rating < 1900) return 'rating-expert';
    if (rating < 2100) return 'rating-candidate-master';
    if (rating < 2300) return 'rating-master';
    if (rating < 2400) return 'rating-international-master';
    return 'rating-grandmaster';
  };

  const getRatingTitle = (rating: number) => {
    if (rating === 0) return 'Unrated';
    if (rating < 1200) return 'Newbie';
    if (rating < 1400) return 'Pupil';
    if (rating < 1600) return 'Specialist';
    if (rating < 1900) return 'Expert';
    if (rating < 2100) return 'Candidate Master';
    if (rating < 2300) return 'Master';
    if (rating < 2400) return 'International Master';
    return 'Grandmaster';
  };

  const getAchievementBadge = (rating: number) => {
    if (rating >= 2400) return 'achievement-gold';
    if (rating >= 1900) return 'achievement-silver';
    if (rating >= 1400) return 'achievement-bronze';
    return '';
  };

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.emailRemindersEnabled).length;
  const avgRating = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.currentRating, 0) / students.length)
    : 0;
  const topRating = students.length > 0 
    ? Math.max(...students.map(s => s.maxRating))
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="skeleton h-8 w-32 mb-2"></div>
            <div className="skeleton h-4 w-64"></div>
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-10 w-24"></div>
            <div className="skeleton h-10 w-32"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-4 w-20 mb-2"></div>
              <div className="skeleton h-8 w-16 mb-1"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card padding={false}>
          <div className="p-6">
            <div className="skeleton h-10 w-full mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="skeleton-avatar"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/4"></div>
                    <div className="skeleton h-3 w-1/3"></div>
                  </div>
                  <div className="skeleton h-8 w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in-up">
        <div>
          <h2 className="text-3xl font-bold gradient-text">
            Student Progress Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage student Codeforces performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportCSV} variant="secondary" size="sm" className="ripple">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="ripple">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 fade-in-up">
        <div className="stat-card hover-scale">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="stat-card hover-scale">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeStudents}</p>
            </div>
          </div>
        </div>

        <div className="stat-card hover-scale">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(avgRating)}`}>{avgRating}</p>
            </div>
          </div>
        </div>

        <div className="stat-card hover-scale">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Highest Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(topRating)}`}>{topRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="fade-in-up">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search students by name, email, or handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button variant="secondary" size="sm" className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Students Table */}
      <Card padding={false} className="fade-in-up overflow-hidden">
        <div className="overflow-x-auto">
          <table className="enhanced-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Codeforces</th>
                <th>Rating</th>
                <th>Progress</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student._id} className="table-row" style={{ animationDelay: `${index * 0.1}s` }}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        {getAchievementBadge(student.maxRating) && (
                          <div className={`achievement-badge ${getAchievementBadge(student.maxRating)} mt-1`}>
                            <Award className="w-3 h-3 mr-1" />
                            {getRatingTitle(student.maxRating)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.phoneNumber}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                        {student.codeforcesHandle}
                      </code>
                      <a
                        href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className={`text-sm font-bold ${getRatingColor(student.currentRating)}`}>
                      {student.currentRating || 'Unrated'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Max: {student.maxRating || 'N/A'}
                    </div>
                    <div className="progress-bar mt-1">
                      <div 
                        className="progress-fill" 
                        style={{ '--progress-width': `${Math.min((student.currentRating / 3000) * 100, 100)}%` } as React.CSSProperties}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${student.currentRating > 0 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {student.currentRating > 0 ? 'Active' : 'No Rating'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(student.lastUpdated), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(student.lastUpdated), 'HH:mm')}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {student.emailRemindersEnabled ? (
                        <div className="status-indicator status-active">
                          <Mail className="w-3 h-3 mr-1" />
                          Active
                        </div>
                      ) : (
                        <div className="status-indicator status-inactive">
                          <MailX className="w-3 h-3 mr-1" />
                          Inactive
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {student.reminderCount} reminders
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/student/${student._id}`)}
                        className="hover-scale"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSyncStudent(student._id)}
                        disabled={syncingId === student._id}
                        className="hover-scale"
                      >
                        {syncingId === student._id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingStudent(student)}
                        className="hover-scale"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteStudent(student)}
                        className="hover-scale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No students found' : 'No students yet'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'Add your first student to get started!'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddModal(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        size="md"
      >
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Edit Student"
        size="md"
      >
        {editingStudent && (
          <StudentForm
            student={editingStudent}
            onSubmit={handleEditStudent}
            onCancel={() => setEditingStudent(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteStudent}
        onClose={() => setDeleteStudent(null)}
        title="Delete Student"
        size="sm"
      >
        {deleteStudent && (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteStudent.name}</strong>? 
              All associated data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteStudent(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteStudent}
                className="ripple"
              >
                Delete Student
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden">
        <button 
          onClick={() => setShowAddModal(true)}
          className="fab"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default StudentTable;