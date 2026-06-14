const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/@geu\.ac\.in$/, 'Please use a valid GEU email address']
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Professor'], default: 'Student' },
    reputationPoints: { type: Number, default: 0 },
    skills: [String],
    activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);