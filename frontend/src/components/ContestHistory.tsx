import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Award, Target, Calendar, Trophy } from 'lucide-react';
import type { CodeforcesContest, FilterPeriod } from '../types';

interface ContestHistoryProps {
    contests: CodeforcesContest[];
    period: FilterPeriod;
}

const ContestHistory: React.FC<ContestHistoryProps> = ({ contests, period }) => {
    const [chartType, setChartType] = useState<'line' | 'area'>('area');
    const [hoveredContest, setHoveredContest] = useState<any>(null);

    const filteredContests = useMemo(() => {
        if (!contests || contests.length === 0) {
            console.log('No contests data available');
            return [];
        }

        const cutoffTime = Date.now() - (period * 24 * 60 * 60 * 1000);
        const filtered = contests
            .filter(contest => contest.ratingUpdateTimeSeconds * 1000 >= cutoffTime)
            .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);

        console.log(`Filtered contests: ${filtered.length} out of ${contests.length}`);
        return filtered;
    }, [contests, period]);

    const analytics = useMemo(() => {
        if (filteredContests.length === 0) {
            return {
                totalContests: 0,
                averageRank: 0,
                bestRank: 0,
                ratingChange: 0,
                winRate: 0,
                improvement: 0
            };
        }

        const totalContests = filteredContests.length;
        const averageRank = Math.round(filteredContests.reduce((sum, c) => sum + c.rank, 0) / totalContests);
        const bestRank = Math.min(...filteredContests.map(c => c.rank));
        const firstRating = filteredContests[0].oldRating;
        const lastRating = filteredContests[filteredContests.length - 1].newRating;
        const ratingChange = lastRating - firstRating;
        const positiveChanges = filteredContests.filter(c => c.newRating > c.oldRating).length;
        const winRate = Math.round((positiveChanges / totalContests) * 100);
        
        // Calculate trend (improvement over time)
        const halfIndex = Math.floor(totalContests / 2);
        const firstHalf = filteredContests.slice(0, halfIndex);
        const secondHalf = filteredContests.slice(halfIndex);
        const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, c) => sum + c.newRating, 0) / firstHalf.length : 0;
        const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, c) => sum + c.newRating, 0) / secondHalf.length : 0;
        const improvement = secondHalfAvg - firstHalfAvg;

        return {
            totalContests,
            averageRank,
            bestRank,
            ratingChange,
            winRate,
            improvement
        };
    }, [filteredContests]);

    if (!contests || contests.length === 0) {
        return (
            <div className="text-center py-12 fade-in">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Contest History
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    This user hasn't participated in any rated contests yet.
                </p>
            </div>
        );
    }

    if (filteredContests.length === 0) {
        return (
            <div className="text-center py-12 fade-in">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Recent Contests
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No contest participation in the last {period} days.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    Total contests participated: {contests.length}
                </p>
            </div>
        );
    }

    const chartData = useMemo(() => {
        return filteredContests.map((contest, index) => ({
            date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd'),
            fullDate: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd, yyyy'),
            rating: contest.newRating,
            oldRating: contest.oldRating,
            contest: contest.contestName,
            rank: contest.rank,
            change: contest.newRating - contest.oldRating,
            contestIndex: index
        }));
    }, [filteredContests]);

    const getRatingColor = (rating: number) => {
        if (rating < 1200) return '#6B7280';
        if (rating < 1400) return '#059669';
        if (rating < 1600) return '#0891B2';
        if (rating < 1900) return '#2563EB';
        if (rating < 2100) return '#7C3AED';
        if (rating < 2300) return '#CA8A04';
        if (rating < 2400) return '#EA580C';
        return '#DC2626';
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-sm">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{data.contest}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{data.fullDate}</p>
                    
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Rating:</span>
                            <span className="font-medium" style={{ color: getRatingColor(data.rating) }}>
                                {data.rating}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Rank:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{data.rank}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Change:</span>
                            <div className="flex items-center space-x-1">
                                {data.change >= 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`font-medium ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.change >= 0 ? '+' : ''}{data.change}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <Trophy className="w-5 h-5 text-blue-500 mr-2" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Contests</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.totalContests}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <Target className="w-5 h-5 text-purple-500 mr-2" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rank</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.averageRank}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <Award className="w-5 h-5 text-yellow-500 mr-2" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Best Rank</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.bestRank}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        {analytics.ratingChange >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rating Δ</p>
                            <p className={`text-lg font-bold ${analytics.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {analytics.ratingChange >= 0 ? '+' : ''}{analytics.ratingChange}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.winRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card hover-scale">
                    <div className="flex items-center">
                        {analytics.improvement >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-orange-500 mr-2" />
                        )}
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Trend</p>
                            <p className={`text-lg font-bold ${analytics.improvement >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {analytics.improvement >= 0 ? '+' : ''}{Math.round(analytics.improvement)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Controls */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rating Progress</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                            chartType === 'line' 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        Line
                    </button>
                    <button
                        onClick={() => setChartType('area')}
                        className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                            chartType === 'area' 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        Area
                    </button>
                </div>
            </div>

            {/* Rating Chart */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 chart-container">
                <div className="h-80 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'area' ? (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey="date"
                                    className="text-xs"
                                    tick={{ fontSize: 12, fill: 'currentColor' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fontSize: 12, fill: 'currentColor' }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="rating"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fill="url(#ratingGradient)"
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 3, fill: '#ffffff' }}
                                />
                            </AreaChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey="date"
                                    className="text-xs"
                                    tick={{ fontSize: 12, fill: 'currentColor' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fontSize: 12, fill: 'currentColor' }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="rating"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 3, fill: '#ffffff' }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Contest List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contest Details</h4>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Contest
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Rating Change
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    New Rating
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredContests.map((contest, index) => {
                                const ratingChange = contest.newRating - contest.oldRating;
                                return (
                                    <tr 
                                        key={index} 
                                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 cursor-pointer"
                                        onMouseEnter={() => setHoveredContest(contest)}
                                        onMouseLeave={() => setHoveredContest(null)}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {contest.contestName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {contest.rank}
                                                </span>
                                                {contest.rank <= 10 && (
                                                    <Award className="w-4 h-4 text-yellow-500 ml-2" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                {ratingChange >= 0 ? (
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                                )}
                                                <span className={`text-sm font-medium ${
                                                    ratingChange >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {ratingChange >= 0 ? '+' : ''}{ratingChange}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className="text-sm font-bold"
                                                style={{ color: getRatingColor(contest.newRating) }}
                                            >
                                                {contest.newRating}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContestHistory;