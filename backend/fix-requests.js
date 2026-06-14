const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');
const User = require('./models/User');

async function fixRequests() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const projects = await Project.find();
        console.log(`Found ${projects.length} projects\n`);

        for (const project of projects) {
            if (project.joinRequests && project.joinRequests.length > 0) {
                console.log(`\nProject: ${project.title}`);
                console.log(`Join Requests: ${project.joinRequests.length}`);
                
                let needsSave = false;
                
                for (let i = 0; i < project.joinRequests.length; i++) {
                    const request = project.joinRequests[i];
                    console.log(`  Request ${i + 1}:`);
                    console.log(`    User ID: ${request.user}`);
                    console.log(`    Status: ${request.status}`);
                    
                    // Check if user exists
                    try {
                        const user = await User.findById(request.user);
                        if (user) {
                            console.log(`    ✓ User found: ${user.fullName} (${user.email})`);
                        } else {
                            console.log(`    ✗ User NOT found - removing request`);
                            project.joinRequests.splice(i, 1);
                            i--;
                            needsSave = true;
                        }
                    } catch (err) {
                        console.log(`    ✗ Invalid user ID - removing request`);
                        project.joinRequests.splice(i, 1);
                        i--;
                        needsSave = true;
                    }
                }
                
                if (needsSave) {
                    await project.save();
                    console.log(`  ✓ Project updated`);
                }
            }
        }

        console.log('\n✅ Done! All invalid requests removed.');
        console.log('\nNow restart your backend server.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixRequests();
