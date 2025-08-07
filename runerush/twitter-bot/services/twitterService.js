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
        const mainText = `${emoji} Daily Template Drop: \"${template_name}\"\n\n${useCase}\n\n✨ ${nodes_count} nodes\n⭐ Quality: ${quality_score}/10\n\n${urgency}\n\nGet it: https://runeflow.xyz/daily/${accessToken}`;
        
        // Add hashtags if there's room (Twitter limit is 280 chars)
        let fullTweet = `${mainText}\n\n${hashtags}`;
        
        // Truncate if too long
        if (fullTweet.length > 280) {
            const availableSpace = 280 - mainText.length - 3; // -3 for \"...\"\n            if (availableSpace > 10) {\n                const truncatedHashtags = hashtags.substring(0, availableSpace) + '...';\n                fullTweet = `${mainText}\\n\\n${truncatedHashtags}`;\n            } else {\n                fullTweet = mainText;\n            }\n        }\n        \n        return fullTweet;\n    }\n\n    /**\n     * Generate a compelling use case description\n     */\n    generateUseCase(templateName, category) {\n        const useCases = {\n            'AI & Research': [\n                '🤖 Automate research workflows with AI',\n                '📊 Intelligent data analysis pipeline',\n                '🔍 AI-powered content discovery',\n                '💡 Smart research automation'\n            ],\n            'Business Process': [\n                '⚡ Streamline business operations',\n                '📈 Optimize workflow efficiency',\n                '🔄 Automate repetitive tasks',\n                '💼 Scale business processes'\n            ],\n            'Data Processing': [\n                '📊 Transform data automatically',\n                '🔄 Real-time data synchronization',\n                '📈 Analytics automation pipeline',\n                '💾 Smart data management'\n            ],\n            'Communication': [\n                '📱 Automate customer communications',\n                '📧 Smart messaging workflows',\n                '🤝 Enhance team collaboration',\n                '📢 Multi-channel notifications'\n            ],\n            'E-commerce': [\n                '🛒 Automate online store operations',\n                '📦 Streamline order processing',\n                '💰 Optimize pricing strategies',\n                '📊 Track sales performance'\n            ]\n        };\n\n        const categoryUseCases = useCases[category] || [\n            '⚡ Powerful automation workflow',\n            '🔄 Streamline your processes',\n            '💡 Smart automation solution',\n            '🚀 Boost productivity instantly'\n        ];\n\n        return categoryUseCases[Math.floor(Math.random() * categoryUseCases.length)];\n    }\n\n    /**\n     * Get category-specific emoji\n     */\n    getCategoryEmoji(category) {\n        const emojis = {\n            'AI & Research': '🤖',\n            'Business Process': '💼',\n            'Data Processing': '📊',\n            'Communication': '📱',\n            'E-commerce': '🛒',\n            'Marketing': '📢',\n            'Finance': '💰',\n            'Healthcare': '🏥',\n            'Education': '🎓',\n            'Social Media': '📱'\n        };\n        \n        return emojis[category] || '⚡';\n    }\n\n    /**\n     * Generate relevant hashtags\n     */\n    generateHashtags(category, templateName) {\n        let hashtags = ['#n8n', '#automation', '#nocode', '#runeflow'];\n        \n        // Add category-specific hashtags\n        const categoryTags = {\n            'AI & Research': ['#AI', '#research', '#chatbot'],\n            'Business Process': ['#business', '#workflow', '#productivity'],\n            'Data Processing': ['#data', '#analytics', '#ETL'],\n            'Communication': ['#communication', '#messaging', '#chatbot'],\n            'E-commerce': ['#ecommerce', '#sales', '#shopify'],\n            'Marketing': ['#marketing', '#leadgen', '#automation'],\n            'Finance': ['#fintech', '#accounting', '#invoicing']\n        };\n        \n        if (categoryTags[category]) {\n            hashtags = hashtags.concat(categoryTags[category]);\n        }\n        \n        // Add template-specific hashtags based on name\n        if (templateName.toLowerCase().includes('telegram')) hashtags.push('#telegram');\n        if (templateName.toLowerCase().includes('discord')) hashtags.push('#discord');\n        if (templateName.toLowerCase().includes('slack')) hashtags.push('#slack');\n        if (templateName.toLowerCase().includes('webhook')) hashtags.push('#webhook');\n        if (templateName.toLowerCase().includes('google')) hashtags.push('#google');\n        if (templateName.toLowerCase().includes('whatsapp')) hashtags.push('#whatsapp');\n        \n        return hashtags.slice(0, 8).join(' '); // Limit to 8 hashtags\n    }\n\n    /**\n     * Get tweet metrics for a specific tweet\n     */\n    async getTweetMetrics(tweetId) {\n        try {\n            const tweet = await this.readOnlyClient.v2.singleTweet(tweetId, {\n                'tweet.fields': ['public_metrics']\n            });\n            \n            return {\n                success: true,\n                metrics: tweet.data.public_metrics\n            };\n        } catch (error) {\n            console.error('Error getting tweet metrics:', error);\n            return {\n                success: false,\n                error: error.message\n            };\n        }\n    }\n\n    /**\n     * Test Twitter connection\n     */\n    async testConnection() {\n        try {\n            const user = await this.readOnlyClient.v2.me();\n            console.log('✅ Twitter connection successful:', user.data.username);\n            return { success: true, user: user.data };\n        } catch (error) {\n            console.error('❌ Twitter connection failed:', error);\n            return { success: false, error: error.message };\n        }\n    }\n}\n\nmodule.exports = TwitterService;"
