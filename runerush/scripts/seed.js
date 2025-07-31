#!/usr/bin/env node

require('dotenv').config();
const db = require('../database/db');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');
        
        await db.connect();

        // Clear existing files first (optional - for clean seed)
        console.log('🗑️  Clearing existing files...');
        await db.run('DELETE FROM files');
        
        // Comprehensive file structure for RuneRUSH
        const files = [
            // =============================================================================
            // CORE BUNDLE ($49) - Available to ALL customers
            // =============================================================================
            {
                filename: 'runerush-core-50-templates.zip',
                display_name: 'RuneRUSH Core - 50 Premium n8n Templates',
                s3_key: 'core/runerush-core-50-templates.zip',
                file_size: 52428800, // 50MB
                content_type: 'application/zip',
                product_type: 'core'
            },
            {
                filename: 'runerush-starter-guide.pdf',
                display_name: 'RuneRUSH Starter Guide (PDF)',
                s3_key: 'core/runerush-starter-guide.pdf',
                file_size: 10485760, // 10MB
                content_type: 'application/pdf',
                product_type: 'core'
            },
            {
                filename: 'template-installation-guide.pdf',
                display_name: 'Template Installation Guide',
                s3_key: 'core/template-installation-guide.pdf',
                file_size: 5242880, // 5MB
                content_type: 'application/pdf',
                product_type: 'core'
            },
            
            // =============================================================================
            // PRO BUNDLE EXTRAS ($88 total) - Additional files for PRO customers
            // =============================================================================
            {
                filename: 'runerush-pro-advanced-50-templates.zip',
                display_name: 'RuneRUSH PRO - 50 Advanced Templates',
                s3_key: 'pro/runerush-pro-advanced-50-templates.zip',
                file_size: 78643200, // 75MB
                content_type: 'application/zip',
                product_type: 'pro_bundle'
            },
            {
                filename: 'automation-mastery-video-course.zip',
                display_name: 'Automation Mastery Video Course (4+ Hours)',
                s3_key: 'pro/automation-mastery-video-course.zip',
                file_size: 1073741824, // 1GB
                content_type: 'application/zip',
                product_type: 'pro_bundle'
            },
            {
                filename: 'advanced-workflow-blueprints.zip',
                display_name: 'Advanced Workflow Blueprints & Strategies',
                s3_key: 'pro/advanced-workflow-blueprints.zip',
                file_size: 31457280, // 30MB
                content_type: 'application/zip',
                product_type: 'pro_bundle'
            },
            {
                filename: 'custom-node-collection.zip',
                display_name: 'Custom Node Collection & Extensions',
                s3_key: 'pro/custom-node-collection.zip',
                file_size: 20971520, // 20MB
                content_type: 'application/zip',
                product_type: 'pro_bundle'
            },
            {
                filename: 'pro-quickstart-checklist.pdf',
                display_name: 'PRO Quickstart Checklist & Roadmap',
                s3_key: 'pro/pro-quickstart-checklist.pdf',
                file_size: 3145728, // 3MB
                content_type: 'application/pdf',
                product_type: 'pro_bundle'
            },
            
            // =============================================================================
            // COMPLETE COLLECTION ($499) - Ultimate Bundle with Everything
            // =============================================================================
            {
                filename: 'runerush-complete-collection-mega-bundle.zip',
                display_name: 'RuneRUSH Complete Collection - 150+ Templates + All Bonuses',
                s3_key: 'complete/runerush-complete-collection-mega-bundle.zip',
                file_size: 2147483648, // 2GB
                content_type: 'application/zip',
                product_type: 'complete_collection'
            },
            {
                filename: 'master-automation-video-library.zip',
                display_name: 'Master Automation Video Library (10+ Hours)',
                s3_key: 'complete/master-automation-video-library.zip',
                file_size: 3221225472, // 3GB
                content_type: 'application/zip',
                product_type: 'complete_collection'
            },
            {
                filename: 'enterprise-workflow-blueprints.zip',
                display_name: 'Enterprise Workflow Blueprints & Strategies',
                s3_key: 'complete/enterprise-workflow-blueprints.zip',
                file_size: 104857600, // 100MB
                content_type: 'application/zip',
                product_type: 'complete_collection'
            },
            {
                filename: 'premium-node-collection-extended.zip',
                display_name: 'Premium Node Collection + Extensions',
                s3_key: 'complete/premium-node-collection-extended.zip',
                file_size: 52428800, // 50MB
                content_type: 'application/zip',
                product_type: 'complete_collection'
            },
            {
                filename: 'automation-mastery-playbook.pdf',
                display_name: 'Complete Automation Mastery Playbook (200+ Pages)',
                s3_key: 'complete/automation-mastery-playbook.pdf',
                file_size: 20971520, // 20MB
                content_type: 'application/pdf',
                product_type: 'complete_collection'
            },
            {
                filename: 'lifetime-updates-access-guide.pdf',
                display_name: 'Lifetime Updates & VIP Support Guide',
                s3_key: 'complete/lifetime-updates-access-guide.pdf',
                file_size: 5242880, // 5MB
                content_type: 'application/pdf',
                product_type: 'complete_collection'
            },
            
            // =============================================================================
            // LEGACY SUPPORT - Keep old product types for backward compatibility
            // =============================================================================
            {
                filename: 'legacy-main-bundle.zip',
                display_name: '[Legacy] Main Bundle',
                s3_key: 'core/runerush-core-50-templates.zip', // Same file as core
                file_size: 52428800, // 50MB
                content_type: 'application/zip',
                product_type: 'main' // For old customers
            },
            {
                filename: 'legacy-upsell-bundle.zip',
                display_name: '[Legacy] Upsell Bundle',
                s3_key: 'pro/runerush-pro-advanced-50-templates.zip', // Same file as pro
                file_size: 78643200, // 75MB
                content_type: 'application/zip',
                product_type: 'upsell' // For old customers
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
