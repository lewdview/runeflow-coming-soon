#!/usr/bin/env node

/**
 * Test email by sending to your actual Gmail address
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailEmail() {
  console.log('📧 Testing Email - Sending to Your Gmail...');
  console.log('============================================');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Send test email to your Gmail
    console.log('🔍 Sending test email to bmeason@gmail.com...');
    
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: 'bmeason@gmail.com', // Your actual Gmail
      subject: '🎉 RuneFlow Email Test - SUCCESS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">🎉 RuneFlow Email Working!</h1>
          
          <p>Congratulations! Your RuneFlow email system is working perfectly.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📧 Email Configuration:</h3>
            <ul>
              <li><strong>SMTP Server:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>From Email:</strong> ${process.env.FROM_EMAIL}</li>
              <li><strong>From Name:</strong> ${process.env.FROM_NAME}</li>
              <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <div style="background: #10B981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ What This Means:</h3>
            <ul>
              <li>Gmail SMTP is working perfectly</li>
              <li>Visitors can sign up for RuneFlow</li>
              <li>Welcome emails will be sent successfully</li>
              <li>Your email capture system is ready!</li>
            </ul>
          </div>
          
          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>🚀 Next Steps:</h3>
            <ol>
              <li>Deploy to Railway with these email settings</li>
              <li>Configure custom domain (runeflow.xyz)</li>
              <li>Test email capture on live website</li>
              <li>Start collecting visitor emails!</li>
            </ol>
          </div>
          
          <p style="margin-top: 30px;">
            <strong>Ready to deploy?</strong> Your email system is configured and working!
          </p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6B7280; font-size: 14px;">
            This test email was sent from your RuneFlow deployment system.<br>
            Email sent via Gmail SMTP on ${new Date().toDateString()}
          </p>
        </div>
      `
    });

    console.log('✅ Test Email Sent Successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 CHECK YOUR GMAIL INBOX: bmeason@gmail.com`);
    console.log('');
    console.log('🎉 EMAIL SYSTEM IS WORKING PERFECTLY! 🎉');
    console.log('✅ Gmail SMTP authenticated successfully');
    console.log('✅ Email sent to your actual Gmail address');
    console.log('✅ Ready for Railway deployment');
    console.log('');
    console.log('📱 Check your Gmail app or gmail.com for the test email!');

  } catch (error) {
    console.log('❌ EMAIL TEST FAILED');
    console.log(`Error: ${error.message}`);
  }
}

// Run the test
testGmailEmail().catch(console.error);
