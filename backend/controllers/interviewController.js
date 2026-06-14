const Interview = require('../models/Interview');

exports.scheduleInterview = async (req, res) => {
    try {
        const { interviewerId, title, type, date, time, meetingLink } = req.body;

        console.log('Schedule interview request:', {
            student: req.user.id,
            interviewerId,
            title,
            type,
            date,
            time,
            meetingLink
        });

        // Validate required fields
        if (!interviewerId || !title || !date || !time || !meetingLink) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['interviewerId', 'title', 'date', 'time', 'meetingLink']
            });
        }

        const newInterview = new Interview({
            student: req.user.id,  // Current user (project owner) is the student
            interviewer: interviewerId,  // The person who requested is the interviewer
            title: title || 'Project Discussion',
            type: type || 'Project Discussion',
            date,
            time,
            meetingLink,
            status: 'Pending'  // Changed to Pending
        });

        const interview = await newInterview.save();
        
        // Populate user details
        const populatedInterview = await Interview.findById(interview._id)
            .populate('student', ['fullName', 'role', 'email'])
            .populate('interviewer', ['fullName', 'role', 'email']);

        console.log('Interview request sent successfully:', populatedInterview._id);

        res.status(201).json(populatedInterview);
    } catch (err) {
        console.error('Error scheduling interview:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUserInterviews = async (req, res) => {
    const interviews = await Interview.find({
        $or: [
            { student: req.user.id },
            { interviewer: req.user.id }
        ]
    }).populate('student', ['fullName', 'role']).populate('interviewer', ['fullName', 'role']);
    res.json(interviews);
};

exports.respondToInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { action, proposedDate, proposedTime } = req.body; // action: 'accept', 'decline', 'propose'

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Check if user is the interviewer (the one who receives the request)
        if (interview.interviewer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the interviewee can respond to this request' });
        }

        if (action === 'accept') {
            interview.status = 'Accepted';
        } else if (action === 'decline') {
            interview.status = 'Declined';
        } else if (action === 'propose') {
            if (!proposedDate || !proposedTime) {
                return res.status(400).json({ message: 'Proposed date and time are required' });
            }
            interview.status = 'Pending';
            interview.proposedDateTime = {
                date: proposedDate,
                time: proposedTime
            };
            interview.proposedBy = req.user.id;
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await interview.save();

        const updatedInterview = await Interview.findById(interviewId)
            .populate('student', ['fullName', 'role', 'email'])
            .populate('interviewer', ['fullName', 'role', 'email'])
            .populate('proposedBy', ['fullName']);

        res.json({ message: `Interview ${action}ed successfully`, interview: updatedInterview });
    } catch (err) {
        console.error('Error responding to interview:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.acceptProposedTime = async (req, res) => {
    try {
        const { interviewId } = req.params;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Check if user is the original requester (student)
        if (interview.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the interview requester can accept proposed time' });
        }

        if (!interview.proposedDateTime) {
            return res.status(400).json({ message: 'No proposed time to accept' });
        }

        // Update interview with proposed time
        interview.date = interview.proposedDateTime.date;
        interview.time = interview.proposedDateTime.time;
        interview.status = 'Accepted';
        interview.proposedDateTime = undefined;
        interview.proposedBy = undefined;

        await interview.save();

        const updatedInterview = await Interview.findById(interviewId)
            .populate('student', ['fullName', 'role', 'email'])
            .populate('interviewer', ['fullName', 'role', 'email']);

        res.json({ message: 'Proposed time accepted successfully', interview: updatedInterview });
    } catch (err) {
        console.error('Error accepting proposed time:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.markInterviewComplete = async (req, res) => {
    try {
        const { interviewId } = req.params;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Both parties can mark as complete
        if (interview.student.toString() !== req.user.id && interview.interviewer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not part of this interview' });
        }

        interview.status = 'Completed';
        await interview.save();

        const updatedInterview = await Interview.findById(interviewId)
            .populate('student', ['fullName', 'role', 'email'])
            .populate('interviewer', ['fullName', 'role', 'email']);

        res.json({ message: 'Interview marked as completed', interview: updatedInterview });
    } catch (err) {
        console.error('Error marking interview complete:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};