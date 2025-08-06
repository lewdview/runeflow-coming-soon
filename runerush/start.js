#!/usr/bin/env node

// Simple start script for Railway deployment debugging
console.log('🚀 Starting RuneRUSH server...');
console.log('📁 Current directory:', process.cwd());
console.log('📋 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || '8080');

// Check if server.js exists
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(serverPath)) {
    console.error('❌ server.js not found at:', serverPath);
    process.exit(1);
}

console.log('✅ server.js found, starting...');
require('./server.js');
