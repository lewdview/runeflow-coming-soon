#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Replace GA_MEASUREMENT_ID placeholder with actual environment variable
function replaceAnalyticsId() {
    const GA_ID = process.env.GOOGLE_ANALYTICS_ID || process.env.GA_MEASUREMENT_ID;
    
    if (!GA_ID) {
        console.log('⚠️  No Google Analytics ID found in environment variables');
        console.log('   Set GOOGLE_ANALYTICS_ID or GA_MEASUREMENT_ID to enable tracking');
        return;
    }
    
    // Files to update
    const filesToUpdate = [
        'dist/index.html',
        'dist/assets/js/analytics.js'
    ];
    
    filesToUpdate.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace all occurrences of GA_MEASUREMENT_ID with actual ID
            content = content.replace(/GA_MEASUREMENT_ID/g, GA_ID);
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated ${filePath} with GA ID: ${GA_ID}`);
        } else {
            console.log(`⚠️  File not found: ${filePath}`);
        }
    });
}

// Run the replacement
replaceAnalyticsId();
