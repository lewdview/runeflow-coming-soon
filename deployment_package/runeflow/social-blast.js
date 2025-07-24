#!/usr/bin/env node

/**
 * RuneFlow Social Media Automation Blast
 * Automated social media campaigns for maximum reach
 */

const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SocialMediaBlast {
    constructor() {
        this.twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        this.campaigns = this.loadCampaigns();
        this.hashtags = [
            '#n8n', '#automation', '#nocode', '#workflow', '#productivity',
            '#RuneFlow', '#AutomationMaster', '#ComingSoon', '#n8nTemplates',
            '#WorkflowAutomation', '#DigitalTransformation', '#TechLaunch'
        ];
    }

    loadCampaigns() {
        return {
            launch_announcement: [
                "🔥 The automation revolution is here! runeflow.xyz - where ancient power meets modern automation ᚦ Join the automation masters! #RuneFlow #n8n #automation",
                "⚡ Ancient power meets modern automation. runeflow.xyz awakens with 8,100+ battle-tested n8n runes. Get your FREE starter rune now! ᚱᚢᚾᛖ #AutomationMaster #n8n #RuneFlow",
                "🧙‍♂️ Calling all automation wizards! runeflow.xyz is the mystical n8n marketplace you've been waiting for. Founder benefits available NOW! ᚠᛚᚱ #n8n #automation #RuneFlow"
            ],
            milestone_posts: [
                "🎯 {count} automation masters have joined the RuneFlow revolution! The power grows stronger... #RuneFlow #n8n #automation",
                "⚡ {count} warriors gathered! The RuneFlow marketplace awakens with each new member. Join the ancient order of automation! #AutomationMaster #n8n",
                "🔥 {count} runes claimed! Each signup brings us closer to unleashing the full power of runeflow.xyz #RuneFlow #automation #n8n"
            ],
            product_highlights: [
                "🏆 8,100+ n8n templates ready for battle! AI & Research | Data Analysis | Email & Communication workflows available #n8n #automation #RuneFlow",
                "⚡ One-click deployment magic! RuneFlow templates are pre-configured and ready to deploy in 5 minutes. No more starting from scratch! #n8n #automation #productivity",
                "🎯 From rookie to master in minutes! RuneFlow templates handle everything from simple automations to complex enterprise workflows #AutomationMaster #n8n #RuneFlow"
            ],
            urgency_posts: [
                "⏰ LIMITED TIME: Blind Founder pricing $999 (normally $1,998) - Only 73 spots remaining! Lock in 50% off forever! #RuneFlow #automation #n8n",
                "🔥 LAST CHANCE: Founding member benefits end soon! Early access pricing + automation templates #RuneFlow #n8n #automation",
                "⚡ The countdown begins! RuneFlow launches in weeks, not months. Secure your spot before prices double! #RuneFlow #automation #n8n"
            ],
            social_proof: [
                "💬 'RuneFlow saved me 40+ hours of workflow building' - Beta tester review. Join the automation revolution! #RuneFlow #n8n #automation",
                "🎯 'These templates are insane! Finally, n8n workflows that actually work out of the box' - Early access member #AutomationMaster #n8n #RuneFlow",
                "⚡ 'I've been waiting for something like RuneFlow for years!' - Automation expert testimonial #RuneFlow #n8n #automation"
            ]
        };
    }

    async postToTwitter(content) {
        try {
            if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
                console.log('⚠️ Twitter API credentials not configured, skipping Twitter post');
                return null;
            }
            
            const tweet = await this.twitterClient.v2.tweet(content);
            console.log('✅ Twitter post successful:', tweet.data.id);
            return tweet;
        } catch (error) {
            console.error('❌ Twitter post failed:', error.message);
            return null; // Don't throw error, just return null
        }
    }

    async postToLinkedIn(content) {
        try {
            if (!process.env.LINKEDIN_ACCESS_TOKEN || !process.env.LINKEDIN_PERSON_ID) {
                console.log('⚠️ LinkedIn API credentials not configured, skipping LinkedIn post');
                return null;
            }
            
            const response = await axios.post(
                'https://api.linkedin.com/v2/ugcPosts',
                {
                    author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: {
                                text: content
                            },
                            shareMediaCategory: 'NONE'
                        }
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ LinkedIn post successful');
            return response.data;
        } catch (error) {
            console.error('❌ LinkedIn post failed:', error.response?.data || error.message);
            return null; // Don't throw error, just return null
        }
    }

    async postToFacebook(content) {
        try {
            if (!process.env.FACEBOOK_ACCESS_TOKEN || !process.env.FACEBOOK_PAGE_ID) {
                console.log('⚠️ Facebook API credentials not configured, skipping Facebook post');
                return null;
            }
            
            const response = await axios.post(
                `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
                {
                    message: content,
                    access_token: process.env.FACEBOOK_ACCESS_TOKEN
                }
            );
            console.log('✅ Facebook post successful');
            return response.data;
        } catch (error) {
            console.error('❌ Facebook post failed:', error.response?.data || error.message);
            return null; // Don't throw error, just return null
        }
    }

    async sendDiscordNotification(content) {
        try {
            if (!process.env.DISCORD_WEBHOOK_URL) return;
            
            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                content: `🚀 **RuneFlow Social Media Update**\n\n${content}`,
                username: 'RuneFlow Bot',
                avatar_url: 'https://runflow.webhalla.com/favicon.ico'
            });
            console.log('✅ Discord notification sent');
        } catch (error) {
            console.error('❌ Discord notification failed:', error);
        }
    }

    getRandomPost(category) {
        const posts = this.campaigns[category];
        return posts[Math.floor(Math.random() * posts.length)];
    }

    async executeBlast(campaignType = 'launch_announcement') {
        console.log(`🚀 Starting ${campaignType} social media blast...`);
        
        const post = this.getRandomPost(campaignType);
        const enhancedPost = this.enhancePost(post);
        
        const results = {
            twitter: null,
            linkedin: null,
            facebook: null,
            discord: null
        };
        
        try {
            // Twitter
            if (process.env.TWITTER_API_KEY) {
                results.twitter = await this.postToTwitter(enhancedPost);
                await this.delay(2000); // 2 second delay
            }
            
            // LinkedIn
            if (process.env.LINKEDIN_ACCESS_TOKEN) {
                results.linkedin = await this.postToLinkedIn(enhancedPost);
                await this.delay(2000);
            }
            
            // Facebook
            if (process.env.FACEBOOK_ACCESS_TOKEN) {
                results.facebook = await this.postToFacebook(enhancedPost);
                await this.delay(2000);
            }
            
            // Discord notification
            await this.sendDiscordNotification(`Social media blast completed: ${enhancedPost}`);
            
        } catch (error) {
            console.error('❌ Social media blast error:', error);
            await this.sendDiscordNotification(`❌ Social media blast failed: ${error.message}`);
        }
        
        // Log results
        this.logResults(campaignType, enhancedPost, results);
        
        return results;
    }

    enhancePost(post) {
        // Add current waitlist count if placeholder exists
        if (post.includes('{count}')) {
            const currentCount = this.getCurrentWaitlistCount();
            post = post.replace('{count}', currentCount);
        }
        
        // Add random hashtags
        const randomHashtags = this.hashtags
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .join(' ');
        
        // Add call-to-action
        const cta = '\n\n🔗 Join the revolution: https://runflow.webhalla.com';
        
        return post + cta;
    }

    getCurrentWaitlistCount() {
        try {
            const analyticsPath = path.join(__dirname, '..', 'data', 'analytics.json');
            if (fs.existsSync(analyticsPath)) {
                const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
                return analytics.totalSignups || 847;
            }
        } catch (error) {
            console.error('Error reading analytics:', error);
        }
        return 847; // Default count
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logResults(campaignType, content, results) {
        const logData = {
            timestamp: new Date().toISOString(),
            campaignType,
            content,
            results,
            success: Object.values(results).some(r => r !== null)
        };
        
        const logPath = path.join(__dirname, '..', 'data', 'social-media-log.json');
        
        let logs = [];
        if (fs.existsSync(logPath)) {
            logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        }
        
        logs.push(logData);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }
        
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        
        console.log(`📊 Social media blast logged: ${campaignType}`);
    }

    async runScheduledCampaign() {
        const now = new Date();
        const hour = now.getHours();
        
        // Different campaigns at different times
        let campaignType;
        if (hour >= 9 && hour <= 11) {
            campaignType = 'launch_announcement';
        } else if (hour >= 12 && hour <= 14) {
            campaignType = 'product_highlights';
        } else if (hour >= 15 && hour <= 17) {
            campaignType = 'social_proof';
        } else if (hour >= 18 && hour <= 20) {
            campaignType = 'urgency_posts';
        } else {
            campaignType = 'milestone_posts';
        }
        
        return await this.executeBlast(campaignType);
    }
}

// CLI usage
if (require.main === module) {
    const blast = new SocialMediaBlast();
    const campaignType = process.argv[2] || 'launch_announcement';
    
    blast.executeBlast(campaignType)
        .then(results => {
            console.log('🎉 Social media blast completed!');
            console.log('Results:', JSON.stringify(results, null, 2));
        })
        .catch(error => {
            console.error('💥 Social media blast failed:', error);
            process.exit(1);
        });
}

module.exports = SocialMediaBlast;
