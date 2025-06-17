import React, { useState } from 'react';
import type { Student } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phoneNumber: student?.phoneNumber || '',
    codeforcesHandle: student?.codeforcesHandle || '',
    emailRemindersEnabled: student?.emailRemindersEnabled ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.codeforcesHandle.trim()) {
      newErrors.codeforcesHandle = 'Codeforces handle is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <Input
        label="Full Name"
        required
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter student's full name"
      />

      <Input
        label="Email Address"
        type="email"
        required
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        placeholder="student@example.com"
      />

      <Input
        label="Phone Number"
        type="tel"
        required
        value={formData.phoneNumber}
        onChange={(e) => handleChange('phoneNumber', e.target.value)}
        error={errors.phoneNumber}
        placeholder="+1 (555) 123-4567"
      />

      <Input
        label="Codeforces Handle"
        required
        value={formData.codeforcesHandle}
        onChange={(e) => handleChange('codeforcesHandle', e.target.value)}
        error={errors.codeforcesHandle}
        placeholder="codeforces_username"
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="emailReminders"
          checked={formData.emailRemindersEnabled}
          onChange={(e) => handleChange('emailRemindersEnabled', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label htmlFor="emailReminders" className="text-sm text-gray-700 dark:text-gray-300">
          Enable email reminders for inactivity
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;