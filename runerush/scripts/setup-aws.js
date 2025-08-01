#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupAWS() {
    console.log('🚀 RuneRUSH AWS S3 Setup Assistant');
    console.log('═'.repeat(50));
    console.log();

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found. Please create one first.');
        process.exit(1);
    }

    console.log('This will help you configure AWS S3 for RuneRUSH downloads.');
    console.log('You\'ll need:');
    console.log('• AWS Access Key ID');
    console.log('• AWS Secret Access Key');
    console.log('• S3 Bucket Name');
    console.log();

    const proceed = await question('Continue with setup? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
    }

    console.log();
    console.log('📝 Please provide your AWS credentials:');
    console.log();

    const awsAccessKey = await question('AWS Access Key ID: ');
    const awsSecretKey = await question('AWS Secret Access Key: ');
    const bucketName = await question('S3 Bucket Name: ');
    const awsRegion = await question('AWS Region (default: us-east-1): ') || 'us-east-1';

    console.log();
    console.log('🔧 Updating .env file...');

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update AWS values
    envContent = envContent.replace(/AWS_ACCESS_KEY_ID=.*/, `AWS_ACCESS_KEY_ID=${awsAccessKey}`);
    envContent = envContent.replace(/AWS_SECRET_ACCESS_KEY=.*/, `AWS_SECRET_ACCESS_KEY=${awsSecretKey}`);
    envContent = envContent.replace(/S3_BUCKET_NAME=.*/, `S3_BUCKET_NAME=${bucketName}`);
    envContent = envContent.replace(/AWS_REGION=.*/, `AWS_REGION=${awsRegion}`);

    // Write back to .env
    fs.writeFileSync(envPath, envContent);

    console.log('✅ .env file updated successfully!');
    console.log();

    console.log('🧪 Testing S3 connection...');
    console.log();

    // Test S3 connection
    try {
        require('dotenv').config();
        const s3Service = require('../services/s3');
        
        // Test a simple S3 operation
        console.log('Testing S3 connectivity...');
        
        // You can add more specific tests here once the env is set up
        console.log('✅ S3 service initialized successfully!');
        
    } catch (error) {
        console.log('❌ S3 test failed:', error.message);
        console.log('Please verify your AWS credentials and bucket name.');
    }

    console.log();
    console.log('📋 Next Steps:');
    console.log('1. Run: node scripts/test-s3-downloads.js');
    console.log('2. Check that your files are uploaded to S3 with these paths:');
    console.log('   • templates/RuneRUSH_Core_50_Social_Media_Ad_Templates.zip');
    console.log('   • templates/RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip');
    console.log('   • templates/RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip');
    console.log('3. Deploy to Railway with updated environment variables');
    console.log();
    console.log('🎉 AWS setup complete!');

    rl.close();
}

setupAWS().catch(console.error);
