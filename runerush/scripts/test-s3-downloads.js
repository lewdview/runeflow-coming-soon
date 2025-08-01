require('dotenv').config();
const s3Service = require('../services/s3');
const db = require('../database/db');

async function testS3Downloads() {
    try {
        console.log('🧪 Testing S3 Downloads System...');
        console.log('═'.repeat(60));
        
        await db.connect();
        
        // 1. Test S3 Configuration
        console.log('1️⃣ Testing S3 Configuration:');
        console.log(`   🪣 Bucket: ${process.env.S3_BUCKET_NAME || '❌ Not set'}`);
        console.log(`   🗝️  Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set'}`);
        console.log(`   🔒 Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set'}`);
        console.log(`   🌍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
        console.log('');

        // 2. Check if files exist in S3
        console.log('2️⃣ Checking S3 File Existence:');
        const testFiles = [
            'templates/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip',
            'templates/RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip',
            'templates/RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip'
        ];

        for (const file of testFiles) {
            try {
                const exists = await s3Service.fileExists(file);
                console.log(`   ${exists ? '✅' : '❌'} ${file}`);
                
                if (exists) {
                    const metadata = await s3Service.getFileMetadata(file);
                    const sizeMB = (metadata.size / (1024 * 1024)).toFixed(2);
                    console.log(`      📊 Size: ${sizeMB}MB | Type: ${metadata.contentType}`);
                }
            } catch (error) {
                console.log(`   ❌ ${file} - Error: ${error.message}`);
            }
        }
        console.log('');

        // 3. Test signed URL generation
        console.log('3️⃣ Testing Signed URL Generation:');
        try {
            const testKey = 'templates/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip';
            const signedUrl = await s3Service.generateSignedUrl(testKey, 300); // 5 minutes
            console.log(`   ✅ Generated signed URL (5 min expiry)`);
            console.log(`   🔗 URL: ${signedUrl.substring(0, 100)}...`);
        } catch (error) {
            console.log(`   ❌ Failed to generate signed URL: ${error.message}`);
        }
        console.log('');

        // 4. Test database file records
        console.log('4️⃣ Testing Database File Records:');
        const dbFiles = await db.query('SELECT * FROM files WHERE is_active = 1');
        console.log(`   📦 Files in database: ${dbFiles.length}`);
        
        if (dbFiles.length === 0) {
            console.log('   ⚠️  No files found in database. Run: node scripts/seed-files.js');
        } else {
            dbFiles.forEach(file => {
                console.log(`   📄 ${file.display_name} (${file.product_type})`);
            });
        }
        console.log('');

        // 5. Test user access simulation
        console.log('5️⃣ Testing User Access Logic:');
        const testUsers = await db.query('SELECT * FROM users LIMIT 3');
        
        if (testUsers.length === 0) {
            console.log('   ⚠️  No users found in database for testing');
        } else {
            for (const user of testUsers.slice(0, 1)) { // Test first user only
                console.log(`   👤 Testing user: ${user.email} (${user.license_key})`);
                
                try {
                    const userFiles = await s3Service.getUserDownloadableFiles(
                        user.id,
                        '127.0.0.1',
                        'Test-Agent/1.0'
                    );
                    
                    console.log(`   📦 Available files: ${userFiles.length}`);
                    userFiles.forEach(file => {
                        console.log(`      - ${file.display_name} (${file.product_type})`);
                    });
                } catch (error) {
                    console.log(`   ❌ Error getting user files: ${error.message}`);
                }
            }
        }
        console.log('');

        // 6. Test environment variables
        console.log('6️⃣ Environment Variables Check:');
        const requiredVars = [
            'S3_BUCKET_NAME',
            'AWS_ACCESS_KEY_ID', 
            'AWS_SECRET_ACCESS_KEY',
            'AWS_REGION',
            'FRONTEND_URL',
            'MAX_DOWNLOADS_PER_IP',
            'DOWNLOAD_TOKEN_EXPIRY'
        ];

        requiredVars.forEach(varName => {
            const value = process.env[varName];
            console.log(`   ${value ? '✅' : '❌'} ${varName}: ${value || 'Not set'}`);
        });

        console.log('');
        console.log('🎉 S3 Download System Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.close();
    }
}

// Run the test
testS3Downloads();
