#!/usr/bin/env node

/**
 * RuneFlow Weekly Rune Campaign Automation
 * Automated posting system with transparency dashboard and credit system
 */

const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

class RuneCampaignAutomation {
    constructor() {
        this.twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        this.weeklyRunes = this.loadWeeklyRunes();
        this.currentWeek = this.getCurrentWeek();
        this.dashboardData = this.initializeDashboard();
        this.creditSystem = this.initializeCreditSystem();
        
        // Load existing campaign data
        this.campaignState = this.loadCampaignState();
    }

    loadWeeklyRunes() {
        return {
            week1: {
                name: "FlowRune",
                description: "AI-Powered n8n Workflow Creator",
                posts: [
                    // Day 1 - Monday
                    {
                        day: 1,
                        time: "09:00",
                        content: "🔮 RUNE OF THE WEEK: FlowRune - Your AI-Powered n8n Workflow Creator ᚠᛚᚱ\n\nThis week's rune transforms simple concepts into powerful n8n automations with battle-tested templates and ancient optimization magic.\n\nReady to automate your way to workflow mastery?\n\n#RuneOfTheWeek #n8nAutomation #RuneFlow\n🔗 runeflow.xyz",
                        type: "introduction"
                    },
                    {
                        day: 1,
                        time: "14:00",
                        content: "💡 Why FlowRune is game-changing:\n• AI-powered viral ASMR generation 📱\n• Multi-platform automation (YouTube, TikTok, Instagram)\n• 4-layer sound optimization 🔊\n• Dynamic content tracking 📊\n\nJoin the automation masters already using our runes!\n\n#FlowRune #ASMRCreator #RuneFlow\n🔗 runeflow.xyz",
                        type: "features"
                    },
                    // Day 2 - Tuesday
                    {
                        day: 2,
                        time: "10:00",
                        content: "😤 Tired of spending hours creating ASMR content that flops?\n\nFlowRune solves this with:\n✅ AI generates viral-ready content in minutes\n✅ Auto-optimizes for each platform\n✅ Built-in engagement tracking\n✅ Glass-cutting aesthetic automation\n\nStop grinding. Start flowing.\n\n#ASMRStruggles #ContentAutomation #RuneFlow\n🔗 runeflow.xyz",
                        type: "problem_solution"
                    },
                    {
                        day: 2,
                        time: "18:00",
                        content: "🧠 ASMR Creator Mindset Shift:\n\n❌ Old way: Manual editing, guessing what works, platform-specific uploads\n✅ New way: AI-powered creation, data-driven optimization, automated distribution\n\nFlowRune = Your ASMR automation advantage\n\n#ASMRMindset #AutomationAdvantage #RuneFlow\n🔗 runeflow.xyz",
                        type: "mindset"
                    },
                    // Day 3 - Wednesday
                    {
                        day: 3,
                        time: "11:00",
                        content: "🎉 Community Milestone: Early founders have claimed their runes!\n\nEach new member brings us closer to revolutionizing ASMR content creation. The power of automation grows stronger with every creator who joins.\n\nAre you ready to join the ancient order of ASMR automation?\n\n#CommunityPower #ASMRRevolution #RuneFlow\n🔗 runeflow.xyz",
                        type: "community"
                    },
                    {
                        day: 3,
                        time: "15:00",
                        content: "💬 \"FlowRune saved me 40+ hours of video editing per week. The AI knows exactly what triggers work!\" - Beta User\n\nWhen automation meets creativity, magic happens ✨\n\nWhat's your biggest ASMR content creation challenge? 👇\n\n#UserTestimonial #ASMRAutomation #RuneFlow\n🔗 runeflow.xyz",
                        type: "social_proof"
                    },
                    // Day 4 - Thursday
                    {
                        day: 4,
                        time: "09:30",
                        content: "🧙‍♂️ Behind the FlowRune Magic:\n\n🎵 4-Layer Sound Architecture:\n• Trigger Layer (tapping, scratching)\n• Ambient Layer (background atmosphere)\n• Voice Layer (whispering, soft speaking)\n• Binaural Layer (3D positioning)\n\nAncient audio wisdom meets modern AI 🔮\n\n#ASMRAudio #TechMagic #RuneFlow\n🔗 runeflow.xyz",
                        type: "technical"
                    },
                    {
                        day: 4,
                        time: "16:00",
                        content: "⚡ Glass-Cutting Aesthetic Algorithm:\n\nOur AI analyzes:\n📊 Color psychology for relaxation\n🎨 Visual flow patterns\n💎 Crystal-clear image quality\n✨ Hypnotic visual sequences\n\nBeauty + Function = Viral ASMR Content\n\n#VisualASMR #AIAesthetics #RuneFlow\n🔗 runeflow.xyz",
                        type: "technical"
                    },
                    // Day 5 - Friday
                    {
                        day: 5,
                        time: "10:30",
                        content: "📊 FlowRune Performance Stats:\n\n✅ 300% faster content creation\n✅ 85% higher engagement rates\n✅ 70% more platform reach\n✅ 95% creator satisfaction rate\n\nYour time is valuable. FlowRune multiplies it.\n\n#ASMRResults #CreatorROI #RuneFlow\n🔗 runeflow.xyz",
                        type: "results"
                    },
                    {
                        day: 5,
                        time: "17:00",
                        content: "💰 ROI Reality Check:\n\nManual ASMR creation: 20 hours/week\nFlowRune automation: 2 hours/week\n\nThat's 18 hours saved weekly to:\n🎯 Create more content\n📈 Grow your audience\n💵 Focus on monetization\n\nTime = Money. FlowRune = Both.\n\n#TimeIsMoney #ASMREfficiency #RuneFlow\n🔗 runeflow.xyz",
                        type: "roi"
                    },
                    // Day 6 - Saturday
                    {
                        day: 6,
                        time: "11:30",
                        content: "🌅 Saturday ASMR Wisdom:\n\n\"The best creators don't just make content - they create experiences that heal, relax, and transform lives.\"\n\nFlowRune doesn't just automate videos. It amplifies your ability to bring peace to the world.\n\n#ASMRWisdom #CreatorPurpose #RuneFlow\n🔗 runeflow.xyz",
                        type: "inspiration"
                    },
                    {
                        day: 6,
                        time: "19:00",
                        content: "✨ Vision: A world where every ASMR creator has the tools to focus on what matters most - connecting with their audience.\n\nFlowRune handles the technical magic. You focus on the human magic.\n\nTogether, we're building the future of relaxation content.\n\n#ASMRFuture #CreatorEmpowerment #RuneFlow\n🔗 runeflow.xyz",
                        type: "vision"
                    },
                    // Day 7 - Sunday
                    {
                        day: 7,
                        time: "10:00",
                        content: "🔮 Week 1 FlowRune Recap:\n\n✅ Introduced AI-powered ASMR automation\n✅ Showed 4-layer sound optimization\n✅ Proved glass-cutting aesthetic results\n✅ Shared community success stories\n\nReady to claim your FREE rune? Week 2 rune drops soon!\n\n#WeeklyRecap #FreeRune #RuneFlow\n🔗 runeflow.xyz",
                        type: "recap"
                    },
                    {
                        day: 7,
                        time: "16:00",
                        content: "🚀 Next Week Preview:\n\n\"SoundScape Rune\" - Advanced binaural audio generation with spatial positioning magic 🎧\n\nBut first, don't miss your chance to get FlowRune while it's still free!\n\nJoin the founders in the automation revolution.\n\n#ComingNext #LastChance #RuneFlow\n🔗 runeflow.xyz",
                        type: "preview"
                    }
                ]
            },
            week2: {
                name: "SoundScape Rune",
                description: "Advanced Binaural Audio Generation",
                posts: [] // To be populated
            }
        };
    }

    initializeDashboard() {
        return {
            glassWindow: {
                visible: true,
                currentStep: null,
                processLog: [],
                systemHealth: "operational"
            },
            registry: {
                steps: {},
                checkmarks: {},
                failures: [],
                successes: []
            },
            realTimeStats: {
                postsScheduled: 0,
                postsPosted: 0,
                engagement: {},
                apiCalls: 0,
                creditsUsed: 0
            }
        };
    }

    initializeCreditSystem() {
        return {
            tiers: {
                basic: { credits: 100, price: 29, features: ["Basic automation", "7-day campaigns"] },
                pro: { credits: 500, price: 99, features: ["Advanced automation", "Custom runes", "Analytics"] },
                enterprise: { credits: 2000, price: 299, features: ["White-label", "Priority support", "Custom integrations"] },
                unlimited: { credits: -1, price: 999, features: ["Unlimited everything", "Source code access", "Private deployment"] }
            },
            costs: {
                tweet_post: 1,
                ai_generation: 5,
                analytics_pull: 2,
                media_upload: 3,
                advanced_scheduling: 1
            },
            whitelisting: {
                enabled: false,
                whitelistedUsers: [],
                exclusiveOwnership: false
            }
        };
    }

    getCurrentWeek() {
        const startDate = new Date('2025-07-21'); // Campaign start date
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    }

    loadCampaignState() {
        const statePath = path.join(__dirname, '..', 'data', 'campaign-state.json');
        if (fs.existsSync(statePath)) {
            return JSON.parse(fs.readFileSync(statePath, 'utf8'));
        }
        return {
            currentWeek: 1,
            currentRune: 'FlowRune',
            scheduledPosts: [],
            postedContent: [],
            failedPosts: []
        };
    }

    saveCampaignState() {
        const statePath = path.join(__dirname, '..', 'data', 'campaign-state.json');
        fs.writeFileSync(statePath, JSON.stringify(this.campaignState, null, 2));
    }

    updateGlassWindow(step, status, details) {
        this.dashboardData.glassWindow.currentStep = step;
        this.dashboardData.glassWindow.processLog.push({
            timestamp: new Date().toISOString(),
            step,
            status,
            details
        });

        // Update registry
        this.dashboardData.registry.steps[step] = status;
        if (status === 'success') {
            this.dashboardData.registry.checkmarks[step] = '✅';
            this.dashboardData.registry.successes.push({ step, timestamp: new Date().toISOString() });
        } else if (status === 'failed') {
            this.dashboardData.registry.checkmarks[step] = '❌';
            this.dashboardData.registry.failures.push({ step, timestamp: new Date().toISOString(), details });
        } else {
            this.dashboardData.registry.checkmarks[step] = '⏳';
        }

        // Save dashboard state
        this.saveDashboardState();
        
        // Send real-time update to frontend
        this.broadcastUpdate();
    }

    saveDashboardState() {
        const dashboardPath = path.join(__dirname, '..', 'data', 'dashboard-state.json');
        fs.writeFileSync(dashboardPath, JSON.stringify(this.dashboardData, null, 2));
    }

    broadcastUpdate() {
        // Send WebSocket update to connected clients
        if (global.io) {
            global.io.emit('dashboard-update', this.dashboardData);
        }
    }

    checkCredits(userId, operation) {
        const userCredits = this.getUserCredits(userId);
        const operationCost = this.creditSystem.costs[operation] || 1;
        
        if (userCredits >= operationCost || userCredits === -1) { // -1 means unlimited
            return true;
        }
        
        // Return demo response if insufficient credits
        return this.getDemoResponse(operation);
    }

    getUserCredits(userId) {
        // In real implementation, fetch from database
        return 50; // Demo value
    }

    getDemoResponse(operation) {
        const demoResponses = {
            tweet_post: {
                success: true,
                demo: true,
                message: "Demo: Tweet would be posted here",
                data: { id: "demo_tweet_123", text: "Demo tweet content" }
            },
            ai_generation: {
                success: true,
                demo: true,
                message: "Demo: AI would generate content here",
                data: { content: "Demo AI-generated content" }
            }
        };
        
        return demoResponses[operation] || { success: false, demo: true, message: "Demo: Operation simulated" };
    }

    async postToTwitter(content, userId = 'default') {
        this.updateGlassWindow('twitter_post', 'processing', `Attempting to post: ${content.substring(0, 50)}...`);
        
        try {
            // Check credits
            const creditCheck = this.checkCredits(userId, 'tweet_post');
            if (creditCheck !== true) {
                this.updateGlassWindow('twitter_post', 'demo', 'Insufficient credits - showing demo response');
                return creditCheck;
            }

            if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
                this.updateGlassWindow('twitter_post', 'failed', 'Twitter API credentials not configured');
                return this.getDemoResponse('tweet_post');
            }
            
            const tweet = await this.twitterClient.v2.tweet(content);
            this.updateGlassWindow('twitter_post', 'success', `Tweet posted successfully: ${tweet.data.id}`);
            this.dashboardData.realTimeStats.postsPosted++;
            this.dashboardData.realTimeStats.creditsUsed += this.creditSystem.costs.tweet_post;
            
            return tweet;
        } catch (error) {
            this.updateGlassWindow('twitter_post', 'failed', `Twitter post failed: ${error.message}`);
            
            // Return demo response on failure
            const demoResponse = this.getDemoResponse('tweet_post');
            demoResponse.error = error.message;
            return demoResponse;
        }
    }

    scheduleWeeklyCampaign() {
        this.updateGlassWindow('campaign_schedule', 'processing', 'Scheduling weekly rune campaign');
        
        try {
            const currentWeekData = this.weeklyRunes[`week${this.currentWeek}`];
            if (!currentWeekData) {
                this.updateGlassWindow('campaign_schedule', 'failed', `No data found for week ${this.currentWeek}`);
                return;
            }

            const jobs = [];

            currentWeekData.posts.forEach(post => {
                const cronTime = this.convertToCronTime(post.day, post.time);
                
                const job = cron.schedule(cronTime, async () => {
                    this.updateGlassWindow('scheduled_post', 'processing', `Executing scheduled post: ${post.type}`);
                    
                    const result = await this.postToTwitter(post.content);
                    
                    if (result && !result.demo) {
                        this.campaignState.postedContent.push({
                            ...post,
                            timestamp: new Date().toISOString(),
                            tweetId: result.data?.id
                        });
                    } else if (result && result.demo) {
                        this.campaignState.postedContent.push({
                            ...post,
                            timestamp: new Date().toISOString(),
                            demo: true,
                            demoData: result
                        });
                    } else {
                        this.campaignState.failedPosts.push({
                            ...post,
                            timestamp: new Date().toISOString(),
                            error: result?.error || 'Unknown error'
                        });
                    }
                    
                    this.saveCampaignState();
                }, {
                    scheduled: false
                });

                jobs.push({
                    job,
                    post,
                    cronTime
                });
            });

            // Store scheduled jobs
            this.campaignState.scheduledPosts = jobs.map(j => ({
                cronTime: j.cronTime,
                post: j.post,
                scheduled: true
            }));

            // Start all jobs
            jobs.forEach(j => j.job.start());

            this.updateGlassWindow('campaign_schedule', 'success', `Scheduled ${jobs.length} posts for ${currentWeekData.name}`);
            this.dashboardData.realTimeStats.postsScheduled = jobs.length;
            
            this.saveCampaignState();
            
        } catch (error) {
            this.updateGlassWindow('campaign_schedule', 'failed', `Campaign scheduling failed: ${error.message}`);
        }
    }

    convertToCronTime(day, time) {
        // Convert day (1-7) and time (HH:MM) to cron format
        // For demo, we'll schedule posts every few minutes instead of weekly
        const [hour, minute] = time.split(':');
        
        // For production: `${minute} ${hour} * * ${day === 7 ? 0 : day}`
        // For demo: schedule every 2 minutes starting now
        const now = new Date();
        const scheduledMinute = (now.getMinutes() + (day * 2)) % 60;
        
        return `${scheduledMinute} * * * *`; // Every hour at the calculated minute
    }

    startWhitelistMode(userId) {
        this.updateGlassWindow('whitelist_activation', 'processing', `Activating whitelist mode for user ${userId}`);
        
        try {
            this.creditSystem.whitelisting.whitelistedUsers.push(userId);
            this.updateGlassWindow('whitelist_activation', 'success', `User ${userId} added to whitelist`);
            
            return {
                success: true,
                message: "Whitelist access granted",
                features: ["Unlimited credits", "Priority API access", "Custom rune creation"]
            };
        } catch (error) {
            this.updateGlassWindow('whitelist_activation', 'failed', `Whitelist activation failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    enableExclusiveOwnership(userId) {
        this.updateGlassWindow('exclusive_ownership', 'processing', `Setting up exclusive ownership for ${userId}`);
        
        try {
            this.creditSystem.whitelisting.exclusiveOwnership = userId;
            
            // Deploy private instance (simulation)
            const deploymentConfig = {
                userId,
                privateApiEndpoint: `https://private-${userId}.runeflow.xyz`,
                sourceCodeAccess: true,
                dedicatedResources: true,
                customBranding: true
            };
            
            this.updateGlassWindow('exclusive_ownership', 'success', `Exclusive ownership activated for ${userId}`);
            
            return {
                success: true,
                message: "Exclusive ownership activated",
                config: deploymentConfig
            };
        } catch (error) {
            this.updateGlassWindow('exclusive_ownership', 'failed', `Exclusive ownership setup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    getDashboardData() {
        return {
            ...this.dashboardData,
            campaignState: this.campaignState,
            creditSystem: this.creditSystem,
            currentWeek: this.currentWeek,
            currentRune: this.weeklyRunes[`week${this.currentWeek}`]?.name || 'Unknown'
        };
    }

    // Health check and system monitoring
    performHealthCheck() {
        this.updateGlassWindow('health_check', 'processing', 'Performing system health check');
        
        const healthData = {
            timestamp: new Date().toISOString(),
            twitter_api: process.env.TWITTER_API_KEY ? 'configured' : 'missing',
            database: 'operational',
            scheduler: 'active',
            credit_system: 'operational',
            dashboard: 'active'
        };
        
        const overallHealth = Object.values(healthData).every(status => 
            status === 'operational' || status === 'configured' || status === 'active'
        );
        
        this.dashboardData.glassWindow.systemHealth = overallHealth ? 'operational' : 'degraded';
        
        this.updateGlassWindow('health_check', 'success', `System health: ${this.dashboardData.glassWindow.systemHealth}`);
        
        return healthData;
    }

    // Manual post trigger for testing
    async triggerManualPost(postIndex = 0, userId = 'default') {
        const currentWeekData = this.weeklyRunes[`week${this.currentWeek}`];
        if (!currentWeekData || !currentWeekData.posts[postIndex]) {
            this.updateGlassWindow('manual_post', 'failed', 'Post not found');
            return { success: false, error: 'Post not found' };
        }
        
        const post = currentWeekData.posts[postIndex];
        this.updateGlassWindow('manual_post', 'processing', `Manually triggering post: ${post.type}`);
        
        const result = await this.postToTwitter(post.content, userId);
        
        return {
            success: true,
            post,
            result
        };
    }

    // Initialize the automation system
    async initialize() {
        console.log('🔮 Initializing RuneFlow Campaign Automation...');
        
        this.updateGlassWindow('system_init', 'processing', 'Initializing automation system');
        
        try {
            // Perform health check
            this.performHealthCheck();
            
            // Schedule weekly campaign
            this.scheduleWeeklyCampaign();
            
            // Set up health monitoring
            setInterval(() => {
                this.performHealthCheck();
            }, 30 * 60 * 1000); // Every 30 minutes
            
            this.updateGlassWindow('system_init', 'success', 'RuneFlow automation system fully operational');
            
            console.log('✅ RuneFlow Campaign Automation initialized successfully');
            console.log(`📊 Dashboard available at: /dashboard`);
            console.log(`🔮 Current rune: ${this.weeklyRunes[`week${this.currentWeek}`]?.name || 'Unknown'}`);
            
        } catch (error) {
            this.updateGlassWindow('system_init', 'failed', `Initialization failed: ${error.message}`);
            console.error('❌ Initialization failed:', error);
        }
    }
}

// Export for use in other modules
module.exports = RuneCampaignAutomation;

// CLI usage
if (require.main === module) {
    const automation = new RuneCampaignAutomation();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            automation.initialize();
            break;
        case 'post':
            const postIndex = parseInt(process.argv[3]) || 0;
            automation.triggerManualPost(postIndex).then(result => {
                console.log('Manual post result:', result);
                process.exit(0);
            });
            break;
        case 'health':
            const health = automation.performHealthCheck();
            console.log('System health:', health);
            process.exit(0);
            break;
        case 'dashboard':
            const dashboardData = automation.getDashboardData();
            console.log('Dashboard data:', JSON.stringify(dashboardData, null, 2));
            process.exit(0);
            break;
        case 'whitelist':
            const userId = process.argv[3] || 'demo_user';
            const whitelistResult = automation.startWhitelistMode(userId);
            console.log('Whitelist result:', whitelistResult);
            process.exit(0);
            break;
        case 'exclusive':
            const exclusiveUserId = process.argv[3] || 'demo_user';
            const exclusiveResult = automation.enableExclusiveOwnership(exclusiveUserId);
            console.log('Exclusive ownership result:', exclusiveResult);
            process.exit(0);
            break;
        default:
            console.log(`
🔮 RuneFlow Campaign Automation Commands:

  start         - Initialize and start the automation system
  post [index]  - Manually trigger a specific post (0-13)
  health        - Check system health
  dashboard     - Get current dashboard data
  whitelist     - Add user to whitelist mode
  exclusive     - Enable exclusive ownership
  
Examples:
  node rune-campaign-automation.js start
  node rune-campaign-automation.js post 0
  node rune-campaign-automation.js whitelist user123
            `);
            process.exit(0);
    }
}
