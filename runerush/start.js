#!/usr/bin/env node

// Production start script with enhanced error handling
console.log('🚀 Starting RuneRUSH server...');
console.log('📁 Current directory:', process.cwd());
console.log('📋 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || '8080');
console.log('🏠 Host:', process.env.HOST || '0.0.0.0');

// Check critical environment variables
console.log('\n🔍 Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing');

// Check if server.js exists
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(serverPath)) {
    console.error('❌ server.js not found at:', serverPath);
    process.exit(1);
}

console.log('\n✅ server.js found, starting main application...');

// Enhanced error handling for server startup
try {
    require('./server.js');
} catch (error) {
    console.error('\n❌ Server startup failed:');
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Exit with error code but provide more info
    console.error('\n💡 Common fixes:');
    console.error('- Check DATABASE_URL is set correctly');
    console.error('- Ensure PostgreSQL service is running');
    console.error('- Verify all required environment variables are set');
    
    process.exit(1);
}
