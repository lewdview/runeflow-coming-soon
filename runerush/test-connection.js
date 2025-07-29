// Test database connection and server startup
require('dotenv').config();

const express = require('express');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Health check passed',
        timestamp: new Date().toISOString()
    });
});

// Test database connection
app.get('/api/test', async (req, res) => {
    try {
        console.log('Testing database connection...');
        
        // Check if we can connect to the database
        if (db.isPostgres) {
            console.log('Using PostgreSQL database');
            const result = await db.query('SELECT NOW() as current_time');
            console.log('Database query result:', result);
            res.json({
                success: true,
                database: 'postgresql',
                result: result[0]
            });
        } else {
            console.log('Using SQLite database');
            res.json({
                success: true,
                database: 'sqlite',
                message: 'SQLite connection established'
            });
        }
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

async function startServer() {
    try {
        console.log('Connecting to database...');
        await db.connect();
        console.log('✅ Database connected successfully');
        
        console.log('Running database migration...');
        await db.migrate();
        console.log('✅ Database migration completed');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Test Server running on port ${PORT}`);
            console.log(`📍 Health check: http://0.0.0.0:${PORT}/api/health`);
            console.log(`🧪 Database test: http://0.0.0.0:${PORT}/api/test`);
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

startServer();
