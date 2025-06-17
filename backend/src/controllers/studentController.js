const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const codeforcesService = require('../services/codeforcesService');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, phoneNumber, codeforcesHandle } = req.body;

        // Check if email already exists
        const existingEmail = await Student.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check if codeforces handle already exists
        const existingHandle = await Student.findOne({
            codeforcesHandle: codeforcesHandle.toLowerCase()
        });
        if (existingHandle) {
            return res.status(400).json({ message: 'Codeforces handle already exists' });
        }

        const student = new Student({
            name,
            email: email.toLowerCase(),
            phoneNumber,
            codeforcesHandle: codeforcesHandle.toLowerCase()
        });

        const savedStudent = await student.save();

        // Fetch initial Codeforces data
        try {
            await codeforcesService.syncStudentData(savedStudent._id, savedStudent.codeforcesHandle);
        } catch (cfError) {
            console.error('Error fetching initial Codeforces data:', cfError.message);
            // Don't fail student creation if CF data fetch fails
        }

        res.status(201).json(savedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, phoneNumber, codeforcesHandle, emailRemindersEnabled } = req.body;
        const studentId = req.params.id;

        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if email already exists (excluding current student)
        if (email && email !== existingStudent.email) {
            const existingEmail = await Student.findOne({
                email: email.toLowerCase(),
                _id: { $ne: studentId }
            });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Check if codeforces handle already exists (excluding current student)
        if (codeforcesHandle && codeforcesHandle !== existingStudent.codeforcesHandle) {
            const existingHandle = await Student.findOne({
                codeforcesHandle: codeforcesHandle.toLowerCase(),
                _id: { $ne: studentId }
            });
            if (existingHandle) {
                return res.status(400).json({ message: 'Codeforces handle already exists' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email.toLowerCase();
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (emailRemindersEnabled !== undefined) updateData.emailRemindersEnabled = emailRemindersEnabled;

        // If codeforces handle is being updated, fetch new data
        if (codeforcesHandle && codeforcesHandle !== existingStudent.codeforcesHandle) {
            updateData.codeforcesHandle = codeforcesHandle.toLowerCase();

            try {
                // Sync new Codeforces data immediately
                await codeforcesService.syncStudentData(studentId, codeforcesHandle.toLowerCase());
            } catch (cfError) {
                console.error('Error syncing new Codeforces data:', cfError.message);
                return res.status(400).json({
                    message: 'Invalid Codeforces handle or API error',
                    error: cfError.message
                });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete student (soft delete)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export students as CSV
exports.exportStudentsCSV = async (req, res) => {
    try {
        const students = await Student.find({ isActive: true }).lean();

        const fields = [
            'name',
            'email',
            'phoneNumber',
            'codeforcesHandle',
            'currentRating',
            'maxRating',
            'lastUpdated',
            'reminderCount'
        ];

        // Simple CSV generation without external library for now
        const headers = fields.join(',');
        const csvRows = students.map(student =>
            fields.map(field => {
                const value = student[field] || '';
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(',')
        );

        const csv = [headers, ...csvRows].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('students.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get student's Codeforces data
exports.getStudentCodeforcesData = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { days = 30 } = req.query;

        console.log(`Fetching Codeforces data for student: ${studentId}`);

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Try to get existing Codeforces data
        let codeforcesData = await CodeforcesData.findOne({ studentId });

        // If no data exists or data is old (more than 1 hour), try to sync
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (!codeforcesData || codeforcesData.lastSyncTime < oneHourAgo) {
            console.log(`No recent data found for ${student.codeforcesHandle}, attempting to sync...`);
            try {
                codeforcesData = await codeforcesService.syncStudentData(studentId, student.codeforcesHandle);
            } catch (syncError) {
                console.error('Failed to sync data:', syncError.message);

                // If sync fails but we have old data, use it
                if (codeforcesData) {
                    console.log('Using existing data despite sync failure');
                } else {
                    return res.status(400).json({
                        message: 'Failed to fetch Codeforces data',
                        error: syncError.message
                    });
                }
            }
        }

        // Get analytics for the requested time period
        const analytics = await codeforcesService.getStudentAnalytics(studentId, parseInt(days));

        console.log(`Returning data: ${codeforcesData.contests?.length || 0} contests, ${codeforcesData.submissions?.length || 0} submissions`);

        res.json({
            student,
            codeforcesData,
            analytics
        });
    } catch (error) {
        console.error('Error in getStudentCodeforcesData:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};

// Manual sync for specific student
exports.syncStudentData = async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // For now, just update the lastUpdated timestamp
        await Student.findByIdAndUpdate(studentId, {
            lastUpdated: new Date()
        });

        res.json({
            message: 'Student data synced successfully (mock implementation)',
            data: { synced: true }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error syncing student data',
            error: error.message
        });
    }
};

