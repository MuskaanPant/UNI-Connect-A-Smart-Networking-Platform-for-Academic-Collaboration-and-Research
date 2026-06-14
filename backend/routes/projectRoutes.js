const express = require('express');
const router = express.Router();
const { 
    createProject, 
    getAllProjects, 
    getMyProjects, 
    requestToJoin, 
    handleJoinRequest, 
    getUserProjects,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getAllProjects);
router.get('/my', authMiddleware, getMyProjects);
router.get('/user/:userId', authMiddleware, getUserProjects);
router.post('/:id/join', authMiddleware, requestToJoin);
router.put('/:projectId/requests/:requestId', authMiddleware, handleJoinRequest);
router.put('/:projectId', authMiddleware, updateProject);
router.delete('/:projectId', authMiddleware, deleteProject);

module.exports = router;
