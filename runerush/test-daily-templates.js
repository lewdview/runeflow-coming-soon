require('dotenv').config();
const { Client } = require('pg');

async function testDailyTemplateSystem() {
    console.log('🧪 Testing Daily Template System...');
    
    const db = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    try {
        await db.connect();
        console.log('✅ Database connected');
        
        // Get today's template
        const today = new Date().toISOString().split('T')[0];
        const result = await db.query(`
            SELECT * FROM daily_templates 
            WHERE post_date = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [today]);
        
        if (result.rows.length === 0) {
            console.log('❌ No template found for today');
            console.log('💡 Run "node start-twitter-bot.js" first to create a daily template');
            return;
        }
        
        const template = result.rows[0];
        console.log('✅ Found today\\'s template:');
        console.log(`   📋 Name: ${template.template_name}`);
        console.log(`   📁 Category: ${template.template_category}`);
        console.log(`   🔗 Token: ${template.access_token}`);
        console.log(`   ⏰ Expires: ${new Date(template.access_expires_at).toLocaleString()}`);
        console.log(`   📥 Downloads: ${template.downloads_count || 0}`);
        
        // Test URLs
        console.log('\\n🌐 Test URLs:');
        console.log(`   📄 Download Page: http://localhost:8080/daily/${template.access_token}`);
        console.log(`   📥 Direct Download: http://localhost:8080/daily/${template.access_token}/download`);
        console.log(`   📊 Template Info: http://localhost:8080/daily/${template.access_token}/info`);
        console.log(`   🔧 Admin Status: http://localhost:8080/daily-admin/today?key=${process.env.ADMIN_KEY}`);
        
        // Check if template file exists
        const fs = require('fs').promises;
        const path = require('path');
        const possiblePaths = [
            path.join(__dirname, 'templates/complete', `${template.template_id}.json`),
            path.join(__dirname, 'templates/RUNERUSH_COMPLETE_VAULT', `${template.template_id}.json`),
            path.join(__dirname, 'templates/processed_complete_vault', `${template.template_id}.json`),
            path.join(__dirname, 'templates/runeflow_core_collection', `${template.template_id}.json`),
            path.join(__dirname, 'templates/runeflow_pro_collection', `${template.template_id}.json`),
            path.join(__dirname, 'templates/RUNERUSH_COMPLETE_UPDATED', `${template.template_id}.json`)
        ];
        
        let templateFileFound = false;
        for (const filePath of possiblePaths) {
            try {
                await fs.access(filePath);
                console.log(`✅ Template file found: ${filePath}`);
                templateFileFound = true;
                break;
            } catch (error) {
                continue;
            }
        }
        
        if (!templateFileFound) {
            console.log(`❌ Template file NOT found for ID: ${template.template_id}`);
            console.log('   Searched in:', possiblePaths);
        }
        
        console.log('\\n🎉 Daily Template System is ready!');
        console.log('\\n💡 Next steps:');
        console.log('   1. Start your server: node server.js');
        console.log('   2. Visit the download page URL above');
        console.log('   3. Test the download functionality');
        console.log('   4. Enable actual Twitter posting when ready');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.end();
    }
}

testDailyTemplateSystem();
