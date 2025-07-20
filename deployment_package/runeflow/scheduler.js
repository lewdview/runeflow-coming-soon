#!/usr/bin/env node

/**
 * RuneFlow Social Media Scheduler
 * Automated posting schedule for maximum engagement
 */

const cron = require('cron');
const SocialMediaBlast = require('./social-blast');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class SocialMediaScheduler {
    constructor() {
        try {
            this.socialBlast = new SocialMediaBlast();
        } catch (error) {
            console.log('⚠️ Social media APIs not configured, scheduler will skip social posts');
            this.socialBlast = null;
        }
        this.jobs = [];
        this.isRunning = false;
        this.scheduleConfig = this.loadScheduleConfig();
    }

    loadScheduleConfig() {
        return {
            // Morning Campaign (9-11 AM)
            morning: {
                cron: '0 9,10,11 * * *', // Every hour from 9-11 AM
                campaignType: 'launch_announcement',
                enabled: true
            },
            // Afternoon Campaign (12-2 PM)
            afternoon: {
                cron: '0 12,13,14 * * *', // Every hour from 12-2 PM
                campaignType: 'product_highlights',
                enabled: true
            },
            // Evening Campaign (3-5 PM)
            evening: {
                cron: '0 15,16,17 * * *', // Every hour from 3-5 PM
                campaignType: 'social_proof',
                enabled: true
            },
            // Night Campaign (6-8 PM)
            night: {
                cron: '0 18,19,20 * * *', // Every hour from 6-8 PM
                campaignType: 'urgency_posts',
                enabled: true
            },
            // Milestone Check (Every 2 hours)
            milestone: {
                cron: '0 */2 * * *', // Every 2 hours
                campaignType: 'milestone_posts',
                enabled: true
            },
            // Weekly Recap (Sundays at 6 PM)
            weekly: {
                cron: '0 18 * * 0', // Every Sunday at 6 PM
                campaignType: 'weekly_recap',
                enabled: true
            }
        };
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Scheduler is already running');
            return;
        }

        console.log('🚀 Starting RuneFlow Social Media Scheduler...');
        this.isRunning = true;

        // Create scheduled jobs
        Object.entries(this.scheduleConfig).forEach(([name, config]) => {
            if (config.enabled) {
                const job = new cron.CronJob(
                    config.cron,
                    () => this.executeScheduledPost(name, config),
                    null,
                    true,
                    'America/New_York'
                );

                this.jobs.push({ name, job, config });
                console.log(`📅 Scheduled ${name} campaign: ${config.cron}`);
            }
        });

        // Health check job (every 30 minutes)
        const healthJob = new cron.CronJob(
            '*/30 * * * *', // Every 30 minutes
            () => this.healthCheck(),
            null,
            true,
            'America/New_York'
        );

        this.jobs.push({ name: 'health_check', job: healthJob, config: { enabled: true } });

        // Log startup
        this.logSchedulerEvent('startup', { totalJobs: this.jobs.length });
        
        console.log(`✅ Scheduler started with ${this.jobs.length} jobs`);
        console.log('📊 Next scheduled posts:');
        this.showUpcomingJobs();
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Scheduler is not running');
            return;
        }

        console.log('🛑 Stopping RuneFlow Social Media Scheduler...');
        
        this.jobs.forEach(({ name, job }) => {
            job.stop();
            console.log(`⏹️ Stopped ${name} job`);
        });

        this.jobs = [];
        this.isRunning = false;
        
        this.logSchedulerEvent('shutdown');
        console.log('✅ Scheduler stopped');
    }

    async executeScheduledPost(jobName, config) {
        console.log(`🎯 Executing scheduled post: ${jobName} (${config.campaignType})`);
        
        try {
            // Skip if social media blast is not available
            if (!this.socialBlast) {
                console.log(`⏭️ Skipping ${jobName} - social media APIs not configured`);
                return;
            }
            
            // Check if we should skip this post
            if (await this.shouldSkipPost(config.campaignType)) {
                console.log(`⏭️ Skipping ${jobName} - conditions not met`);
                return;
            }

            // Execute the social media blast
            const results = await this.socialBlast.executeBlast(config.campaignType);
            
            // Log success
            this.logSchedulerEvent('post_success', {
                jobName,
                campaignType: config.campaignType,
                results
            });

            console.log(`✅ Scheduled post completed: ${jobName}`);
            
        } catch (error) {
            console.error(`❌ Scheduled post failed: ${jobName}`, error);
            
            // Log error
            this.logSchedulerEvent('post_error', {
                jobName,
                campaignType: config.campaignType,
                error: error.message
            });

            // Send error notification
            await this.sendErrorNotification(jobName, error);
        }
    }

    async shouldSkipPost(campaignType) {
        // Skip milestone posts if signup count hasn't changed significantly
        if (campaignType === 'milestone_posts') {
            const currentCount = this.getCurrentSignupCount();
            const lastMilestoneCount = await this.getLastMilestoneCount();
            
            if (currentCount - lastMilestoneCount < 10) {
                return true; // Skip if less than 10 new signups
            }
            
            await this.updateLastMilestoneCount(currentCount);
        }

        // Skip if we've posted too recently (prevent spam)
        const lastPostTime = await this.getLastPostTime(campaignType);
        const now = Date.now();
        const minInterval = 2 * 60 * 60 * 1000; // 2 hours minimum between same campaign type
        
        if (lastPostTime && (now - lastPostTime) < minInterval) {
            return true;
        }

        return false;
    }

    getCurrentSignupCount() {
        try {
            const analyticsPath = path.join(__dirname, '..', 'data', 'analytics.json');
            if (fs.existsSync(analyticsPath)) {
                const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
                return analytics.totalSignups || 0;
            }
        } catch (error) {
            console.error('Error reading signup count:', error);
        }
        return 0;
    }

    async getLastMilestoneCount() {
        try {
            const schedulerDataPath = path.join(__dirname, '..', 'data', 'scheduler-data.json');
            if (fs.existsSync(schedulerDataPath)) {
                const data = JSON.parse(fs.readFileSync(schedulerDataPath, 'utf8'));
                return data.lastMilestoneCount || 0;
            }
        } catch (error) {
            console.error('Error reading milestone count:', error);
        }
        return 0;
    }

    async updateLastMilestoneCount(count) {
        try {
            const schedulerDataPath = path.join(__dirname, '..', 'data', 'scheduler-data.json');
            let data = {};
            
            if (fs.existsSync(schedulerDataPath)) {
                data = JSON.parse(fs.readFileSync(schedulerDataPath, 'utf8'));
            }
            
            data.lastMilestoneCount = count;
            data.lastMilestoneUpdate = new Date().toISOString();
            
            const dataDir = path.dirname(schedulerDataPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(schedulerDataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error updating milestone count:', error);
        }
    }

    async getLastPostTime(campaignType) {
        try {
            const logPath = path.join(__dirname, '..', 'data', 'social-media-log.json');
            if (fs.existsSync(logPath)) {
                const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
                const lastPost = logs
                    .filter(log => log.campaignType === campaignType)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                
                return lastPost ? new Date(lastPost.timestamp).getTime() : null;
            }
        } catch (error) {
            console.error('Error reading last post time:', error);
        }
        return null;
    }

    async healthCheck() {
        try {
            const status = {
                timestamp: new Date().toISOString(),
                schedulerRunning: this.isRunning,
                activeJobs: this.jobs.length,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                signupCount: this.getCurrentSignupCount()
            };

            console.log('💊 Health check:', status);
            
            // Log health check
            this.logSchedulerEvent('health_check', status);
            
            // Send health notification if needed
            if (status.memory.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
                await this.sendHealthAlert('High memory usage detected');
            }
            
        } catch (error) {
            console.error('❌ Health check failed:', error);
            await this.sendHealthAlert('Health check failed: ' + error.message);
        }
    }

    showUpcomingJobs() {
        this.jobs.forEach(({ name, job, config }) => {
            if (config.enabled) {
                const next = job.nextDate();
                const dateStr = next.toDate ? next.toDate().toISOString().replace('T', ' ').substring(0, 19) : 
                               next.toISOString ? next.toISOString().replace('T', ' ').substring(0, 19) : 
                               next.toString();
                console.log(`  📅 ${name}: ${dateStr}`);
            }
        });
    }

    logSchedulerEvent(eventType, data = {}) {
        const logData = {
            timestamp: new Date().toISOString(),
            eventType,
            data,
            scheduler: 'runeflow-social-scheduler'
        };

        const logPath = path.join(__dirname, '..', 'data', 'scheduler-log.json');
        
        let logs = [];
        if (fs.existsSync(logPath)) {
            try {
                logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            } catch (error) {
                console.error('Error reading scheduler logs:', error);
                logs = [];
            }
        }

        logs.push(logData);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }

        try {
            const dataDir = path.dirname(logPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Error writing scheduler logs:', error);
        }
    }

    async sendErrorNotification(jobName, error) {
        try {
            if (process.env.DISCORD_WEBHOOK_URL) {
                const axios = require('axios');
                await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                    content: `🚨 **RuneFlow Scheduler Error**\n\n**Job:** ${jobName}\n**Error:** ${error.message}\n**Time:** ${new Date().toLocaleString()}`,
                    username: 'RuneFlow Scheduler',
                    avatar_url: 'https://runeflow.co/favicon.ico'
                });
            }
        } catch (notificationError) {
            console.error('Failed to send error notification:', notificationError);
        }
    }

    async sendHealthAlert(message) {
        try {
            if (process.env.DISCORD_WEBHOOK_URL) {
                const axios = require('axios');
                await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                    content: `⚠️ **RuneFlow Scheduler Health Alert**\n\n${message}\n**Time:** ${new Date().toLocaleString()}`,
                    username: 'RuneFlow Health Monitor',
                    avatar_url: 'https://runeflow.co/favicon.ico'
                });
            }
        } catch (error) {
            console.error('Failed to send health alert:', error);
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            jobCount: this.jobs.length,
            uptime: process.uptime(),
            nextJobs: this.jobs.map(({ name, job, config }) => {
                if (!config.enabled) return { name, enabled: false, next: null };
                
                const next = job.nextDate();
                const dateStr = next.toDate ? next.toDate().toISOString().replace('T', ' ').substring(0, 19) : 
                               next.toISOString ? next.toISOString().replace('T', ' ').substring(0, 19) : 
                               next.toString();
                
                return { name, enabled: true, next: dateStr };
            })
        };
    }
}

// CLI usage
if (require.main === module) {
    const scheduler = new SocialMediaScheduler();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
    });

    // Start the scheduler
    scheduler.start();
    
    // Keep the process alive
    setInterval(() => {
        // Do nothing, just keep alive
    }, 1000);
}

module.exports = SocialMediaScheduler;
