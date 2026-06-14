// Backend Setup Checker
require('dotenv').config();

console.log('🔍 Checking Backend Setup...\n');

// Check Node version
console.log('✓ Node Version:', process.version);

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Not set');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
console.log('  PORT:', process.env.PORT || '5000 (default)');

// Check required modules
console.log('\n📦 Required Modules:');
const modules = ['express', 'mongoose', 'bcrypt', 'jsonwebtoken', 'cors', 'dotenv'];
modules.forEach(mod => {
  try {
    require(mod);
    console.log(`  ${mod}: ✓ Installed`);
  } catch (err) {
    console.log(`  ${mod}: ✗ Not installed`);
  }
});

// Check MongoDB connection
console.log('\n🗄️  Testing MongoDB Connection...');
const mongoose = require('mongoose');

if (!process.env.MONGO_URI) {
  console.log('  ✗ MONGO_URI not set in .env file');
  console.log('\n⚠️  Please create a .env file with:');
  console.log('  MONGO_URI=mongodb://localhost:27017/geu-connect');
  console.log('  JWT_SECRET=your_secret_key_here');
  console.log('  PORT=5000');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('  ✓ MongoDB Connected Successfully');
    console.log('\n✅ All checks passed! You can start the server.');
    process.exit(0);
  })
  .catch(err => {
    console.log('  ✗ MongoDB Connection Failed');
    console.log('  Error:', err.message);
    console.log('\n⚠️  Make sure MongoDB is running:');
    console.log('  - Run: mongod');
    console.log('  - Or: sudo systemctl start mongodb');
    process.exit(1);
  });
