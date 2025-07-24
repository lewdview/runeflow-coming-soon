const nodemailer = require('nodemailer');

// SMTP Test Configuration - Updated for IONOS/1&1 hosting
const smtpConfig = {
  host: 'smtp.ionos.com', // IONOS SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'hello@runeflow.xyz',
    pass: 'giveME1221!sex'
  }
};

async function testSMTP() {
  console.log('🔧 Starting local SMTP test...');
  console.log('📋 SMTP Configuration:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.auth.user,
    pass: smtpConfig.auth.pass ? '***CONFIGURED***' : 'NOT SET'
  });

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);

    // Verify SMTP connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    const testEmail = {
      from: '"RuneFlow SMTP Test" <hello@runeflow.xyz>',
      to: 'hello@runeflow.xyz',
      subject: '🧪 Local SMTP Test - RuneFlow.xyz',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #4fffb8;">🧪 Local SMTP Test Successful!</h2>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>SMTP Host:</strong> ${smtpConfig.host}</p>
            <p><strong>SMTP Port:</strong> ${smtpConfig.port}</p>
            <p><strong>SMTP User:</strong> ${smtpConfig.auth.user}</p>
          </div>
          <p style="color: #4fffb8;">✅ If you're reading this, SMTP is working correctly!</p>
          <p style="color: #b8b8b8; font-size: 12px;">This is a local SMTP test for RuneFlow.xyz</p>
        </div>
      `
    };

    console.log('📧 Sending test email...');
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📊 Email Result:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    });

    return {
      success: true,
      message: 'SMTP test completed successfully',
      result: result
    };

  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

// Run the test
testSMTP().then(result => {
  console.log('\n🏁 Test Complete:', result.success ? '✅ SUCCESS' : '❌ FAILED');
  if (!result.success) {
    console.log('💥 Error Details:', result.error);
  }
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
