const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { askQuestion, getAllThreads, answerQuestion, updateQuestion, deleteQuestion, deleteAnswer } = require('../controllers/forumController');

router.get('/', getAllThreads);
router.post('/ask', auth, askQuestion);
router.post('/answers/:id', auth, answerQuestion);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);
router.delete('/:questionId/answers/:answerId', auth, deleteAnswer);

module.exports = router;