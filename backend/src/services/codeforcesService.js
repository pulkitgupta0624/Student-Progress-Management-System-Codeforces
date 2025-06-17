const axios = require('axios');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');

class CodeforcesService {
  constructor() {
    this.baseURL = 'https://codeforces.com/api';
    this.requestDelay = 2100; // 2.1 seconds delay (API limit: 1 request per 2 seconds)
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchUserInfo(handle) {
    try {
      console.log(`🔍 Fetching user info for: ${handle}`);
      
      const response = await axios.get(`${this.baseURL}/user.info`, {
        params: { handles: handle },
        timeout: 15000
      });
      
      console.log(`📡 API Response:`, response.data);
      
      if (response.data.status === 'OK' && response.data.result && response.data.result.length > 0) {
        const userInfo = response.data.result[0];
        console.log(`✅ User found: ${userInfo.handle}, Rating: ${userInfo.rating || 'Unrated'}`);
        return userInfo;
      } else {
        throw new Error(`User "${handle}" not found on Codeforces`);
      }
    } catch (error) {
      if (error.response) {
        console.error(`❌ API Error ${error.response.status}:`, error.response.data);
        if (error.response.data && error.response.data.comment) {
          throw new Error(`Codeforces API: ${error.response.data.comment}`);
        }
      }
      console.error(`❌ Error fetching user info for ${handle}:`, error.message);
      throw new Error(`Failed to fetch data for "${handle}". Please check if the handle exists.`);
    }
  }

  async fetchUserRating(handle) {
    try {
      console.log(`📈 Fetching rating history for: ${handle}`);
      await this.delay(this.requestDelay);
      
      const response = await axios.get(`${this.baseURL}/user.rating`, {
        params: { handle: handle },
        timeout: 15000
      });
      
      if (response.data.status === 'OK') {
        const contests = response.data.result.map(contest => ({
          contestId: contest.contestId || 0,
          contestName: contest.contestName || 'Unknown Contest',
          handle: handle,
          rank: contest.rank || 0,
          ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds || 0,
          oldRating: contest.oldRating || 0,
          newRating: contest.newRating || 0
        }));
        console.log(`✅ Rating history found: ${contests.length} contests`);
        return contests;
      } else {
        console.log(`⚠️ No rating history found for ${handle}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching rating for ${handle}:`, error.message);
      return [];
    }
  }

  async fetchUserSubmissions(handle, count = 100) {
    try {
      console.log(`📝 Fetching submissions for: ${handle} (count: ${count})`);
      await this.delay(this.requestDelay);
      
      const response = await axios.get(`${this.baseURL}/user.status`, {
        params: { 
          handle: handle,
          from: 1,
          count: count
        },
        timeout: 20000
      });
      
      if (response.data.status === 'OK') {
        // Clean and sanitize submission data
        const submissions = response.data.result.map(sub => ({
          id: sub.id || 0,
          contestId: sub.contestId || null,
          creationTimeSeconds: sub.creationTimeSeconds || 0,
          relativeTimeSeconds: sub.relativeTimeSeconds || 0,
          problem: {
            contestId: sub.problem?.contestId || null,
            index: sub.problem?.index || '',
            name: sub.problem?.name || '',
            type: sub.problem?.type || 'PROGRAMMING',
            rating: sub.problem?.rating || null,
            tags: sub.problem?.tags || []
          },
          author: {
            contestId: sub.author?.contestId || null,
            members: sub.author?.members || [{ handle: handle }],
            participantType: sub.author?.participantType || 'PRACTICE',
            ghost: sub.author?.ghost || false,
            startTimeSeconds: sub.author?.startTimeSeconds || null
          },
          programmingLanguage: sub.programmingLanguage || '',
          verdict: sub.verdict || '',
          testset: sub.testset || 'TESTS',
          passedTestCount: sub.passedTestCount || 0,
          timeConsumedMillis: sub.timeConsumedMillis || 0,
          memoryConsumedBytes: sub.memoryConsumedBytes || 0
        }));
        
        console.log(`✅ Found ${submissions.length} submissions`);
        return submissions;
      } else {
        console.log(`⚠️ No submissions found for ${handle}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching submissions for ${handle}:`, error.message);
      return [];
    }
  }

  async syncStudentData(studentId, handle) {
    try {
      console.log(`🚀 Starting REAL Codeforces sync for student ${studentId} with handle: ${handle}`);
      
      // Step 1: Fetch user basic info (required)
      const userInfo = await this.fetchUserInfo(handle);
      
      // Step 2: Fetch rating history (optional)
      const contests = await this.fetchUserRating(handle);
      
      // Step 3: Fetch recent submissions (optional)
      const submissions = await this.fetchUserSubmissions(handle, 200); // Increased count for better analytics
      
      // Step 4: Store in database with error handling
      try {
        const codeforcesData = await CodeforcesData.findOneAndUpdate(
          { studentId: studentId },
          {
            handle: handle.toLowerCase(),
            userInfo: userInfo,
            submissions: submissions,
            contests: contests,
            lastSyncTime: new Date()
          },
          { 
            upsert: true, 
            new: true,
            runValidators: false // Skip validation to allow flexible data
          }
        );

        console.log(`💾 Data stored in database successfully`);

        // Step 5: Update student record
        await Student.findByIdAndUpdate(studentId, {
          currentRating: userInfo.rating || 0,
          maxRating: userInfo.maxRating || 0,
          lastUpdated: new Date()
        });

        console.log(`🎉 Successfully synced and STORED data for ${handle}:`);
        console.log(`   - Current Rating: ${userInfo.rating || 'Unrated'}`);
        console.log(`   - Max Rating: ${userInfo.maxRating || 'Unrated'}`);
        console.log(`   - Contests: ${contests.length}`);
        console.log(`   - Submissions: ${submissions.length}`);
        
        return codeforcesData;
      } catch (dbError) {
        console.error(`💥 Database error:`, dbError);
        throw new Error(`Failed to store data in database: ${dbError.message}`);
      }
    } catch (error) {
      console.error(`💥 Failed to sync data for ${handle}:`, error.message);
      throw error;
    }
  }

  async syncAllStudents() {
    try {
      console.log('🔄 Starting sync for all active students...');
      const students = await Student.find({ isActive: true });
      
      const results = {
        total: students.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const student of students) {
        try {
          console.log(`Syncing student: ${student.name} (${student.codeforcesHandle})`);
          await this.syncStudentData(student._id, student.codeforcesHandle);
          results.successful++;
        } catch (error) {
          console.error(`Failed to sync ${student.name}:`, error.message);
          results.failed++;
          results.errors.push({
            student: student.name,
            handle: student.codeforcesHandle,
            error: error.message
          });
        }
        
        // Add delay between student syncs to respect API limits
        if (students.indexOf(student) < students.length - 1) {
          await this.delay(this.requestDelay);
        }
      }

      console.log(`✅ Sync completed: ${results.successful}/${results.total} successful`);
      return results;
    } catch (error) {
      console.error('Error syncing all students:', error);
      throw error;
    }
  }

  async getStudentAnalytics(studentId, days = 30) {
    try {
      console.log(`📊 Getting analytics for student ${studentId} (${days} days)`);
      
      const codeforcesData = await CodeforcesData.findOne({ studentId });
      
      if (!codeforcesData || !codeforcesData.submissions || codeforcesData.submissions.length === 0) {
        console.log(`No submissions data found for student ${studentId}`);
        return {
          totalProblems: 0,
          avgProblemsPerDay: 0,
          avgRating: 0,
          maxDifficulty: 0,
          ratingBuckets: {},
          submissions: [],
          languageStats: {},
          dailyActivity: {},
          streakData: {
            current: 0,
            longest: 0
          },
          difficultyProgression: []
        };
      }

      const cutoffTime = Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000);
      
      // Filter submissions within the time range and only successful ones
      const recentSubmissions = codeforcesData.submissions.filter(
        sub => sub.creationTimeSeconds >= cutoffTime && sub.verdict === 'OK'
      );

      // All successful submissions for some calculations
      const allSuccessfulSubmissions = codeforcesData.submissions.filter(
        sub => sub.verdict === 'OK'
      );

      console.log(`Analytics for ${days} days: ${recentSubmissions.length} successful submissions out of ${codeforcesData.submissions.length} total`);

      // Calculate basic analytics
      const totalProblems = recentSubmissions.length;
      const avgProblemsPerDay = totalProblems / days;
      
      const ratings = recentSubmissions
        .map(sub => sub.problem?.rating)
        .filter(rating => rating !== undefined && rating !== null);
      
      const avgRating = ratings.length > 0 
        ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
        : 0;
      
      const maxDifficulty = ratings.length > 0 ? Math.max(...ratings) : 0;

      // Rating distribution
      const ratingBuckets = {};
      ratings.forEach(rating => {
        const bucket = Math.floor(rating / 100) * 100;
        ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
      });

      // Language statistics
      const languageStats = {};
      recentSubmissions.forEach(sub => {
        const lang = sub.programmingLanguage || 'Unknown';
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      });

      // Daily activity pattern
      const dailyActivity = {};
      recentSubmissions.forEach(sub => {
        const date = new Date(sub.creationTimeSeconds * 1000);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;
      });

      // Calculate streak data
      const streakData = this.calculateStreakData(allSuccessfulSubmissions);

      // Difficulty progression over time
      const difficultyProgression = recentSubmissions
        .filter(sub => sub.problem.rating)
        .sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds)
        .map((sub, index) => ({
          submission: index + 1,
          difficulty: sub.problem.rating,
          date: new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0],
          problemName: sub.problem.name
        }));

      const analytics = {
        totalProblems,
        avgProblemsPerDay: Math.round(avgProblemsPerDay * 100) / 100,
        avgRating,
        maxDifficulty,
        ratingBuckets,
        submissions: recentSubmissions,
        languageStats,
        dailyActivity,
        streakData,
        difficultyProgression,
        // Additional metrics
        uniqueProblems: new Set(recentSubmissions.map(sub => `${sub.problem.contestId}-${sub.problem.index}`)).size,
        averageAttempts: recentSubmissions.length > 0 ? (recentSubmissions.length / new Set(recentSubmissions.map(sub => `${sub.problem.contestId}-${sub.problem.index}`)).size).toFixed(2) : 0,
        mostUsedLanguage: Object.entries(languageStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
        problemTags: this.extractPopularTags(recentSubmissions)
      };

      console.log(`📊 Analytics calculated:`, {
        totalProblems: analytics.totalProblems,
        avgRating: analytics.avgRating,
        maxDifficulty: analytics.maxDifficulty,
        languages: Object.keys(analytics.languageStats).length
      });

      return analytics;
    } catch (error) {
      console.error('Error getting student analytics:', error);
      throw error;
    }
  }

  calculateStreakData(submissions) {
    if (!submissions || submissions.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Get unique dates of submissions
    const submissionDates = [...new Set(
      submissions.map(sub => {
        const date = new Date(sub.creationTimeSeconds * 1000);
        return date.toISOString().split('T')[0];
      })
    )].sort();

    if (submissionDates.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Check if there was activity today or yesterday
    if (submissionDates.includes(today) || submissionDates.includes(yesterday)) {
      let checkDate = submissionDates.includes(today) ? today : yesterday;
      let dateIndex = submissionDates.indexOf(checkDate);
      
      while (dateIndex >= 0) {
        currentStreak++;
        
        if (dateIndex === 0) break;
        
        const currentDateObj = new Date(submissionDates[dateIndex]);
        const prevDateObj = new Date(submissionDates[dateIndex - 1]);
        const dayDiff = (currentDateObj - prevDateObj) / (1000 * 60 * 60 * 24);
        
        if (dayDiff <= 1) {
          dateIndex--;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < submissionDates.length; i++) {
      const currentDate = new Date(submissionDates[i]);
      const prevDate = new Date(submissionDates[i - 1]);
      const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (dayDiff <= 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current: currentStreak,
      longest: longestStreak
    };
  }

  extractPopularTags(submissions) {
    const tagCounts = {};
    
    submissions.forEach(sub => {
      if (sub.problem && sub.problem.tags) {
        sub.problem.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  async checkInactiveStudents(days = 7) {
    try {
      console.log(`🔍 Checking for students inactive for more than ${days} days...`);
      
      const cutoffTime = Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000);
      const inactiveStudents = [];
      
      const students = await Student.find({ 
        isActive: true, 
        emailRemindersEnabled: true 
      });
      
      for (const student of students) {
        const codeforcesData = await CodeforcesData.findOne({ studentId: student._id });
        
        if (!codeforcesData || !codeforcesData.submissions || codeforcesData.submissions.length === 0) {
          inactiveStudents.push(student);
          continue;
        }
        
        const recentSubmissions = codeforcesData.submissions.filter(
          sub => sub.creationTimeSeconds >= cutoffTime
        );
        
        if (recentSubmissions.length === 0) {
          inactiveStudents.push(student);
        }
      }
      
      console.log(`📧 Found ${inactiveStudents.length} inactive students out of ${students.length} total`);
      return inactiveStudents;
    } catch (error) {
      console.error('Error checking inactive students:', error);
      throw error;
    }
  }
}

module.exports = new CodeforcesService();