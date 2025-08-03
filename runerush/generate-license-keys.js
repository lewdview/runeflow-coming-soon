#!/usr/bin/env node

const { generateLicenseKey, isValidLicenseKey } = require('./utils/helpers');

/**
 * Generate multiple license keys
 */
function generateKeys(count = 1) {
    const keys = [];
    
    for (let i = 0; i < count; i++) {
        const key = generateLicenseKey();
        keys.push(key);
    }
    
    return keys;
}

/**
 * Generate and validate keys
 */
function generateValidatedKeys(count = 1) {
    const keys = generateKeys(count);
    
    console.log(`Generated ${count} license key(s):\n`);
    
    keys.forEach((key, index) => {
        const isValid = isValidLicenseKey(key);
        console.log(`${index + 1}. ${key} ${isValid ? '✅' : '❌'}`);
    });
    
    return keys;
}

/**
 * Check for duplicates in a batch
 */
function generateUniqueKeys(count = 1) {
    const keys = new Set();
    
    while (keys.size < count) {
        keys.add(generateLicenseKey());
    }
    
    return Array.from(keys);
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const count = parseInt(args[0]) || 1;
    
    console.log(`🔑 RuneRUSH License Key Generator\n`);
    
    if (count > 1000) {
        console.log('❌ Maximum 1000 keys at once for safety');
        process.exit(1);
    }
    
    const keys = generateUniqueKeys(count);
    
    console.log(`Generated ${count} unique license key(s):\n`);
    keys.forEach((key, index) => {
        console.log(`${(index + 1).toString().padStart(3, ' ')}. ${key}`);
    });
    
    // Validation check
    const allValid = keys.every(key => isValidLicenseKey(key));
    console.log(`\n✅ All keys valid: ${allValid}`);
    console.log(`📊 Total unique keys: ${keys.length}`);
}

module.exports = {
    generateKeys,
    generateValidatedKeys,
    generateUniqueKeys
};
