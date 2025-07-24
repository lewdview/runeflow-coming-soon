const nodemailer = require('nodemailer');

// For Netlify deployment - use external storage or logging
// Since Netlify functions are stateless, we'll log emails and send notifications
function logEmailCapture(emailData) {
  console.log('✅ EMAIL CAPTURED:', JSON.stringify(emailData, null, 2));
  
  // Send notification to admin email if configured
  if (process.env.ADMIN_EMAIL) {
    sendAdminNotification(emailData).catch(error => {
      console.error('❌ Admin notification failed:', error);
    });
  }
  
  return true;
}

// Send admin notification about new email capture
async function sendAdminNotification(emailData) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'hello@runeflow.xyz',
      pass: process.env.SMTP_PASS || 'giveME1221!sex'
    }
  });

  await transporter.sendMail({
    from: `"RuneFlow System" <${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}>`,
    to: process.env.ADMIN_EMAIL || 'hello@runeflow.xyz',
    subject: '🎯 New Email Capture - RuneFlow.xyz',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #4fffb8;">📧 New Email Captured</h2>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Email:</strong> ${emailData.email}</p>
          <p><strong>Timestamp:</strong> ${emailData.timestamp}</p>
          <p><strong>Selected Rune:</strong> ${emailData.selected_rune || 'None'}</p>
          <p><strong>Free Pack:</strong> ${emailData.is_free_pack ? 'Yes' : 'No'}</p>
          <p><strong>IP Address:</strong> ${emailData.ip || 'Unknown'}</p>
          <p><strong>User Agent:</strong> ${emailData.userAgent || 'Unknown'}</p>
        </div>
        <p style="color: #b8b8b8; font-size: 12px;">This is an automated notification from RuneFlow.xyz email capture system.</p>
      </div>
    `
  });
}

exports.handler = async (event, context) => {
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, selected_rune, is_free_pack } = JSON.parse(event.body);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid email address',
          success: false 
        })
      };
    }

    // For Netlify deployment, we'll allow duplicate submissions since we don't have persistent storage
    // In a production setup, you'd want to use a database or external service for deduplication

    // Store email data for logging and notifications
    const emailEntry = {
      email,
      timestamp: new Date().toISOString(),
      selected_rune: selected_rune || null,
      is_free_pack: is_free_pack || false,
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'],
      userAgent: event.headers['user-agent']
    };

    // Log the email capture (appears in Netlify function logs)
    logEmailCapture(emailEntry);

    // Email configuration - Updated for IONOS/1&1 hosting
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'hello@runeflow.xyz',
        pass: process.env.SMTP_PASS || 'giveME1221!sex'
      }
    });

    // Send welcome email
    try {
      await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'RuneFlow Team'}" <${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}>`,
        to: email,
        subject: '⚡ Your Week 1 ASMR FlowRune Template is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffffff; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4fffb8; margin: 0; font-size: 28px;">⚡ FlowRune: Viral ASMR Creator</h1>
              <p style="color: #b8b8b8; font-size: 16px; margin: 10px 0;">Ancient Power. Modern Automation.</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4fffb8; margin-top: 0;">🔮 Laguz-Raidho (FlowRune) Template</h2>
              <p><strong>Package:</strong> Week 1 ASMR Creator ($97 value)</p>
              <p><strong>Features:</strong></p>
              <ul style="padding-left: 20px;">
                <li>✨ Viral ASMR video generation</li>
                <li>📱 Multi-platform auto-posting</li>
                <li>🤖 AI-powered content creation</li>
                <li>🎵 4-layer sound optimization</li>
                <li>📊 Dynamic content tracking</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://runeflow.xyz/assets/downloads/flowrune-asmr-v1.zip" style="background: linear-gradient(45deg, #4fffb8, #00d4ff); color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">📥 Download Your FlowRune Template</a>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4fffb8; margin-top: 0;">⚡ Prerequisites:</h3>
              <ul style="padding-left: 20px; font-size: 14px;">
                <li>OpenRouter API key (for AI agents)</li>
                <li>Fal AI API key (for video generation)</li>
                <li>Blotato API key (for social posting)</li>
                <li>Google Sheets access</li>
              </ul>
            </div>
            
            <p style="text-align: center; color: #b8b8b8; font-size: 14px; margin-top: 30px;">
              Need help? Contact us at <a href="mailto:hello@runeflow.xyz" style="color: #4fffb8;">hello@runeflow.xyz</a><br>
              Follow us: <a href="https://x.com/runeflowxyz" style="color: #4fffb8;">@runeflowxyz</a>
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the whole request if email fails
    }

    // Return success with download URL - ONLY Week 1 ASMR Rune Package
    let downloadUrl = null;
    if (is_free_pack && selected_rune) {
      // Only provide the Week 1 ASMR FlowRune package regardless of selection
      downloadUrl = '/assets/downloads/flowrune-asmr-v1.zip';
    } else {
      // Default fallback to Week 1 ASMR package
      downloadUrl = '/assets/downloads/flowrune-asmr-v1.zip';
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Email captured successfully',
        success: true,
        download_url: downloadUrl,
        selected_rune: selected_rune
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        success: false
      })
    };
  }
};
