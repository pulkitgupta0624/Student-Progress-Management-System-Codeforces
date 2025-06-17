import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studentApi } from '../services/api';
import type { FilterPeriod, StudentAnalytics } from '../types';
import Card from './ui/Card';
import SubmissionHeatmap from './SubmissionHeatmap';

interface ProblemSolvingDataProps {
  studentId: string;
  period: FilterPeriod;
}

const ProblemSolvingData: React.FC<ProblemSolvingDataProps> = ({ studentId, period }) => {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [studentId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getCodeforcesData(studentId, period);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No data available for the selected period.
        </p>
      </div>
    );
  }

  // Prepare data for rating distribution chart
  const ratingBucketData = Object.entries(analytics.ratingBuckets)
    .map(([rating, count]) => ({
      rating: `${rating}-${parseInt(rating) + 99}`,
      count,
      ratingValue: parseInt(rating)
    }))
    .sort((a, b) => a.ratingValue - b.ratingValue);

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string }> = ({
    title,
    value,
    subtitle
  }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h4>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Problems Solved"
          value={analytics.totalProblems}
        />
        <StatCard
          title="Average Problems/Day"
          value={analytics.avgProblemsPerDay}
        />
        <StatCard
          title="Average Rating"
          value={analytics.avgRating || 'N/A'}
        />
        <StatCard
          title="Hardest Problem"
          value={analytics.maxDifficulty || 'N/A'}
          subtitle="Rating"
        />
      </div>

      {/* Rating Distribution Chart */}
      {ratingBucketData.length > 0 && (
        <Card>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Problems Solved by Rating Range
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingBucketData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="rating" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Rating Range: {label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Problems: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Submission Heatmap */}
      <Card>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Submission Activity Heatmap
        </h4>
        <SubmissionHeatmap submissions={analytics.submissions} period={period} />
      </Card>

      {/* Recent Submissions */}
      {analytics.submissions.length > 0 && (
        <Card>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Successful Submissions
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.submissions
                  .slice(0, 10) // Show only recent 10 submissions
                  .map((submission, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {submission.problem.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {submission.problem.contestId}{submission.problem.index}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${
                          submission.problem.rating 
                            ? submission.problem.rating < 1200 ? 'text-gray-600'
                            : submission.problem.rating < 1400 ? 'text-green-600'
                            : submission.problem.rating < 1600 ? 'text-cyan-600'
                            : submission.problem.rating < 1900 ? 'text-blue-600'
                            : submission.problem.rating < 2100 ? 'text-purple-600'
                            : submission.problem.rating < 2300 ? 'text-yellow-600'
                            : submission.problem.rating < 2400 ? 'text-orange-600'
                            : 'text-red-600'
                            : 'text-gray-500'
                        }`}>
                          {submission.problem.rating || 'Unrated'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {submission.programmingLanguage}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {Math.round(submission.timeConsumedMillis / 1000)}s
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(submission.creationTimeSeconds * 1000).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProblemSolvingData;