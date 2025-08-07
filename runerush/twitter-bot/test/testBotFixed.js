const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' });

const TwitterService = require('../services/twitterServiceFixed');
const TemplateService = require('../services/templateService');
const TwitterBotController = require('../controllers/twitterBotController');

class BotTester {
    constructor() {
        // Setup database connection
        this.db = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    async connect() {
        try {
            await this.db.connect();
            console.log('✅ Database connected');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        await this.db.end();
        console.log('✅ Database disconnected');
    }

    async testTwitterConnection() {
        console.log('\n🔍 Testing Twitter connection...');
        const twitterService = new TwitterService();
        const result = await twitterService.testConnection();
        
        if (result.success) {
            console.log('✅ Twitter connection successful!');
            console.log(`   Account: @${result.user.username}`);
        } else {
            console.error('❌ Twitter connection failed:', result.error);
        }
        
        return result.success;
    }

    async testTemplateLoading() {
        console.log('\n🔍 Testing template loading...');
        const templateService = new TemplateService(this.db);
        
        try {
            const templates = await templateService.loadTemplates();
            console.log(`✅ Loaded ${templates.length} templates successfully`);
            
            if (templates.length > 0) {
                const sample = templates[0];
                console.log(`   Sample template: ${sample.template_name}`);
                console.log(`   Category: ${sample.category}`);
                console.log(`   Nodes: ${sample.nodes_count}`);
                console.log(`   Quality: ${sample.quality_score}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Template loading failed:', error);
            return false;
        }
    }

    async testTweetGeneration() {
        console.log('\n🔍 Testing tweet generation...');
        const twitterService = new TwitterService();
        const templateService = new TemplateService(this.db);
        
        try {
            const templates = await templateService.loadTemplates();
            if (templates.length === 0) {
                console.error('❌ No templates available for testing');
                return false;
            }
            
            const sampleTemplate = templates[0];
            const testToken = 'test123token456';
            
            const tweetText = twitterService.generateTweetText(sampleTemplate, testToken);
            
            console.log('✅ Tweet generation successful!');
            console.log('   Generated tweet:');
            console.log(`   ${tweetText}`);
            console.log(`   Length: ${tweetText.length} characters`);
            
            if (tweetText.length > 280) {
                console.warn('⚠️  Tweet exceeds 280 character limit!');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Tweet generation failed:', error);
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Twitter Bot Tests...');
        console.log('=====================================');
        
        let allPassed = true;
        
        try {
            await this.connect();
            
            // Run individual tests
            const tests = [
                { name: 'Twitter Connection', fn: () => this.testTwitterConnection() },
                { name: 'Template Loading', fn: () => this.testTemplateLoading() },
                { name: 'Tweet Generation', fn: () => this.testTweetGeneration() }
            ];
            
            for (const test of tests) {
                const passed = await test.fn();
                if (!passed) {
                    allPassed = false;
                    console.error(`❌ ${test.name} test failed`);
                } else {
                    console.log(`✅ ${test.name} test passed`);
                }
            }
            
        } finally {
            await this.disconnect();
        }
        
        console.log('\n=====================================');
        if (allPassed) {
            console.log('🎉 All tests passed! Your Twitter bot is ready!');
        } else {
            console.error('❌ Some tests failed. Please fix the issues above.');
        }
        
        return allPassed;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new BotTester();
    tester.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = BotTester;
