const forum = require('../models/Forum');

exports.askQuestion = async (req, res) => {
    const { title, description, imageURL, tags } = req.body;
    const newQuestion = new forum({
        title,
        description,
        imageURL,
        tags,
        user: req.user.id
    });
    await newQuestion.save();
    res.status(201).json({ message: 'Question posted successfully', question: newQuestion });
}

exports.answerQuestion = async (req, res) => {
    const question = await forum.findById(req.params.id);
    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }
    const newAnswer = {
        user: req.user.id,
        text: req.body.text
    }
    question.answers.push(newAnswer);
    await question.save();
    res.json(question.newAnswer);
}

exports.getAllThreads = async (req, res) => {
    const threads = await forum.find().sort({ createdAt: -1 })
        .populate('user', ['fullName', 'role'])
        .populate('answers.user', ['fullName', 'role']);
    res.json(threads);
}

exports.updateQuestion = async (req, res) => {
    try {
        const question = await forum.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (question.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own questions' });
        }

        const { title, description, tags } = req.body;
        if (title) question.title = title;
        if (description) question.description = description;
        if (tags) question.tags = tags;

        await question.save();

        const updatedQuestion = await forum.findById(req.params.id)
            .populate('user', ['fullName', 'role'])
            .populate('answers.user', ['fullName', 'role']);

        res.json(updatedQuestion);
    } catch (err) {
        console.error('Error updating question:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const question = await forum.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (question.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own questions' });
        }

        await forum.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        console.error('Error deleting question:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteAnswer = async (req, res) => {
    try {
        const { questionId, answerId } = req.params;
        const question = await forum.findById(questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const answer = question.answers.id(answerId);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });

        if (answer.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own answers' });
        }

        question.answers.pull(answerId);
        await question.save();

        const updatedQuestion = await forum.findById(questionId)
            .populate('user', ['fullName', 'role'])
            .populate('answers.user', ['fullName', 'role']);

        res.json(updatedQuestion);
    } catch (err) {
        console.error('Error deleting answer:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};