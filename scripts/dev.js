#!/usr/bin/env node

// Development script to run both frontend and backend concurrently
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Tank-O Development Environment...\n');

// Start frontend dev server
console.log('🚀 Starting Frontend (Angular + Phaser)...');
const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
});

// Start backend server
console.log('🚀 Starting Backend (Node.js + Socket.IO)...');
const backend = spawn('npm', ['start'], {
    stdio: 'inherit', 
    shell: true,
    cwd: path.join(process.cwd(), 'server')
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    
    if (frontend && !frontend.killed) {
        frontend.kill('SIGINT');
    }
    
    if (backend && !backend.killed) {
        backend.kill('SIGINT');
    }
    
    process.exit(0);
});

// Handle individual process exits
frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
});

backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
});

frontend.on('error', (error) => {
    console.error('Frontend error:', error);
});

backend.on('error', (error) => {
    console.error('Backend error:', error);
});

console.log('\n✅ Development servers starting...');
console.log('Frontend: http://localhost:8080');
console.log('Backend: http://localhost:3000');
console.log('\nPress Ctrl+C to stop all servers\n');