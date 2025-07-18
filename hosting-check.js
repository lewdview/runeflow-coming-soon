#!/usr/bin/env node

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🏠 RuneFlow Hosting Assessment');
console.log('==============================');
console.log('Let\'s figure out the best way to deploy to your hosting!\n');

const questions = [
    {
        key: 'provider',
        question: 'What\'s your hosting provider? (e.g., Bluehost, GoDaddy, DigitalOcean, etc.): ',
        type: 'text'
    },
    {
        key: 'access',
        question: 'How do you access your hosting? (cPanel/FTP/SSH/Other): ',
        type: 'text'
    },
    {
        key: 'nodejs',
        question: 'Does your hosting support Node.js? (yes/no/unsure): ',
        type: 'text'
    },
    {
        key: 'domain',
        question: 'What domain will you use? (e.g., runeflow.com or subdomain.yoursite.com): ',
        type: 'text'
    },
    {
        key: 'ssl',
        question: 'Do you have SSL/HTTPS enabled? (yes/no/unsure): ',
        type: 'text'
    }
];

const answers = {};
let currentQuestion = 0;

function askQuestion() {
    if (currentQuestion >= questions.length) {
        analyzeAnswers();
        return;
    }
    
    const q = questions[currentQuestion];
    rl.question(q.question, (answer) => {
        answers[q.key] = answer.toLowerCase().trim();
        currentQuestion++;
        askQuestion();
    });
}

function analyzeAnswers() {
    console.log('\n📊 Analysis Results:');
    console.log('=====================\n');
    
    // Determine hosting type
    const provider = answers.provider.toLowerCase();
    const access = answers.access.toLowerCase();
    const nodejs = answers.nodejs.toLowerCase();
    
    let hostingType = 'Unknown';
    let deploymentMethod = 'Unknown';
    let canUseNodejs = false;
    
    // Analyze provider
    if (provider.includes('bluehost') || provider.includes('godaddy') || provider.includes('hostgator')) {
        hostingType = 'Shared Hosting';
        deploymentMethod = 'Static Files (FTP/cPanel)';
        canUseNodejs = nodejs === 'yes';
    } else if (provider.includes('digitalocean') || provider.includes('linode') || provider.includes('vultr')) {
        hostingType = 'VPS/Cloud';
        deploymentMethod = 'Full Node.js App (SSH)';
        canUseNodejs = true;
    } else if (provider.includes('heroku') || provider.includes('vercel') || provider.includes('netlify')) {
        hostingType = 'Platform as a Service';
        deploymentMethod = 'Git/Platform Deploy';
        canUseNodejs = true;
    } else if (access.includes('ssh') || access.includes('terminal')) {
        hostingType = 'VPS/Dedicated';
        deploymentMethod = 'Full Node.js App (SSH)';
        canUseNodejs = true;
    } else if (access.includes('cpanel') || access.includes('ftp')) {
        hostingType = 'Shared Hosting';
        deploymentMethod = 'Static Files (FTP/cPanel)';
        canUseNodejs = nodejs === 'yes';
    }
    
    console.log(`🏷️  Hosting Type: ${hostingType}`);
    console.log(`🚀 Deployment Method: ${deploymentMethod}`);
    console.log(`⚡ Node.js Support: ${canUseNodejs ? 'Yes' : 'No/Limited'}`);
    console.log(`🌐 Domain: ${answers.domain}`);
    console.log(`🔒 SSL: ${answers.ssl}\n`);
    
    // Provide recommendations
    console.log('💡 Recommendations:');
    console.log('==================\n');
    
    if (canUseNodejs) {
        console.log('✅ FULL NODE.JS DEPLOYMENT (Recommended)');
        console.log('   - Keep all features including crypto payments');
        console.log('   - Real-time email notifications');
        console.log('   - Full backend API functionality');
        console.log('   - Social media automation');
        console.log('\n📋 Next Steps:');
        console.log('   1. Run: npm install');
        console.log('   2. Create .env file with your credentials');
        console.log('   3. Upload entire project to your server');
        console.log('   4. Install dependencies on server');
        console.log('   5. Start with: npm start');
        
        if (access.includes('ssh')) {
            console.log('\n🔧 SSH Deployment Commands:');
            console.log('   ssh user@your-server-ip');
            console.log('   git clone https://github.com/yourusername/runeflow.git');
            console.log('   cd runeflow');
            console.log('   npm install');
            console.log('   cp .env.example .env');
            console.log('   nano .env  # Edit with your credentials');
            console.log('   npm start');
        }
    } else {
        console.log('📄 STATIC DEPLOYMENT (Limited Features)');
        console.log('   - Basic email capture (PHP fallback)');
        console.log('   - No crypto payments');
        console.log('   - No real-time features');
        console.log('   - No social media automation');
        console.log('\n📋 Next Steps:');
        console.log('   1. Run: npm run build-static');
        console.log('   2. Upload dist/ folder contents via FTP/cPanel');
        console.log('   3. Configure PHP email settings');
        console.log('   4. Test email form');
        
        console.log('\n🔧 Upload Instructions:');
        console.log('   1. npm run build-static');
        console.log('   2. Upload dist/ contents to public_html/');
        console.log('   3. Set folder permissions: 755');
        console.log('   4. Set file permissions: 644');
        console.log('   5. Test at: your-domain.com/signup.html');
    }
    
    // Security recommendations
    console.log('\n🔐 Security Checklist:');
    console.log('   - Enable SSL/HTTPS');
    console.log('   - Set strong passwords');
    console.log('   - Keep software updated');
    console.log('   - Regular backups');
    console.log('   - Monitor access logs');
    
    // Final recommendations
    console.log('\n📞 Need Help?');
    console.log('   - Read: CUSTOM_HOSTING_GUIDE.md');
    console.log('   - Check: DEPLOYMENT_CHECKLIST.md');
    console.log('   - Contact: bryan@webhalla.com');
    
    if (!canUseNodejs) {
        console.log('\n💡 Upgrade Suggestion:');
        console.log('   Consider upgrading to Node.js hosting for full features.');
        console.log('   Recommended: Railway ($5/month) or DigitalOcean ($12/month)');
    }
    
    rl.close();
}

// Start the assessment
askQuestion();
