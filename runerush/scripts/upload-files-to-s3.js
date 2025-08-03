require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-2'
});

const bucketName = process.env.S3_BUCKET_NAME || 'runerush-downloads';

async function uploadFilesToS3() {
    console.log('🚀 Starting S3 file upload process...');
    console.log(`📦 Bucket: ${bucketName}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION}`);
    
    // Check if bucket exists
    try {
        await s3.headBucket({ Bucket: bucketName }).promise();
        console.log('✅ S3 bucket exists and is accessible');
    } catch (error) {
        console.error('❌ Cannot access S3 bucket:', error.message);
        console.log('💡 Make sure your bucket exists and IAM permissions are correct');
        return;
    }
    
    // Files to upload (update these paths to match your local files)
    const filesToUpload = [
        {
            localPath: './files/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip',
            s3Key: 'templates/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip',
            description: 'Core Bundle - 50 Templates'
        },
        {
            localPath: './files/RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip',
            s3Key: 'templates/RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip',
            description: 'Pro Bundle - 100 Templates'
        },
        {
            localPath: './files/RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip',
            s3Key: 'templates/RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip',
            description: 'Complete Collection - 8000+ Templates'
        }
    ];
    
    for (const file of filesToUpload) {
        try {
            console.log(`\n📤 Uploading: ${file.description}`);
            
            // Check if local file exists
            if (!fs.existsSync(file.localPath)) {
                console.log(`⚠️  Skipping ${file.localPath} - file not found locally`);
                continue;
            }
            
            // Read file
            const fileContent = fs.readFileSync(file.localPath);
            const fileSizeKB = (fileContent.length / 1024).toFixed(2);
            
            console.log(`   📊 Size: ${fileSizeKB} KB`);
            console.log(`   🗂️  S3 Key: ${file.s3Key}`);
            
            // Upload to S3
            const uploadParams = {
                Bucket: bucketName,
                Key: file.s3Key,
                Body: fileContent,
                ContentType: 'application/zip',
                ServerSideEncryption: 'AES256',
                Metadata: {
                    'original-filename': path.basename(file.localPath),
                    'upload-date': new Date().toISOString(),
                    'product-type': file.s3Key.includes('Core') ? 'core' : 
                                   file.s3Key.includes('Pro') ? 'pro_bundle' : 'complete_collection'
                }
            };
            
            const result = await s3.upload(uploadParams).promise();
            console.log(`   ✅ Uploaded successfully`);
            console.log(`   🔗 ETag: ${result.ETag}`);
            
        } catch (error) {
            console.error(`   ❌ Failed to upload ${file.localPath}:`, error.message);
        }
    }
    
    // Verify uploads
    console.log('\n🔍 Verifying uploaded files...');
    try {
        const listParams = {
            Bucket: bucketName,
            Prefix: 'templates/'
        };
        
        const objects = await s3.listObjectsV2(listParams).promise();
        
        console.log('\n📋 Current files in S3:');
        console.log('═'.repeat(60));
        
        objects.Contents.forEach(obj => {
            const sizeKB = (obj.Size / 1024).toFixed(2);
            console.log(`📁 ${obj.Key}`);
            console.log(`   📊 Size: ${sizeKB} KB`);
            console.log(`   📅 Modified: ${obj.LastModified.toISOString()}`);
            console.log('');
        });
        
        console.log(`✅ Total files in bucket: ${objects.Contents.length}`);
        
    } catch (error) {
        console.error('❌ Failed to list bucket contents:', error.message);
    }
}

async function testS3Access() {
    console.log('\n🧪 Testing S3 access and signed URL generation...');
    
    try {
        // Test generating a signed URL for the core file
        const testKey = 'templates/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip';
        
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: bucketName,
            Key: testKey,
            Expires: 3600, // 1 hour
            ResponseContentDisposition: 'attachment'
        });
        
        console.log('✅ Signed URL generation successful');
        console.log(`🔗 Test URL: ${signedUrl.substring(0, 100)}...`);
        
    } catch (error) {
        console.error('❌ Signed URL generation failed:', error.message);
    }
}

// Main execution
async function main() {
    try {
        await uploadFilesToS3();
        await testS3Access();
        
        console.log('\n🎉 S3 setup verification complete!');
        console.log('\n💡 Next steps:');
        console.log('   1. Ensure your files are uploaded to S3');
        console.log('   2. Update Railway environment variables');
        console.log('   3. Test the download system with a real purchase');
        
    } catch (error) {
        console.error('❌ S3 setup failed:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { uploadFilesToS3, testS3Access };
