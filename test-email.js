#!/usr/bin/env node

/**
 * Test email credentials and SMTP connection
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailCredentials() {
  console.log('📧 Testing Email Configuration...');
  console.log('=====================================');
  
  // Show current email settings (hide password)
  console.log('📋 Current Email Settings:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '***HIDDEN***' : 'NOT SET'}`);
  console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
  console.log(`FROM_NAME: ${process.env.FROM_NAME || 'NOT SET'}`);
  console.log('');

  // Create transporter with your settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.runeflow.xyz',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'hello@runeflow.xyz',
      pass: process.env.SMTP_PASS || 'giveME1221!sex'
    },
    // Add debugging
    debug: true,
    logger: true
  });

  try {
    console.log('🔍 Step 1: Testing SMTP Connection...');
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP Connection: SUCCESS');
    console.log('✅ Email server is reachable and credentials are valid');
    console.log('');

    console.log('🔍 Step 2: Sending Test Email...');
    // Send test email
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'RuneFlow Test'}" <${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}>`,
      to: process.env.FROM_EMAIL || 'hello@runeflow.xyz', // Send to yourself
      subject: '🧪 RuneFlow Email Test - ' + new Date().toISOString(),
      html: `
        <h1>🎉 Email Test Successful!</h1>
        <p>Your RuneFlow email configuration is working properly.</p>
        <p><strong>Test performed at:</strong> ${new Date().toISOString()}</p>
        <p><strong>From server:</strong> ${process.env.SMTP_HOST || 'mail.runeflow.xyz'}</p>
        <p><strong>Using credentials:</strong> ${process.env.SMTP_USER || 'hello@runeflow.xyz'}</p>
        
        <h2>Next Steps:</h2>
        <ul>
          <li>✅ Email credentials are working</li>
          <li>🔧 Now fix the deployment to use these credentials</li>
          <li>🚀 Deploy and test email capture functionality</li>
        </ul>
        
        <p>This confirms your SMTP setup is ready for production!</p>
      `
    });

    console.log('✅ Test Email Sent Successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Check your email: ${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}`);
    console.log('');
    console.log('🎉 EMAIL CREDENTIALS ARE WORKING! 🎉');
    console.log('✅ SMTP connection successful');
    console.log('✅ Authentication successful');
    console.log('✅ Email delivery successful');
    console.log('');
    console.log('💡 Next: Configure these credentials in your deployment platform');

  } catch (error) {
    console.log('❌ EMAIL TEST FAILED');
    console.log('===================');
    console.log(`Error: ${error.message}`);
    console.log('');
    
    if (error.code === 'EAUTH') {
      console.log('🚨 AUTHENTICATION FAILED');
      console.log('Possible issues:');
      console.log('• Wrong username or password');
      console.log('• Two-factor authentication enabled');
      console.log('• App-specific password required');
      console.log('• Account security settings blocking access');
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      console.log('🚨 CONNECTION FAILED');
      console.log('Possible issues:');
      console.log('• Wrong SMTP server hostname');
      console.log('• Wrong port number');
      console.log('• Firewall blocking connection');
      console.log('• Server is down');
    } else {
      console.log('🚨 OTHER ERROR');
      console.log('Full error details:', error);
    }
    
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. Verify email credentials in your email provider');
    console.log('2. Check if mail.runeflow.xyz is the correct SMTP server');
    console.log('3. Try using standard ports (587 for TLS, 465 for SSL)');
    console.log('4. Check if your hosting provider blocks SMTP');
    console.log('5. Consider using email service like SendGrid, Mailgun, etc.');
  }
}

// Run the test
testEmailCredentials().catch(console.error);
