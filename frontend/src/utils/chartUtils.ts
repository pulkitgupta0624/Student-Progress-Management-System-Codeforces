export const getRatingColor = (rating: number) => {
  if (rating === 0) return '#6B7280'; // gray-500
  if (rating < 1200) return '#6B7280'; // gray-600
  if (rating < 1400) return '#059669'; // emerald-600
  if (rating < 1600) return '#0891B2'; // cyan-600
  if (rating < 1900) return '#2563EB'; // blue-600
  if (rating < 2100) return '#7C3AED'; // violet-600
  if (rating < 2300) return '#CA8A04'; // yellow-600
  if (rating < 2400) return '#EA580C'; // orange-600
  return '#DC2626'; // red-600
};

export const getRatingTitle = (rating: number) => {
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

export const formatChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    [xKey]: item[xKey],
    [yKey]: item[yKey],
    ...item
  }));
};