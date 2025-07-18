#!/usr/bin/env node

/**
 * Test Twitter API Integration
 * Quick test to verify your API keys are working
 */

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function testTwitterAPI() {
    console.log('🐦 Testing Twitter API Integration...');
    console.log('==================================');
    
    // Check if API keys are configured
    const requiredKeys = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_SECRET'
    ];
    
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
        console.log('❌ Missing Twitter API keys:');
        missingKeys.forEach(key => console.log(`   - ${key}`));
        console.log('\n📝 Please add these keys to your .env file');
        return false;
    }
    
    console.log('✅ All required API keys found');
    
    try {
        // Initialize Twitter client
        const twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });
        
        // Test API access by getting user info
        console.log('🔍 Testing API access...');
        const user = await twitterClient.v2.me();
        
        console.log('✅ Twitter API Test Successful!');
        console.log(`📊 Connected as: @${user.data.username}`);
        console.log(`👤 Display name: ${user.data.name}`);
        console.log(`🆔 User ID: ${user.data.id}`);
        
        // Test tweet creation (dry run)
        const testTweet = `🧪 Testing RuneFlow Twitter automation system... 

This is a test tweet from the RuneFlow social media automation system.

System Status: ✅ OPERATIONAL
Time: ${new Date().toLocaleString()}

#RuneFlow #automation #test`;
        
        console.log('\n📝 Test tweet content:');
        console.log('-------------------------');
        console.log(testTweet);
        console.log('-------------------------');
        
        // Ask if user wants to post test tweet
        console.log('\n🤔 Would you like to post this test tweet?');
        console.log('   Run: node test-twitter.js --post');
        
        // Check for --post flag
        if (process.argv.includes('--post')) {
            console.log('\n🚀 Posting test tweet...');
            const tweet = await twitterClient.v2.tweet(testTweet);
            console.log('✅ Test tweet posted successfully!');
            console.log(`🔗 Tweet ID: ${tweet.data.id}`);
            console.log(`📱 View at: https://twitter.com/${user.data.username}/status/${tweet.data.id}`);
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Twitter API Test Failed!');
        console.log('Error details:', error.message);
        
        if (error.data) {
            console.log('API Response:', JSON.stringify(error.data, null, 2));
        }
        
        if (error.code === 401) {
            console.log('\n💡 401 Error - Authentication issue:');
            console.log('   - Invalid API keys or tokens');
            console.log('   - Check your credentials in .env file');
            console.log('   - Ensure your Twitter app has read/write permissions');
        } else if (error.code === 403) {
            console.log('\n💡 403 Error - Permission issue:');
            console.log('   - Your Twitter app needs "Read and Write" permissions');
            console.log('   - Go to: https://developer.twitter.com/en/portal/dashboard');
            console.log('   - Select your app → Settings → User authentication settings');
            console.log('   - Change permissions to "Read and Write"');
            console.log('   - You may need to regenerate your access tokens after changing permissions');
        }
        
        return false;
    }
}

// Run test
testTwitterAPI()
    .then(success => {
        if (success) {
            console.log('\n🎉 Twitter integration is ready!');
            console.log('🚀 You can now start the full system with: ./start.sh start');
        } else {
            console.log('\n🔧 Please fix the issues above and try again');
        }
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
    });
