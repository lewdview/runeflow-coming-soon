#!/usr/bin/env node

require('dotenv').config();
const db = require('../database/db');

async function migrate() {
    try {
        console.log('🔄 Starting database migration...');
        
        await db.connect();
        await db.migrate();
        
        console.log('✅ Database migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

if (require.main === module) {
    migrate();
}

module.exports = migrate;
