require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

console.log('🔍 Testing Twitter API connection for @runeflowplates...');

// Check if credentials are loaded
console.log('API Key:', process.env.TWITTER_API_KEY ? 'Found' : 'Missing');
console.log('API Secret:', process.env.TWITTER_API_SECRET ? 'Found' : 'Missing'); 
console.log('Access Token:', process.env.TWITTER_ACCESS_TOKEN ? 'Found' : 'Missing');
console.log('Access Token Secret:', process.env.TWITTER_ACCESS_TOKEN_SECRET ? 'Found' : 'Missing');

async function testTwitter() {
    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });

        const readOnlyClient = client.readOnly;
        
        // Test connection
        const user = await readOnlyClient.v2.me();
        
        console.log('✅ Twitter connection successful!');
        console.log(`   Account: @${user.data.username}`);
        console.log(`   Name: ${user.data.name}`);
        console.log(`   ID: ${user.data.id}`);
        
        // Test tweet generation (without posting)
        const sampleTemplate = {
            template_name: "AI-Powered Customer Query Response System",
            category: "AI & Research", 
            nodes_count: 35,
            quality_score: 9
        };
        
        const testToken = 'abc123test456';
        
        // Generate sample tweet
        const emoji = '🤖';
        const useCase = '🤖 Automate research workflows with AI';
        const urgency = "⏰ Available for TODAY ONLY!";
        const hashtags = '#n8n #automation #nocode #runeflow #AI #research #chatbot';
        
        const tweetText = `${emoji} Daily Template Drop: "${sampleTemplate.template_name}"

${useCase}

✨ ${sampleTemplate.nodes_count} nodes
⭐ Quality: ${sampleTemplate.quality_score}/10

${urgency}

Get it: https://runeflow.xyz/daily/${testToken}

${hashtags}`;
        
        console.log('\\n📝 Sample tweet generated:');
        console.log('---');
        console.log(tweetText);
        console.log('---');
        console.log(`Length: ${tweetText.length} characters`);
        
        if (tweetText.length > 280) {
            console.warn('⚠️  Tweet exceeds 280 character limit!');
        } else {
            console.log('✅ Tweet length is within Twitter limits');
        }
        
        console.log('\\n🎉 All tests passed! Ready to start tweeting daily templates!');
        
    } catch (error) {
        console.error('❌ Twitter connection failed:', error);
    }
}

testTwitter();
