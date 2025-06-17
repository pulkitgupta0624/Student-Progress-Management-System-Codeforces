const cron = require('node-cron');
const Settings = require('../models/Settings');
const codeforcesService = require('./codeforcesService');
const emailService = require('./emailService');

class CronService {
  constructor() {
    this.syncTask = null;
    this.reminderTask = null;
  }

  async initializeCronJobs() {
    try {
      // Get or create default settings
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
        await settings.save();
      }

      // Start cron jobs
      this.startDataSyncCron(settings.cronSchedule);
      this.startInactivityCheckCron();
      
      console.log('Cron jobs initialized successfully');
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
    }
  }

  startDataSyncCron(schedule = '0 2 * * *') {
    // Stop existing task if any
    if (this.syncTask) {
      this.syncTask.stop();
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      console.error('Invalid cron schedule:', schedule);
      schedule = '0 2 * * *'; // Default to 2 AM daily
    }

    this.syncTask = cron.schedule(schedule, async () => {
      console.log('Starting scheduled Codeforces data sync...');
      try {
        const results = await codeforcesService.syncAllStudents();
        
        // Update last run time
        await Settings.findOneAndUpdate(
          {},
          { lastCronRun: new Date() },
          { upsert: true }
        );
        
        console.log('Scheduled sync completed:', results);
      } catch (error) {
        console.error('Error in scheduled sync:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log(`Data sync cron job scheduled: ${schedule}`);
  }

  startInactivityCheckCron() {
    // Stop existing task if any
    if (this.reminderTask) {
      this.reminderTask.stop();
    }

    // Run daily at 9 AM to check for inactive students
    this.reminderTask = cron.schedule('0 9 * * *', async () => {
      console.log('Checking for inactive students...');
      try {
        const inactiveStudents = await codeforcesService.checkInactiveStudents();
        
        if (inactiveStudents.length > 0) {
          console.log(`Found ${inactiveStudents.length} inactive students`);
          const results = await emailService.sendBulkInactivityReminders(inactiveStudents);
          console.log('Inactivity reminders sent:', results);
        } else {
          console.log('No inactive students found');
        }
      } catch (error) {
        console.error('Error checking inactive students:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('Inactivity check cron job scheduled: daily at 9 AM UTC');
  }

  async updateSyncSchedule(newSchedule) {
    try {
      // Validate new schedule
      if (!cron.validate(newSchedule)) {
        throw new Error('Invalid cron schedule format');
      }

      // Update in database
      await Settings.findOneAndUpdate(
        {},
        { cronSchedule: newSchedule },
        { upsert: true }
      );

      // Restart cron job with new schedule
      this.startDataSyncCron(newSchedule);
      
      console.log(`Cron schedule updated to: ${newSchedule}`);
      return true;
    } catch (error) {
      console.error('Error updating cron schedule:', error);
      throw error;
    }
  }

  async manualSync() {
    try {
      console.log('Starting manual sync...');
      const results = await codeforcesService.syncAllStudents();
      
      // Update last run time
      await Settings.findOneAndUpdate(
        {},
        { lastCronRun: new Date() },
        { upsert: true }
      );
      
      return results;
    } catch (error) {
      console.error('Error in manual sync:', error);
      throw error;
    }
  }

  stopAllJobs() {
    if (this.syncTask) {
      this.syncTask.stop();
      console.log('Data sync cron job stopped');
    }
    
    if (this.reminderTask) {
      this.reminderTask.stop();
      console.log('Inactivity check cron job stopped');
    }
  }
}

module.exports = new CronService();