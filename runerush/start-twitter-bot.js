require('dotenv').config();
const { Client } = require('pg');
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

console.log('🤖 Starting RuneFlow Daily Template Twitter Bot...');

class SimpleTwitterBot {
    constructor() {
        // Setup database connection
        this.db = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        // Setup Twitter client
        this.twitter = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });
    }
    
    async initialize() {
        try {
            // Connect to database
            await this.db.connect();
            console.log('✅ Database connected');
            
            // Test Twitter connection
            const user = await this.twitter.readOnly.v2.me();
            console.log(`✅ Twitter connected: @${user.data.username}`);
            
            // Setup database tables
            await this.setupTables();
            
            return true;
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            return false;
        }
    }
    
    async setupTables() {
        // Create basic daily_templates table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS daily_templates (
                id SERIAL PRIMARY KEY,
                template_id VARCHAR(255) NOT NULL,
                template_name VARCHAR(500) NOT NULL,
                template_category VARCHAR(255),
                nodes_count INTEGER,
                quality_score INTEGER,
                post_date DATE NOT NULL,
                tweet_id VARCHAR(255),
                tweet_text TEXT,
                access_token VARCHAR(255) UNIQUE,
                access_expires_at TIMESTAMP,
                downloads_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Database tables ready');
    }
    
    async loadTemplates() {
        try {
            const manifestPath = path.join(__dirname, 'templates/runeflow_complete_vault_manifest.json');
            const manifestData = await fs.readFile(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestData);
            console.log(`✅ Loaded ${manifest.templates.length} templates`);
            return manifest.templates;
        } catch (error) {
            console.error('❌ Error loading templates:', error);
            return [];
        }
    }
    
    generateTweetText(template, accessToken) {
        const emoji = '🤖';
        const useCase = '⚡ Powerful automation workflow';
        const urgency = "⏰ Available for TODAY ONLY!";
        const hashtags = '#n8n #automation #nocode #runeflow';
        
        return `${emoji} Daily Template Drop: "${template.template_name}"

${useCase}

✨ ${template.nodes_count || 25} nodes
⭐ Quality: ${template.quality_score || 8}/10

${urgency}

Get it: https://runeflow.xyz/daily/${accessToken}

${hashtags}`;
    }
    
    async postDailyTemplate() {
        try {
            console.log('📱 Starting daily template post...');
            
            // Check if already posted today
            const today = new Date().toISOString().split('T')[0];
            const existing = await this.db.query(
                'SELECT id FROM daily_templates WHERE post_date = $1',
                [today]
            );
            
            if (existing.rows.length > 0) {
                console.log('ℹ️  Already posted today');
                return { success: true, message: 'Already posted today' };
            }
            
            // Load templates
            const templates = await this.loadTemplates();
            if (templates.length === 0) {
                throw new Error('No templates available');
            }
            
            // Select a high-quality template
            const template = templates.find(t => t.quality_score >= 8) || templates[0];
            
            // Generate access token
            const accessToken = crypto.randomBytes(16).toString('hex');
            
            // Generate tweet
            const tweetText = this.generateTweetText(template, accessToken);
            console.log('Tweet text:');
            console.log(tweetText);
            console.log(`Length: ${tweetText.length} characters`);
            
            // Post tweet (uncomment to actually post)
            console.log('\\n⚠️  Ready to post but tweet is disabled for safety.');
            console.log('To enable actual posting, uncomment line 120-122 below.');
            
            // const tweet = await this.twitter.readWrite.tweet(tweetText);
            // console.log(`✅ Tweet posted: ${tweet.data.id}`);
            
            // Save to database
            const expiresAt = new Date();
            expiresAt.setHours(23, 59, 59, 999);
            
            await this.db.query(`
                INSERT INTO daily_templates (
                    template_id, template_name, template_category, nodes_count, quality_score,
                    post_date, tweet_text, access_token, access_expires_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                template.template_id,
                template.template_name,
                template.category,
                template.nodes_count,
                template.quality_score,
                today,
                tweetText,
                accessToken,
                expiresAt
            ]);
            
            console.log('✅ Daily template record saved');
            console.log(`🔗 Access token: ${accessToken}`);
            
            return {
                success: true,
                template: template.template_name,
                accessToken: accessToken
            };
            
        } catch (error) {
            console.error('❌ Error posting daily template:', error);
            return { success: false, error: error.message };
        }
    }
    
    async cleanup() {
        await this.db.end();
        console.log('✅ Cleanup complete');
    }
}

// Run the bot
async function main() {
    const bot = new SimpleTwitterBot();
    
    try {
        const initialized = await bot.initialize();
        if (!initialized) {
            console.error('❌ Failed to initialize bot');
            return;
        }
        
        const result = await bot.postDailyTemplate();
        
        if (result.success) {
            console.log('🎉 Daily template posting completed!');
            if (result.template) {
                console.log(`   Template: ${result.template}`);
                console.log(`   Token: ${result.accessToken}`);
            }
        } else {
            console.error(`❌ Failed: ${result.error || result.message}`);
        }
        
    } finally {
        await bot.cleanup();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}
