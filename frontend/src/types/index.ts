export interface Student {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastUpdated: string;
  emailRemindersEnabled: boolean;
  reminderCount: number;
  lastReminderSent?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CodeforcesSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
  };
  author: {
    contestId?: number;
    members: Array<{ handle: string }>;
    participantType: string;
    ghost: boolean;
    startTimeSeconds?: number;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export interface CodeforcesContest {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export interface CodeforcesUserInfo {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar?: string;
  titlePhoto?: string;
}

export interface CodeforcesData {
  _id: string;
  studentId: string;
  handle: string;
  submissions: CodeforcesSubmission[];
  contests: CodeforcesContest[];
  userInfo: CodeforcesUserInfo;
  lastSyncTime: string;
}

export interface StudentAnalytics {
  totalProblems: number;
  avgProblemsPerDay: number;
  avgRating: number;
  maxDifficulty: number;
  ratingBuckets: Record<string, number>;
  submissions: CodeforcesSubmission[];
}

export interface StudentCodeforcesResponse {
  student: Student;
  codeforcesData: CodeforcesData;
  analytics: StudentAnalytics;
}

export type FilterPeriod = 7 | 30 | 90 | 365;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}