#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

console.log('🧪 Testing RuneRush Success Flow on Live Site');
console.log('='.repeat(50));

// Test URLs to verify
const testUrls = [
    {
        name: 'Core Bundle Success',
        url: 'https://runeflow.xyz/runerush/success.html?session_id=cs_test_123&product_type=core&license_key=RR-ABCD-1234-WXYZ',
        expected: ['Payment Successful', 'RuneRush Core Bundle', '50 Premium n8n Templates']
    },
    {
        name: 'Pro Bundle Success', 
        url: 'https://runeflow.xyz/runerush/success.html?session_id=cs_test_456&product_type=pro_bundle&license_key=RR-EFGH-5678-STUV',
        expected: ['Payment Successful', 'RuneRush Pro Bundle', '100 Premium n8n Templates']
    },
    {
        name: 'Complete Collection Success',
        url: 'https://runeflow.xyz/runerush/success.html?session_id=cs_test_789&product_type=complete_collection&license_key=RR-IJKL-9012-MNOP',
        expected: ['Payment Successful', 'RuneRush Complete Collection', '8100+ Premium n8n Templates']
    },
    {
        name: 'Success Without License Key',
        url: 'https://runeflow.xyz/runerush/success.html?session_id=cs_test_000&product_type=core',
        expected: ['Payment Successful', 'RuneRush Core Bundle']
    },
    {
        name: 'RuneRush Main Route',
        url: 'https://runeflow.xyz/runerush/',
        expected: ['RuneRUSH', 'Premium Automation Templates']
    },
    {
        name: 'Success Page Direct (No Params)',
        url: 'https://runeflow.xyz/runerush/success.html',
        expected: ['Payment Successful']
    }
];

// Test if /success route conflicts with vault
const conflictTests = [
    {
        name: 'Vault Page (Should NOT be success page)',
        url: 'https://runeflow.xyz/success',
        expected: ['RuneFlow', 'Vault', 'LOCKED'],
        unexpected: ['Payment Successful', 'RuneRush']
    }
];

async function testUrl(testCase) {
    return new Promise((resolve) => {
        const url = new URL(testCase.url);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': 'RuneRush-Test-Bot/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const result = {
                    name: testCase.name,
                    url: testCase.url,
                    status: res.statusCode,
                    success: res.statusCode === 200,
                    content: data,
                    checks: []
                };

                // Check expected content
                if (testCase.expected) {
                    testCase.expected.forEach(expectedText => {
                        const found = data.includes(expectedText);
                        result.checks.push({
                            type: 'expected',
                            text: expectedText,
                            found: found,
                            status: found ? '✅' : '❌'
                        });
                    });
                }

                // Check unexpected content (for conflict tests)
                if (testCase.unexpected) {
                    testCase.unexpected.forEach(unexpectedText => {
                        const found = data.includes(unexpectedText);
                        result.checks.push({
                            type: 'unexpected',
                            text: unexpectedText,
                            found: found,
                            status: found ? '❌' : '✅'
                        });
                    });
                }

                resolve(result);
            });
        });

        req.on('error', (err) => {
            resolve({
                name: testCase.name,
                url: testCase.url,
                status: 0,
                success: false,
                error: err.message,
                checks: []
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                name: testCase.name,
                url: testCase.url,
                status: 0,
                success: false,
                error: 'Timeout',
                checks: []
            });
        });

        req.end();
    });
}

async function runTests() {
    console.log('🔍 Testing Success Page Functionality...\n');
    
    for (const testCase of testUrls) {
        console.log(`Testing: ${testCase.name}`);
        const result = await testUrl(testCase);
        
        console.log(`   URL: ${result.url}`);
        console.log(`   Status: ${result.status} ${result.success ? '✅' : '❌'}`);
        
        if (result.error) {
            console.log(`   Error: ${result.error} ❌`);
        }
        
        result.checks.forEach(check => {
            console.log(`   ${check.status} ${check.type}: "${check.text}"`);
        });
        
        console.log('');
    }

    console.log('🚨 Testing Potential Conflicts...\n');
    
    for (const testCase of conflictTests) {
        console.log(`Testing: ${testCase.name}`);
        const result = await testUrl(testCase);
        
        console.log(`   URL: ${result.url}`);
        console.log(`   Status: ${result.status} ${result.success ? '✅' : '❌'}`);
        
        result.checks.forEach(check => {
            const label = check.type === 'expected' ? 'Should contain' : 'Should NOT contain';
            console.log(`   ${check.status} ${label}: "${check.text}"`);
        });
        
        console.log('');
    }

    console.log('📊 Test Summary');
    console.log('='.repeat(30));
    console.log('✅ If all tests pass, the success flow is working correctly');
    console.log('❌ If any tests fail, there are issues to investigate');
    console.log('\n🔗 Manual Test URLs:');
    
    testUrls.forEach(test => {
        console.log(`   • ${test.name}: ${test.url}`);
    });
}

// Run the tests
runTests().catch(console.error);
