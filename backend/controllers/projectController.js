const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
    try {
        const { title, description, techStack, status, isResearchProject } = req.body;

        const newProject = new Project({
            title,
            description,
            techStack,
            status,
            isResearchProject,
            user: req.user.id
        });

        console.log("Logged in User ID:", req.user ? req.user.id : "No User Found");

        const project = await newProject.save();
        
        // Auto-update user skills based on techStack
        if (techStack && techStack.length > 0) {
            const user = await User.findById(req.user.id);
            if (user) {
                // Get existing skills or initialize empty array
                const existingSkills = user.skills || [];
                
                // Add new skills from techStack (avoid duplicates)
                const newSkills = techStack.filter(skill => 
                    !existingSkills.some(existing => 
                        existing.toLowerCase() === skill.toLowerCase()
                    )
                );
                
                if (newSkills.length > 0) {
                    user.skills = [...existingSkills, ...newSkills];
                    await user.save();
                    console.log(`Added ${newSkills.length} new skills to user: ${newSkills.join(', ')}`);
                }
            }
        }
        
        const populatedProject = await Project.findById(project._id).populate('user', ['fullName', 'role']);
        res.status(201).json(populatedProject);
    } catch (err) {
        console.error('Error in createProject:', err);
        res.status(500).json({ message: 'Failed to create project', error: err.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('user', ['fullName', 'role', 'email'])
            .populate({
                path: 'joinRequests.user',
                select: 'fullName role email'
            });
        
        console.log('Fetched projects:', projects.length);
        projects.forEach(p => {
            console.log(`Project: ${p.title}, Requests: ${p.joinRequests?.length || 0}`);
            if (p.joinRequests && p.joinRequests.length > 0) {
                p.joinRequests.forEach(r => {
                    console.log(`  - User: ${r.user?.fullName || 'UNDEFINED'}, ID: ${r.user?._id || 'UNDEFINED'}`);
                });
            }
        });
        
        res.json(projects);
    } catch (err) {
        console.error('Error in getAllProjects:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getMyProjects = async (req, res) => {
    const projects = await Project.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate('user', ['fullName', 'role'])
        .populate('joinRequests.user', ['fullName', 'role', 'email']);
    res.json(projects);
}

exports.requestToJoin = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        console.log('Request to join - User ID:', req.user.id);
        console.log('Request to join - Project ID:', req.params.id);

        // Check if already requested
        const alreadyRequested = project.joinRequests?.some(
            request => request.user.toString() === req.user.id
        );

        if (alreadyRequested) {
            return res.status(400).json({ message: 'You have already requested to join this project' });
        }

        // Check if already a member
        const alreadyMember = project.members?.some(
            member => member.toString() === req.user.id
        );

        if (alreadyMember) {
            return res.status(400).json({ message: 'You are already a member of this project' });
        }

        // Add join request
        if (!project.joinRequests) {
            project.joinRequests = [];
        }

        project.joinRequests.push({
            user: req.user.id,
            status: 'pending',
            message: req.body.message || '',
            createdAt: new Date()
        });

        await project.save();

        const updatedProject = await Project.findById(req.params.id)
            .populate('user', ['fullName', 'role'])
            .populate({
                path: 'joinRequests.user',
                select: 'fullName role email'
            });

        console.log('Join request added successfully');
        console.log('Project ID:', req.params.id);
        console.log('Requester ID:', req.user.id);
        console.log('Total join requests:', updatedProject.joinRequests.length);
        console.log('Pending requests:', updatedProject.joinRequests.filter(r => r.status === 'pending').length);
        
        // Log the populated user data
        if (updatedProject.joinRequests.length > 0) {
            const lastRequest = updatedProject.joinRequests[updatedProject.joinRequests.length - 1];
            console.log('Last request user:', lastRequest.user);
        }

        res.json({ 
            message: 'Join request sent successfully',
            project: updatedProject
        });
    } catch (err) {
        console.error('Error in requestToJoin:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.handleJoinRequest = async (req, res) => {
    try {
        const { projectId, requestId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if user is the project owner
        if (project.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only project owner can manage join requests' });
        }

        // Find the join request
        const requestIndex = project.joinRequests.findIndex(
            req => req._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        const joinRequest = project.joinRequests[requestIndex];

        if (action === 'accept') {
            // Update request status
            joinRequest.status = 'accepted';
            
            // Add user to members if not already there
            if (!project.members) {
                project.members = [];
            }
            if (!project.members.includes(joinRequest.user)) {
                project.members.push(joinRequest.user);
            }
        } else if (action === 'reject') {
            // Update request status
            joinRequest.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' });
        }

        await project.save();

        const updatedProject = await Project.findById(projectId)
            .populate('user', ['fullName', 'role'])
            .populate('joinRequests.user', ['fullName', 'role', 'email'])
            .populate('members', ['fullName', 'role', 'email']);

        res.json({ 
            message: `Join request ${action}ed successfully`,
            project: updatedProject
        });
    } catch (err) {
        console.error('Error in handleJoinRequest:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const userId = req.params.userId;
        const projects = await Project.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', ['fullName', 'role']);
        res.json(projects);
    } catch (err) {
        console.error('Error in getUserProjects:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, techStack, status } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if user is the project owner
        if (project.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only project owner can update this project' });
        }

        if (title) project.title = title;
        if (description) project.description = description;
        if (techStack) project.techStack = techStack;
        if (status) project.status = status;

        await project.save();

        const updatedProject = await Project.findById(projectId)
            .populate('user', ['fullName', 'role'])
            .populate('joinRequests.user', ['fullName', 'role', 'email'])
            .populate('members', ['fullName', 'role', 'email']);

        res.json({ message: 'Project updated successfully', project: updatedProject });
    } catch (err) {
        console.error('Error in updateProject:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if user is the project owner
        if (project.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only project owner can delete this project' });
        }

        await Project.findByIdAndDelete(projectId);

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error in deleteProject:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};