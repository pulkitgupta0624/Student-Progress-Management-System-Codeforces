import React, { useMemo, useState } from 'react';
import { format, startOfDay, eachDayOfInterval, subDays, getDay} from 'date-fns';
import type { CodeforcesSubmission, FilterPeriod } from '../types';

interface SubmissionHeatmapProps {
  submissions: CodeforcesSubmission[];
  period: FilterPeriod;
}

const SubmissionHeatmap: React.FC<SubmissionHeatmapProps> = ({ submissions, period }) => {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; submissions: CodeforcesSubmission[]; dateString: string; fullDate: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heatmapData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, period - 1);
    
    // Create array of all days in the period
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Group submissions by day
    const submissionsByDay = new Map<string, CodeforcesSubmission[]>();
    
    submissions.forEach(submission => {
      const date = startOfDay(new Date(submission.creationTimeSeconds * 1000));
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!submissionsByDay.has(dateKey)) {
        submissionsByDay.set(dateKey, []);
      }
      submissionsByDay.get(dateKey)!.push(submission);
    });
    
    // Create heatmap data with full day information
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const daySubmissions = submissionsByDay.get(dateKey) || [];
      const count = daySubmissions.length;
      const dayOfWeek = getDay(day);
      
      return {
        date: day,
        count,
        submissions: daySubmissions,
        dateString: dateKey,
        displayDate: format(day, 'MMM d'),
        fullDate: format(day, 'EEEE, MMMM d, yyyy'),
        dayOfWeek,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      };
    });
  }, [submissions, period]);

  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);
  const totalSubmissions = heatmapData.reduce((sum, d) => sum + d.count, 0);
  const averageDaily = totalSubmissions / period;
  const streakData = calculateStreak(heatmapData);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    
    const intensity = count / maxCount;
    
    if (intensity <= 0.2) return 'bg-green-200 dark:bg-green-900/40 border border-green-300 dark:border-green-800';
    if (intensity <= 0.4) return 'bg-green-300 dark:bg-green-800/60 border border-green-400 dark:border-green-700';
    if (intensity <= 0.6) return 'bg-green-400 dark:bg-green-700/80 border border-green-500 dark:border-green-600';
    if (intensity <= 0.8) return 'bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-500';
    return 'bg-green-600 dark:bg-green-500 border border-green-700 dark:border-green-400 shadow-lg';
  };

  const getGridLayout = () => {
    if (period <= 7) return { cols: 7, gap: 'gap-2' };
    if (period <= 30) return { cols: Math.ceil(period / 5), gap: 'gap-1' };
    return { cols: Math.ceil(period / 7), gap: 'gap-1' };
  };

  const layout = getGridLayout();

  const handleMouseEnter = (cell: any, event: React.MouseEvent) => {
    setHoveredCell(cell);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 p-4 rounded-xl">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Submissions</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalSubmissions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-4 rounded-xl">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Daily Average</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">{averageDaily.toFixed(1)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 p-4 rounded-xl">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Current Streak</p>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{streakData.current} days</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 p-4 rounded-xl">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Best Streak</p>
          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{streakData.best} days</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Less</span>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40 border border-green-300 dark:border-green-800"></div>
            <div className="w-4 h-4 rounded bg-green-300 dark:bg-green-800/60 border border-green-400 dark:border-green-700"></div>
            <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700/80 border border-green-500 dark:border-green-600"></div>
            <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-500"></div>
            <div className="w-4 h-4 rounded bg-green-600 dark:bg-green-500 border border-green-700 dark:border-green-400"></div>
          </div>
          <span className="text-gray-600 dark:text-gray-400 ml-2">More</span>
        </div>
        <span className="text-gray-600 dark:text-gray-400">More</span>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        <div 
          className={`grid grid-cols-${layout.cols} ${layout.gap} justify-items-center`}
          style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
        >
          {heatmapData.map((day, index) => (
            <div
              key={index}
              className={`
                heatmap-cell w-4 h-4 rounded-sm transition-all duration-300 cursor-pointer
                ${getIntensityClass(day.count)}
                ${day.isWeekend ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''}
                hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500 hover:z-10
              `}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                animationDelay: `${index * 0.01}s`,
                transform: hoveredCell?.dateString === day.dateString ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 p-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-xl pointer-events-none transition-all duration-200 border border-gray-700"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="space-y-1">
              <p className="font-semibold">{hoveredCell.fullDate}</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-sm ${getIntensityClass(hoveredCell.count)}`}></div>
                <span>{hoveredCell.count} submission{hoveredCell.count !== 1 ? 's' : ''}</span>
              </div>
              {hoveredCell.submissions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-300 mb-1">Recent submissions:</p>
                  {hoveredCell.submissions.slice(0, 3).map((sub, idx) => (
                    <div key={idx} className="text-xs text-gray-300">
                      • {sub.problem.name} ({sub.verdict})
                    </div>
                  ))}
                  {hoveredCell.submissions.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{hoveredCell.submissions.length - 3} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Month labels for longer periods */}
      {period > 30 && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
          {getMonthLabels(heatmapData).map((month, index) => (
            <span key={index}>{month}</span>
          ))}
        </div>
      )}

      {/* Activity Pattern Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Weekly Pattern</h4>
          <div className="space-y-1">
            {getWeeklyPattern(heatmapData).map((day, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{day.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(day.average / Math.max(...getWeeklyPattern(heatmapData).map(d => d.average))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium w-8">{day.average.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Activity Insights</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Most active: {getMostActiveDay(heatmapData)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                {getActivityLevel(averageDaily)} activity level
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                {getConsistencyRating(heatmapData)} consistency
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateStreak(data: any[]) {
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Calculate from most recent day backwards
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) {
      tempStreak++;
      if (i === data.length - 1 || currentStreak === 0) {
        currentStreak = tempStreak;
      }
    } else {
      if (currentStreak === 0) {
        currentStreak = 0;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  bestStreak = Math.max(bestStreak, tempStreak);
  
  return { current: currentStreak, best: bestStreak };
}

function getMonthLabels(data: any[]) {
  const months: string[] = [];
  let lastMonth = '';
  
  data.forEach(day => {
    const month = format(day.date, 'MMM');
    if (month !== lastMonth) {
      months.push(month);
      lastMonth = month;
    }
  });
  
  return months;
}

function getWeeklyPattern(data: any[]) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayTotals = new Array(7).fill(0);
  const dayCounts = new Array(7).fill(0);
  
  data.forEach(day => {
    dayTotals[day.dayOfWeek] += day.count;
    dayCounts[day.dayOfWeek]++;
  });
  
  return dayNames.map((name, index) => ({
    name,
    average: dayCounts[index] > 0 ? dayTotals[index] / dayCounts[index] : 0
  }));
}

function getMostActiveDay(data: any[]) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pattern = getWeeklyPattern(data);
  const maxDay = pattern.reduce((max, day, index) => 
    day.average > pattern[max].average ? index : max, 0
  );
  return dayNames[maxDay];
}

function getActivityLevel(average: number) {
  if (average >= 3) return 'High';
  if (average >= 1.5) return 'Medium';
  if (average >= 0.5) return 'Low';
  return 'Very low';
}

function getConsistencyRating(data: any[]) {
  const activeDays = data.filter(d => d.count > 0).length;
  const consistency = activeDays / data.length;
  
  if (consistency >= 0.8) return 'Excellent';
  if (consistency >= 0.6) return 'Good';
  if (consistency >= 0.4) return 'Fair';
  return 'Needs improvement';
}

export default SubmissionHeatmap;