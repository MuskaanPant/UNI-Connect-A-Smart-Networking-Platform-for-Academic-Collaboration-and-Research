const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');

async function checkRequests() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const projects = await Project.find()
            .populate('user', ['fullName', 'email', 'role'])
            .populate('joinRequests.user', ['fullName', 'email', 'role']);

        console.log('='.repeat(60));
        console.log('ALL PROJECTS WITH JOIN REQUESTS');
        console.log('='.repeat(60));

        if (projects.length === 0) {
            console.log('No projects found in database');
        }

        projects.forEach((project, index) => {
            console.log(`\n${index + 1}. Project: ${project.title}`);
            console.log(`   Owner: ${project.user?.fullName || 'Unknown'} (${project.user?.email})`);
            console.log(`   Status: ${project.status}`);
            console.log(`   Total Join Requests: ${project.joinRequests?.length || 0}`);
            
            if (project.joinRequests && project.joinRequests.length > 0) {
                console.log(`   Join Requests:`);
                project.joinRequests.forEach((req, idx) => {
                    console.log(`     ${idx + 1}. ${req.user?.fullName || 'Unknown'} (${req.user?.email})`);
                    console.log(`        Status: ${req.status}`);
                    console.log(`        Message: ${req.message || 'No message'}`);
                    console.log(`        Date: ${req.createdAt}`);
                });
            } else {
                console.log(`   No join requests`);
            }
            console.log('-'.repeat(60));
        });

        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Projects: ${projects.length}`);
        console.log(`Projects with Requests: ${projects.filter(p => p.joinRequests?.length > 0).length}`);
        console.log(`Total Requests: ${projects.reduce((sum, p) => sum + (p.joinRequests?.length || 0), 0)}`);
        console.log('='.repeat(60));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkRequests();
