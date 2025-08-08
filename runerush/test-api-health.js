#!/usr/bin/env node

/**
 * API Health Check Script
 * Tests both frontend (Netlify) and backend (Railway) endpoints
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  frontend: {
    url: 'https://runerush.xyz',
    name: 'Frontend (Netlify)'
  },
  backend: {
    url: 'https://runerush-production.up.railway.app',
    name: 'Backend (Railway)'
  },
  localBackend: {
    url: `http://localhost:${process.env.PORT || 3000}`,
    name: 'Local Backend'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP/HTTPS requests
function checkEndpoint(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    console.log(`\n${colors.cyan}🔍 Checking ${name}: ${colors.reset}${url}`);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'RuneRush-Health-Check/1.0'
      }
    };

    const startTime = Date.now();
    
    const req = protocol.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const isHealthy = status >= 200 && status < 400;
        
        const statusIcon = isHealthy ? '✅' : '⚠️';
        const statusColor = isHealthy ? colors.green : colors.yellow;
        
        console.log(`${statusIcon} Status: ${statusColor}${status}${colors.reset}`);
        console.log(`⏱️  Response Time: ${responseTime}ms`);
        
        // Check for specific headers
        if (res.headers['x-powered-by']) {
          console.log(`🔧 Powered By: ${res.headers['x-powered-by']}`);
        }
        if (res.headers['server']) {
          console.log(`🖥️  Server: ${res.headers['server']}`);
        }
        
        resolve({
          name,
          url,
          status,
          responseTime,
          healthy: isHealthy,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      console.log(`⏱️  Response Time: ${responseTime}ms`);
      
      resolve({
        name,
        url,
        status: 0,
        responseTime,
        healthy: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`${colors.red}❌ Request timed out after 10 seconds${colors.reset}`);
      
      resolve({
        name,
        url,
        status: 0,
        responseTime: 10000,
        healthy: false,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

// Check specific API endpoints
async function checkAPIEndpoints(baseUrl) {
  const endpoints = [
    '/api/health',
    '/api/status',
    '/api/products',
    '/api/prices'
  ];
  
  console.log(`\n${colors.blue}📡 Testing API Endpoints:${colors.reset}`);
  
  for (const endpoint of endpoints) {
    const url = baseUrl + endpoint;
    await checkEndpoint(url, `API ${endpoint}`);
  }
}

// Check database connection (if local server is running)
async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log(`\n${colors.yellow}⚠️ Database URL not configured${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.blue}🗄️  Database Configuration:${colors.reset}`);
  const dbUrl = process.env.DATABASE_URL;
  const isRailway = dbUrl.includes('railway');
  const isPostgres = dbUrl.includes('postgresql');
  
  console.log(`📍 Type: ${isPostgres ? 'PostgreSQL' : 'Unknown'}`);
  console.log(`☁️  Host: ${isRailway ? 'Railway Cloud' : 'External'}`);
  console.log(`✅ Connection String: Configured`);
}

// Check external services
async function checkExternalServices() {
  console.log(`\n${colors.blue}🔌 External Services Configuration:${colors.reset}`);
  
  const services = [
    {
      name: 'Stripe',
      configured: !!process.env.STRIPE_SECRET_KEY,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'
    },
    {
      name: 'SendGrid',
      configured: !!process.env.SENDGRID_API_KEY,
      from: process.env.FROM_EMAIL
    },
    {
      name: 'AWS S3',
      configured: !!process.env.AWS_ACCESS_KEY_ID,
      bucket: process.env.S3_BUCKET_NAME
    },
    {
      name: 'Twitter Bot',
      configured: !!process.env.TWITTER_API_KEY,
      enabled: !!process.env.TWITTER_API_KEY
    }
  ];
  
  services.forEach(service => {
    const icon = service.configured ? '✅' : '❌';
    const status = service.configured ? 'Configured' : 'Not Configured';
    console.log(`${icon} ${service.name}: ${status}`);
    
    if (service.mode) {
      console.log(`   Mode: ${colors.yellow}${service.mode}${colors.reset}`);
    }
    if (service.from) {
      console.log(`   From: ${service.from}`);
    }
    if (service.bucket) {
      console.log(`   Bucket: ${service.bucket}`);
    }
  });
}

// Main health check function
async function runHealthCheck() {
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}🏥 RuneRush API Health Check${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  
  const results = [];
  
  // Check Frontend
  const frontendResult = await checkEndpoint(config.frontend.url, config.frontend.name);
  results.push(frontendResult);
  
  // Check Backend (Railway)
  const backendResult = await checkEndpoint(config.backend.url, config.backend.name);
  results.push(backendResult);
  
  // Check specific backend API endpoints if backend is healthy
  if (backendResult.healthy) {
    await checkAPIEndpoints(config.backend.url);
  }
  
  // Check Local Backend (if running)
  console.log(`\n${colors.yellow}📍 Checking Local Server...${colors.reset}`);
  const localResult = await checkEndpoint(config.localBackend.url, config.localBackend.name);
  results.push(localResult);
  
  // Check Database Configuration
  await checkDatabase();
  
  // Check External Services
  await checkExternalServices();
  
  // Summary
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}📊 Health Check Summary${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  const overallHealth = healthyCount === totalCount ? 'HEALTHY' : healthyCount > 0 ? 'PARTIAL' : 'UNHEALTHY';
  const healthColor = overallHealth === 'HEALTHY' ? colors.green : overallHealth === 'PARTIAL' ? colors.yellow : colors.red;
  
  console.log(`\n🏥 Overall Status: ${healthColor}${overallHealth}${colors.reset}`);
  console.log(`✅ Healthy Services: ${healthyCount}/${totalCount}`);
  
  results.forEach(result => {
    const icon = result.healthy ? '✅' : '❌';
    const time = result.responseTime < 1000 ? colors.green : result.responseTime < 3000 ? colors.yellow : colors.red;
    console.log(`${icon} ${result.name}: ${result.healthy ? 'UP' : 'DOWN'} (${time}${result.responseTime}ms${colors.reset})`);
  });
  
  // Recommendations
  console.log(`\n${colors.blue}💡 Recommendations:${colors.reset}`);
  
  if (!localResult.healthy) {
    console.log(`• Start local server: ${colors.yellow}npm run dev${colors.reset}`);
  }
  
  if (!backendResult.healthy) {
    console.log(`• Check Railway deployment status at: ${colors.yellow}https://railway.app${colors.reset}`);
  }
  
  if (!frontendResult.healthy) {
    console.log(`• Check Netlify deployment status at: ${colors.yellow}https://app.netlify.com${colors.reset}`);
  }
  
  console.log(`\n${colors.green}✨ Health check complete!${colors.reset}\n`);
}

// Run the health check
runHealthCheck().catch(error => {
  console.error(`${colors.red}Fatal error during health check:${colors.reset}`, error);
  process.exit(1);
});
