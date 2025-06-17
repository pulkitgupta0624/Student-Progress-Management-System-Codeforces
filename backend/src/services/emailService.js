const nodemailer = require('nodemailer');
const Student = require('../models/Student');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendInactivityReminder(student) {
    try {
      const emailTemplate = this.getInactivityEmailTemplate(student);
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Time to get back to problem solving! 🚀',
        html: emailTemplate
      });

      // Update reminder count and timestamp
      await Student.findByIdAndUpdate(student._id, {
        $inc: { reminderCount: 1 },
        lastReminderSent: new Date()
      });

      console.log(`Inactivity reminder sent to ${student.email}`);
      return true;
    } catch (error) {
      console.error(`Error sending email to ${student.email}:`, error);
      return false;
    }
  }

  getInactivityEmailTemplate(student) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
          .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚀 Time to Code, ${student.name}!</h2>
          </div>
          <div class="content">
            <p>Hi ${student.name},</p>
            <p>We noticed you haven't submitted any solutions on Codeforces in the last 7 days. Consistent practice is key to improving your programming skills!</p>
            
            <p>Here are some suggestions to get back on track:</p>
            <ul>
              <li>Start with easier problems to build momentum</li>
              <li>Set a goal to solve at least 1 problem per day</li>
              <li>Join virtual contests to simulate real contest environment</li>
              <li>Review your past submissions and learn from mistakes</li>
            </ul>
            
            <p>Your Codeforces handle: <strong>${student.codeforcesHandle}</strong></p>
            <p>Current rating: <strong>${student.currentRating}</strong></p>
            <p>Max rating: <strong>${student.maxRating}</strong></p>
            
            <div style="text-align: center;">
              <a href="https://codeforces.com/problemset" class="button">Start Solving Problems</a>
            </div>
            
            <p>Keep coding and stay motivated! 💪</p>
            
            <p>Best regards,<br>Student Progress Management Team</p>
          </div>
          <div class="footer">
            <p>This is reminder #${student.reminderCount + 1} sent to you.</p>
            <p>If you want to disable these reminders, please contact your administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendBulkInactivityReminders(inactiveStudents) {
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const student of inactiveStudents) {
      try {
        const success = await this.sendInactivityReminder(student);
        if (success) {
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          student: student.email,
          error: error.message
        });
      }
      
      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Email reminder results: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }
}

module.exports = new EmailService();