const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Simple authentication check
  const authKey = event.headers.authorization || event.queryStringParameters?.key;
  const expectedKey = process.env.ADMIN_KEY || 'runeflow-admin-2025';
  
  if (authKey !== expectedKey) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Unauthorized - Invalid admin key',
        success: false
      })
    };
  }

  try {
    console.log('🔧 Starting SMTP test...');
    
    // Get email configuration - Updated for IONOS/1&1 hosting
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.ionos.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'hello@runeflow.xyz',
        pass: process.env.SMTP_PASS || 'giveME1221!sex'
      }
    };

    console.log('📋 SMTP Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
      pass: smtpConfig.auth.pass ? '***HIDDEN***' : 'NOT SET'
    });

    // Create transporter
    const transporter = nodemailer.createTransporter(smtpConfig);

    // Verify SMTP connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    const testEmail = {
      from: `"RuneFlow SMTP Test" <${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}>`,
      to: process.env.ADMIN_EMAIL || 'hello@runeflow.xyz',
      subject: '🧪 SMTP Test - RuneFlow.xyz',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #4fffb8;">🧪 SMTP Test Successful!</h2>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>SMTP Host:</strong> ${smtpConfig.host}</p>
            <p><strong>SMTP Port:</strong> ${smtpConfig.port}</p>
            <p><strong>SMTP User:</strong> ${smtpConfig.auth.user}</p>
            <p><strong>From Email:</strong> ${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}</p>
            <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL || 'hello@runeflow.xyz'}</p>
          </div>
          <p style="color: #4fffb8;">✅ If you're reading this, SMTP is working correctly!</p>
          <p style="color: #b8b8b8; font-size: 12px;">This is an automated SMTP test from RuneFlow.xyz</p>
        </div>
      `
    };

    console.log('📧 Sending test email...');
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully:', result.messageId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'SMTP test completed successfully',
        config: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.auth.user,
          from: process.env.FROM_EMAIL || 'hello@runeflow.xyz',
          to: process.env.ADMIN_EMAIL || 'hello@runeflow.xyz'
        },
        result: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'SMTP test failed',
        details: error.message,
        config: {
          host: process.env.SMTP_HOST || 'mail.runeflow.xyz',
          port: process.env.SMTP_PORT || 587,
          user: process.env.SMTP_USER || 'hello@runeflow.xyz',
          passwordSet: !!(process.env.SMTP_PASS)
        },
        timestamp: new Date().toISOString()
      })
    };
  }
};
