require('dotenv').config();
const db = require('../database/db');
const fs = require('fs');
const path = require('path');

async function seedFiles() {
    try {
        console.log('🚀 Starting file database seeding...');
        
        await db.connect();
        console.log('✅ Database connected');

        // Clear existing files (optional - remove if you want to keep existing files)
        await db.run('DELETE FROM files WHERE filename LIKE ?', ['RuneRUSH%']);
        console.log('🧹 Cleared existing RuneRUSH files');

        // File information based on your uploaded files
        const files = [
            {
                filename: 'RuneRUSH_Core_50_Social_Media_Ad_Templates.zip',
                display_name: 'RuneRUSH Core - 50 Social Media & Ad Templates',
                s3_key: 'templates/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip',
                file_size: 388 * 1024, // 388KB in bytes
                content_type: 'application/zip',
                product_type: 'core'
            },
            {
                filename: 'RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip',
                display_name: 'RuneRUSH Pro - 100 Templates (Core + Premium)',
                s3_key: 'templates/RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip',
                file_size: 682 * 1024, // 682KB in bytes
                content_type: 'application/zip',
                product_type: 'pro_bundle'
            },
            {
                filename: 'RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip',
                display_name: 'RuneRUSH Complete - 8000+ Templates (All Collections)',
                s3_key: 'templates/RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip',
                file_size: 34 * 1024 * 1024, // 34MB in bytes
                content_type: 'application/zip',
                product_type: 'complete_collection'
            }
        ];

        // Add files to database
        for (const file of files) {
            console.log(`📁 Adding ${file.display_name}...`);
            
            const result = await db.createFile(file);
            
            if (result.id) {
                console.log(`✅ Added file with ID: ${result.id}`);
            } else {
                console.log(`⚠️  File may already exist: ${file.filename}`);
            }
        }

        // Verify files were added
        const allFiles = await db.query('SELECT * FROM files WHERE is_active = TRUE ORDER BY product_type, filename');
        
        console.log('\n📊 Current files in database:');
        console.log('═'.repeat(80));
        
        allFiles.forEach(file => {
            const sizeMB = (file.file_size / (1024 * 1024)).toFixed(2);
            console.log(`📦 ${file.display_name}`);
            console.log(`   📄 File: ${file.filename}`);
            console.log(`   🗂️  S3 Key: ${file.s3_key}`);
            console.log(`   📊 Size: ${sizeMB}MB`);
            console.log(`   🏷️  Type: ${file.product_type}`);
            console.log(`   🆔 ID: ${file.id}`);
            console.log('');
        });

        console.log('✅ File seeding completed successfully!');
        console.log(`📈 Total files in database: ${allFiles.length}`);

        // Test the product type access logic
        console.log('\n🧪 Testing product access logic:');
        console.log('═'.repeat(50));
        
        const productTypes = ['core', 'pro_bundle', 'complete_collection'];
        
        for (const productType of productTypes) {
            const files = await db.getFilesByProductType(productType);
            console.log(`${productType.toUpperCase()}: ${files.length} files`);
        }

    } catch (error) {
        console.error('❌ Error seeding files:', error);
        process.exit(1);
    } finally {
        await db.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the seeding
seedFiles();
