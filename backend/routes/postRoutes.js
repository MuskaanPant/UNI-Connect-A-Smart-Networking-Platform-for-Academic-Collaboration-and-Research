const express = require('express');
const router = express.Router();

const { createPost, getFeed, toggleLike, addComment, getUserPosts, updatePost, deletePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createPost);
router.get('/', authMiddleware, getFeed);
router.get('/user/:userId', authMiddleware, getUserPosts); // Specific route first
router.put('/like/:id', authMiddleware, toggleLike); // Specific route
router.post('/:id/comment', authMiddleware, addComment); // Specific route
router.put('/:id', authMiddleware, updatePost); // Generic route last
router.delete('/:id', authMiddleware, deletePost); // Generic route last

module.exports = router;