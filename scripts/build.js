#!/usr/bin/env node

// Build script for production deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Tank-O for production...\n');

try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    if (fs.existsSync('server/dist')) {
        fs.rmSync('server/dist', { recursive: true, force: true });
    }
    
    // Build frontend
    console.log('🔨 Building frontend (Angular + Phaser)...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create server dist directory
    console.log('📦 Preparing server files...');
    fs.mkdirSync('server/dist', { recursive: true });
    
    // Copy server source files (since we're not using TypeScript compilation yet)
    const serverSrc = path.join(__dirname, '../server/src');
    const serverDist = path.join(__dirname, '../server/dist');
    
    // Copy server files
    execSync(`cp -r "${serverSrc}"/* "${serverDist}"/`, { stdio: 'inherit' });
    
    // Copy package.json and other necessary files
    execSync('cp server/package*.json server/dist/', { stdio: 'inherit' });
    
    // Install production dependencies
    console.log('📦 Installing production dependencies...');
    execSync('cd server/dist && npm ci --only=production', { stdio: 'inherit' });
    
    console.log('\n✅ Build completed successfully!');
    console.log('\nBuild artifacts:');
    console.log('  Frontend: ./dist/');
    console.log('  Backend:  ./server/dist/');
    
    console.log('\n🚀 To start production server:');
    console.log('  cd server/dist && npm start');
    
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
}