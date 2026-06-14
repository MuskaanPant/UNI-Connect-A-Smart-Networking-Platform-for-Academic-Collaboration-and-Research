const express = require('express');
const router = express.Router();
const { 
    scheduleInterview, 
    getUserInterviews, 
    respondToInterview, 
    acceptProposedTime,
    markInterviewComplete 
} = require('../controllers/interviewController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, scheduleInterview);
router.get('/', authMiddleware, getUserInterviews);
router.put('/:interviewId/respond', authMiddleware, respondToInterview);
router.put('/:interviewId/accept-proposed', authMiddleware, acceptProposedTime);
router.put('/:interviewId/complete', authMiddleware, markInterviewComplete);

module.exports = router;