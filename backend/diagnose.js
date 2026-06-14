#!/usr/bin/env node

/**
 * GEU-Connect Backend Diagnostic Tool
 * Run this script to check if your backend is properly configured
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 GEU-Connect Backend Diagnostics\n');
console.log('='.repeat(50));

// Check 1: Environment Variables
console.log('\n✓ Checking Environment Variables...');
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✓ ${varName}: ${varName === 'JWT_SECRET' ? '***hidden***' : process.env[varName]}`);
  } else {
    console.log(`  ✗ ${varName}: MISSING`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:', missingVars.join(', '));
  console.log('   Please create a .env file in the backend directory');
  console.log('   Copy .env.example and fill in the values');
  process.exit(1);
}

// Check 2: MongoDB Connection
console.log('\n✓ Testing MongoDB Connection...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('  ✓ MongoDB Connected Successfully');
    console.log(`  ✓ Database: ${mongoose.connection.name}`);
    console.log(`  ✓ Host: ${mongoose.connection.host}`);
    
    // Check 3: Collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('\n✓ Database Collections:');
    if (collections.length === 0) {
      console.log('  ℹ No collections yet (this is normal for a new database)');
    } else {
      collections.forEach(col => {
        console.log(`  ✓ ${col.name}`);
      });
    }
    
    // Check 4: Models
    console.log('\n✓ Checking Models...');
    const models = ['User', 'Post', 'Project', 'Forum', 'Interview'];
    models.forEach(model => {
      try {
        require(`./models/${model}`);
        console.log(`  ✓ ${model} model loaded`);
      } catch (err) {
        console.log(`  ✗ ${model} model failed:`, err.message);
      }
    });
    
    // Check 5: Routes
    console.log('\n✓ Checking Routes...');
    const routes = ['authRoutes', 'postRoutes', 'projectRoutes', 'forumRoutes', 'interviewRoutes'];
    routes.forEach(route => {
      try {
        require(`./routes/${route}`);
        console.log(`  ✓ ${route} loaded`);
      } catch (err) {
        console.log(`  ✗ ${route} failed:`, err.message);
      }
    });
    
    // Check 6: Controllers
    console.log('\n✓ Checking Controllers...');
    const controllers = ['authController', 'postController', 'projectController', 'forumController', 'interviewController'];
    controllers.forEach(controller => {
      try {
        require(`./controllers/${controller}`);
        console.log(`  ✓ ${controller} loaded`);
      } catch (err) {
        console.log(`  ✗ ${controller} failed:`, err.message);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All checks passed! Backend is ready to run.');
    console.log('\nTo start the server, run: npm start');
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.log('  ✗ MongoDB Connection Failed');
    console.log('  Error:', err.message);
    console.log('\n❌ Troubleshooting:');
    console.log('  1. Make sure MongoDB is running');
    console.log('  2. Check your MONGO_URI in .env file');
    console.log('  3. For local MongoDB: mongodb://localhost:27017/geu-connect');
    console.log('  4. For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/geu-connect');
    console.log('  5. Whitelist your IP in MongoDB Atlas if using cloud');
    process.exit(1);
  });
