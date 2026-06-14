#!/usr/bin/env node

/**
 * GEU-Connect Frontend Diagnostic Tool
 * Run this script to check if your frontend is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GEU-Connect Frontend Diagnostics\n');
console.log('='.repeat(50));

// Check 1: .env file
console.log('\n✓ Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('  ✓ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('REACT_APP_API_URL')) {
    const match = envContent.match(/REACT_APP_API_URL=(.+)/);
    if (match) {
      console.log(`  ✓ REACT_APP_API_URL: ${match[1].trim()}`);
    }
  } else {
    console.log('  ✗ REACT_APP_API_URL not found in .env');
    console.log('  Add this line to .env: REACT_APP_API_URL=http://localhost:5000/api');
  }
} else {
  console.log('  ✗ .env file not found');
  console.log('  Create .env file with: REACT_APP_API_URL=http://localhost:5000/api');
}

// Check 2: node_modules
console.log('\n✓ Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✓ node_modules exists');
  
  // Check critical dependencies
  const criticalDeps = ['react', 'react-dom', 'react-router-dom', 'axios'];
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`  ✓ ${dep} installed`);
    } else {
      console.log(`  ✗ ${dep} not installed`);
    }
  });
} else {
  console.log('  ✗ node_modules not found');
  console.log('  Run: npm install');
}

// Check 3: Source files
console.log('\n✓ Checking source files...');
const criticalFiles = [
  'src/App.js',
  'src/index.js',
  'src/services/api.js',
  'src/context/AuthContext.js',
  'src/components/PostCard.js',
  'src/components/ProjectCard.js',
  'src/pages/Login.js',
  'src/pages/Feed.js',
  'src/pages/Projects.js'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} missing`);
  }
});

// Check 4: package.json
console.log('\n✓ Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('  ✓ package.json exists');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`  ✓ Project: ${packageJson.name}`);
  console.log(`  ✓ Version: ${packageJson.version}`);
} else {
  console.log('  ✗ package.json not found');
}

// Check 5: Build directory
console.log('\n✓ Checking build status...');
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  console.log('  ✓ Build directory exists (production build available)');
} else {
  console.log('  ℹ No build directory (run npm run build for production)');
}

console.log('\n' + '='.repeat(50));
console.log('✅ Frontend diagnostics complete!');
console.log('\nNext steps:');
console.log('  1. Make sure backend is running on port 5000');
console.log('  2. Run: npm start');
console.log('  3. Open: http://localhost:3000');
console.log('='.repeat(50) + '\n');
