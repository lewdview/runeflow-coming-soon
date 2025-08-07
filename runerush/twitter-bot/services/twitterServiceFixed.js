const { TwitterApi } = require('twitter-api-v2');

class TwitterService {
    constructor() {
        this.client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });

        this.readOnlyClient = this.client.readOnly;
        this.rwClient = this.client.readWrite;
    }

    /**
     * Post a tweet about the daily template
     */
    async postDailyTemplate(templateData, accessToken) {
        try {
            const tweetText = this.generateTweetText(templateData, accessToken);
            
            console.log('Posting tweet:', tweetText);
            
            const tweet = await this.rwClient.tweet(tweetText);
            
            return {
                success: true,
                tweetId: tweet.data.id,
                tweetText: tweetText,
                tweet: tweet.data
            };
        } catch (error) {
            console.error('Error posting tweet:', error);
            return {
                success: false,
                error: error.message,
                tweetText: null
            };
        }
    }

    /**
     * Generate engaging tweet text for the daily template
     */
    generateTweetText(templateData, accessToken) {
        const { template_name, category, nodes_count, quality_score } = templateData;
        
        // Generate use case description based on category and name
        const useCase = this.generateUseCase(template_name, category);
        
        // Create engaging tweet components
        const emoji = this.getCategoryEmoji(category);
        const hashtags = this.generateHashtags(category, template_name);
        const urgency = "⏰ Available for TODAY ONLY!";
        
        // Main tweet text
        const mainText = `${emoji} Daily Template Drop: "${template_name}"

${useCase}

✨ ${nodes_count} nodes
⭐ Quality: ${quality_score}/10

${urgency}

Get it: https://runeflow.xyz/daily/${accessToken}`;
        
        // Add hashtags if there's room (Twitter limit is 280 chars)
        let fullTweet = `${mainText}

${hashtags}`;
        
        // Truncate if too long
        if (fullTweet.length > 280) {
            const availableSpace = 280 - mainText.length - 3; // -3 for "..."
            if (availableSpace > 10) {
                const truncatedHashtags = hashtags.substring(0, availableSpace) + '...';
                fullTweet = `${mainText}

${truncatedHashtags}`;
            } else {
                fullTweet = mainText;
            }
        }
        
        return fullTweet;
    }

    /**
     * Generate a compelling use case description
     */
    generateUseCase(templateName, category) {
        const useCases = {
            'AI & Research': [
                '🤖 Automate research workflows with AI',
                '📊 Intelligent data analysis pipeline',
                '🔍 AI-powered content discovery',
                '💡 Smart research automation'
            ],
            'Business Process': [
                '⚡ Streamline business operations',
                '📈 Optimize workflow efficiency',
                '🔄 Automate repetitive tasks',
                '💼 Scale business processes'
            ],
            'Data Processing': [
                '📊 Transform data automatically',
                '🔄 Real-time data synchronization',
                '📈 Analytics automation pipeline',
                '💾 Smart data management'
            ],
            'Communication': [
                '📱 Automate customer communications',
                '📧 Smart messaging workflows',
                '🤝 Enhance team collaboration',
                '📢 Multi-channel notifications'
            ],
            'E-commerce': [
                '🛒 Automate online store operations',
                '📦 Streamline order processing',
                '💰 Optimize pricing strategies',
                '📊 Track sales performance'
            ]
        };

        const categoryUseCases = useCases[category] || [
            '⚡ Powerful automation workflow',
            '🔄 Streamline your processes',
            '💡 Smart automation solution',
            '🚀 Boost productivity instantly'
        ];

        return categoryUseCases[Math.floor(Math.random() * categoryUseCases.length)];
    }

    /**
     * Get category-specific emoji
     */
    getCategoryEmoji(category) {
        const emojis = {
            'AI & Research': '🤖',
            'Business Process': '💼',
            'Data Processing': '📊',
            'Communication': '📱',
            'E-commerce': '🛒',
            'Marketing': '📢',
            'Finance': '💰',
            'Healthcare': '🏥',
            'Education': '🎓',
            'Social Media': '📱'
        };
        
        return emojis[category] || '⚡';
    }

    /**
     * Generate relevant hashtags
     */
    generateHashtags(category, templateName) {
        let hashtags = ['#n8n', '#automation', '#nocode', '#runeflow'];
        
        // Add category-specific hashtags
        const categoryTags = {
            'AI & Research': ['#AI', '#research', '#chatbot'],
            'Business Process': ['#business', '#workflow', '#productivity'],
            'Data Processing': ['#data', '#analytics', '#ETL'],
            'Communication': ['#communication', '#messaging', '#chatbot'],
            'E-commerce': ['#ecommerce', '#sales', '#shopify'],
            'Marketing': ['#marketing', '#leadgen', '#automation'],
            'Finance': ['#fintech', '#accounting', '#invoicing']
        };
        
        if (categoryTags[category]) {
            hashtags = hashtags.concat(categoryTags[category]);
        }
        
        // Add template-specific hashtags based on name
        if (templateName.toLowerCase().includes('telegram')) hashtags.push('#telegram');
        if (templateName.toLowerCase().includes('discord')) hashtags.push('#discord');
        if (templateName.toLowerCase().includes('slack')) hashtags.push('#slack');
        if (templateName.toLowerCase().includes('webhook')) hashtags.push('#webhook');
        if (templateName.toLowerCase().includes('google')) hashtags.push('#google');
        if (templateName.toLowerCase().includes('whatsapp')) hashtags.push('#whatsapp');
        
        return hashtags.slice(0, 8).join(' '); // Limit to 8 hashtags
    }

    /**
     * Get tweet metrics for a specific tweet
     */
    async getTweetMetrics(tweetId) {
        try {
            const tweet = await this.readOnlyClient.v2.singleTweet(tweetId, {
                'tweet.fields': ['public_metrics']
            });
            
            return {
                success: true,
                metrics: tweet.data.public_metrics
            };
        } catch (error) {
            console.error('Error getting tweet metrics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Test Twitter connection
     */
    async testConnection() {
        try {
            const user = await this.readOnlyClient.v2.me();
            console.log('✅ Twitter connection successful:', user.data.username);
            return { success: true, user: user.data };
        } catch (error) {
            console.error('❌ Twitter connection failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = TwitterService;
