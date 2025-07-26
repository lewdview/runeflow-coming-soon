#!/usr/bin/env node

require('dotenv').config();
const db = require('../database/db');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');
        
        await db.connect();

        // Seed sample files
        const files = [
            {
                filename: 'rune-rush-templates.zip',
                display_name: 'Rune Rush - 50 Premium n8n Templates',
                s3_key: 'main/rune-rush-templates.zip',
                file_size: 52428800, // 50MB
                content_type: 'application/zip',
                product_type: 'main'
            },
            {
                filename: 'rune-starter-guide.pdf',
                display_name: 'Rune Starter Guide (Bonus)',
                s3_key: 'main/rune-starter-guide.pdf',
                file_size: 10485760, // 10MB
                content_type: 'application/pdf',
                product_type: 'main'
            },
            {
                filename: 'lifetime-vault-access.zip',
                display_name: 'Lifetime Vault - Premium Collection',
                s3_key: 'upsell/lifetime-vault-access.zip',
                file_size: 157286400, // 150MB
                content_type: 'application/zip',
                product_type: 'upsell'
            },
            {
                filename: 'automation-mastery-course.zip',
                display_name: 'Automation Mastery Video Course',
                s3_key: 'upsell/automation-mastery-course.zip',
                file_size: 524288000, // 500MB
                content_type: 'application/zip',
                product_type: 'upsell'
            }
        ];

        for (const file of files) {
            try {
                await db.createFile(file);
                console.log(`✅ Added file: ${file.display_name}`);
            } catch (error) {
                if (error.message.includes('UNIQUE constraint')) {
                    console.log(`⚠️  File already exists: ${file.display_name}`);
                } else {
                    throw error;
                }
            }
        }

        console.log('✅ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

if (require.main === module) {
    seed();
}

module.exports = seed;
