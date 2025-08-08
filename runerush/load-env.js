#!/usr/bin/env node

/**
 * Environment Variable Loader
 * Safely loads environment variables from .env.local for development
 * 
 * Usage: 
 *   - Development: Uses .env.local
 *   - Production: Uses Railway/Netlify environment variables
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Determine which env file to use
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env' 
  : '.env.local';

const envPath = path.resolve(__dirname, envFile);

// Check if the file exists
if (fs.existsSync(envPath)) {
  console.log(`✅ Loading environment from: ${envFile}`);
  
  // Load the environment variables
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('❌ Error loading environment variables:', result.error);
    process.exit(1);
  }
  
  // Verify critical variables are loaded
  const requiredVars = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'SENDGRID_API_KEY',
    'JWT_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables loaded successfully');
  console.log('📊 Configuration:');
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Port: ${process.env.PORT || 3000}`);
  console.log(`   - Database: Connected to Railway PostgreSQL`);
  console.log(`   - Stripe: Live mode enabled`);
  console.log(`   - SendGrid: Configured for ${process.env.FROM_EMAIL}`);
  
} else {
  console.error(`❌ Environment file not found: ${envPath}`);
  console.error('Please create a .env.local file with your credentials');
  console.error('Copy .env.example to .env.local and fill in your values');
  process.exit(1);
}

// Export for use in other modules
module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  config: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    frontendUrl: process.env.FRONTEND_URL,
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d'
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucketName: process.env.S3_BUCKET_NAME
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    },
    rateLimiting: {
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW || '15')
    }
  }
};
