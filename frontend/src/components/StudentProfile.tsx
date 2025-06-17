import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Mail, 
  MailX, 
  ExternalLink, 
  Award,
  Target,
  TrendingUp,
  Calendar,
  Code,
  Trophy,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { studentApi } from '../services/api';
import type { StudentCodeforcesResponse, FilterPeriod } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import ContestHistory from './ContestHistory';
import ProblemSolvingData from './ProblemSolvingData';

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<StudentCodeforcesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [contestPeriod, setContestPeriod] = useState<FilterPeriod>(90);
    const [problemPeriod, setProblemPeriod] = useState<FilterPeriod>(30);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (id) {
            fetchStudentData();
        }
    }, [id]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
    };

    const fetchStudentData = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await studentApi.getCodeforcesData(id);
            setData(response);
        } catch (error) {
            console.error('Error fetching student data:', error);
            showNotification('error', 'Failed to load student data');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!id) return;

        try {
            setSyncing(true);
            await studentApi.syncData(id);
            await fetchStudentData();
            showNotification('success', 'Data synced successfully!');
        } catch (error) {
            console.error('Error syncing data:', error);
            showNotification('error', 'Failed to sync data');
        } finally {
            setSyncing(false);
        }
    };

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

    const getProgressPercentage = (current: number, max: number) => {
        if (max === 0) return 0;
        return Math.min((current / max) * 100, 100);
    };

    const getRatingChange = () => {
        if (!data?.codeforcesData.contests || data.codeforcesData.contests.length === 0) return null;
        const lastContest = data.codeforcesData.contests[data.codeforcesData.contests.length - 1];
        return lastContest.newRating - lastContest.oldRating;
    };

    if (loading) {
        return (
            <div className="space-y-6 fade-in">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="skeleton w-20 h-10"></div>
                        <div>
                            <div className="skeleton h-8 w-48 mb-2"></div>
                            <div className="skeleton h-4 w-32"></div>
                        </div>
                    </div>
                    <div className="skeleton w-24 h-10"></div>
                </div>

                {/* Profile Card Skeleton */}
                <Card>
                    <div className="flex items-center space-x-6">
                        <div className="skeleton w-24 h-24 rounded-full"></div>
                        <div className="flex-1 space-y-3">
                            <div className="skeleton h-6 w-32"></div>
                            <div className="skeleton h-4 w-48"></div>
                            <div className="skeleton h-4 w-40"></div>
                        </div>
                    </div>
                </Card>

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
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12 fade-in">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Student data not found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The student data could not be loaded or may not exist.
                </p>
                <Button onClick={() => navigate('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Students
                </Button>
            </div>
        );
    }

    const { student, codeforcesData } = data;
    const ratingChange = getRatingChange();

    return (
        <div className="space-y-6 fade-in">
            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    <p className="font-medium">{notification.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between fade-in-up">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="hover-scale"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">
                            {student.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Codeforces Progress Report
                        </p>
                    </div>
                </div>

                <Button onClick={handleSync} disabled={syncing} className="ripple">
                    {syncing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync Data
                </Button>
            </div>

            {/* Student Profile Card */}
            <Card className="fade-in-up">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Profile Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            {student.currentRating > 0 && (
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                                    <Award className={`w-5 h-5 ${getRatingColor(student.currentRating)}`} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Contact Information
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-900 dark:text-white flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    {student.email}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {student.phoneNumber}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Codeforces Handle
                            </h3>
                            <div className="flex items-center space-x-2">
                                <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                                    {student.codeforcesHandle}
                                </code>
                                <a
                                    href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors hover-scale"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Current Rating
                            </h3>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <p className={`text-2xl font-bold ${getRatingColor(student.currentRating)}`}>
                                        {student.currentRating || 'Unrated'}
                                    </p>
                                    {ratingChange && (
                                        <span className={`text-sm font-medium ${ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {ratingChange >= 0 ? '+' : ''}{ratingChange}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {getRatingTitle(student.currentRating)}
                                </p>
                                {student.maxRating > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Progress to Max</span>
                                            <span>{student.maxRating}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ '--progress-width': `${getProgressPercentage(student.currentRating, student.maxRating)}%` } as React.CSSProperties}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Status & Activity
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    {student.emailRemindersEnabled ? (
                                        <div className="status-indicator status-active">
                                            <Mail className="w-3 h-3 mr-1" />
                                            Reminders On
                                        </div>
                                    ) : (
                                        <div className="status-indicator status-inactive">
                                            <MailX className="w-3 h-3 mr-1" />
                                            Reminders Off
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {student.reminderCount} reminders sent
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Updated: {format(new Date(student.lastUpdated), 'MMM d, yyyy HH:mm')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 fade-in-up">
                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contests</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {codeforcesData.contests?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submissions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {codeforcesData.submissions?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Rating</p>
                            <p className={`text-2xl font-bold ${getRatingColor(student.maxRating)}`}>
                                {student.maxRating || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {format(new Date(codeforcesData.lastSyncTime), 'MMM d, HH:mm')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contest History */}
            <Card className="fade-in-up">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Contest History
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Rating progression over time
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {[30, 90, 365].map((days) => (
                                <Button
                                    key={days}
                                    size="sm"
                                    variant={contestPeriod === days ? 'primary' : 'secondary'}
                                    onClick={() => setContestPeriod(days as FilterPeriod)}
                                    className="hover-scale"
                                >
                                    {days} days
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <ContestHistory
                        contests={codeforcesData.contests || []}
                        period={contestPeriod}
                    />
                </div>
            </Card>

            {/* Problem Solving Data */}
            <Card className="fade-in-up">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Problem Solving Analytics
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Detailed performance insights
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {[7, 30, 90].map((days) => (
                                <Button
                                    key={days}
                                    size="sm"
                                    variant={problemPeriod === days ? 'primary' : 'secondary'}
                                    onClick={() => setProblemPeriod(days as FilterPeriod)}
                                    className="hover-scale"
                                >
                                    {days} days
                                </Button>
                            ))}
                        </div>
                    </div>
                    <ProblemSolvingData
                        studentId={student._id}
                        period={problemPeriod}
                    />
                </div>
            </Card>
        </div>
    );
};

export default StudentProfile;