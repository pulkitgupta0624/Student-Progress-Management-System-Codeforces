const codeforcesService = require('../services/codeforcesService');
const cronService = require('../services/cronService');

exports.syncAllStudents = async (req, res) => {
  try {
    const results = await cronService.manualSync();
    res.json({
      message: 'Sync completed successfully',
      results
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({
      message: 'Sync failed',
      error: error.message
    });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;
    
    const analytics = await codeforcesService.getStudentAnalytics(
      studentId, 
      parseInt(days)
    );
    
    if (!analytics) {
      return res.status(404).json({ message: 'No data found for this student' });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: error.message });
  }
};