#!/usr/bin/env node

// Debug startup script for Railway deployment
console.log('🚀 Starting RuneRUSH server with enhanced debugging...');
console.log('📁 Current directory:', process.cwd());
console.log('📋 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || '8080');
console.log('🏠 Host:', process.env.HOST || '0.0.0.0');

// Check critical environment variables
console.log('\n🔍 Environment Variables Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Start a basic health check server first
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Basic health check that works even if database is down
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        database_configured: !!process.env.DATABASE_URL
    });
});

// Start listening immediately
const server = app.listen(PORT, HOST, () => {
    console.log(`\n✅ Basic server started on http://${HOST}:${PORT}`);
    console.log('🩺 Health check available at /api/health');
    
    // Now try to start the main application
    setTimeout(() => {
        console.log('\n🔄 Attempting to start main application...');
        try {
            require('./server.js');
        } catch (error) {
            console.error('❌ Main application failed to start:', error.message);
            console.error('Stack trace:', error.stack);
            
            // Keep the basic server running for diagnostics
            console.log('⚠️  Basic health check server will continue running for diagnostics');
        }
    }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});
