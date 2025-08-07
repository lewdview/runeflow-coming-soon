require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

console.log('🚀 Manual Twitter Test for @runeflowplates');

async function postTestTweet() {
    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });

        const rwClient = client.readWrite;
        
        // Simple test tweet
        const testTweet = `🤖 Testing the RuneFlow Daily Template Bot! 

Preparing to launch daily n8n template drops - one template per day, available for 24 hours only! 

Stay tuned for automation magic ✨

#n8n #automation #nocode #runeflow #comingsoon`;
        
        console.log('Tweet to post:');
        console.log('---');
        console.log(testTweet);
        console.log('---');
        console.log(`Length: ${testTweet.length} characters`);
        
        // Uncomment the line below to actually post the tweet
        // const tweet = await rwClient.tweet(testTweet);
        
        console.log('\\n⚠️  Test tweet prepared but NOT posted yet.');
        console.log('To actually post, uncomment line 25 in this file and run again.');
        console.log('\\n✅ Bot is ready to go live!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

postTestTweet();
