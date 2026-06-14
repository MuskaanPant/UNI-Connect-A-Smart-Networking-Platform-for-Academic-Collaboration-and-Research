const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { fullName, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ fullName, email, password: hashedPassword, role });
    await user.save();

    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ 
        token, 
        user: { 
            id: user._id, 
            fullName: user.fullName, 
            email: user.email, 
            role: user.role,
            skills: user.skills || []
        } 
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = {
        user: {
            id: user._id,
            role: user.role
        }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
        token,
        user: { 
            id: user._id, 
            fullName: user.fullName, 
            role: user.role,
            skills: user.skills || []
        }
    });
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            skills: user.skills || [],
            reputationPoints: user.reputationPoints
        });
    } catch (err) {
        console.error('Error in getCurrentUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { fullName, skills } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (fullName) user.fullName = fullName;
        if (skills) user.skills = skills;
        
        await user.save();
        
        res.json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            skills: user.skills || [],
            reputationPoints: user.reputationPoints
        });
    } catch (err) {
        console.error('Error in updateProfile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};