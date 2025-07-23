const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email storage file path
const EMAIL_STORAGE_PATH = path.join(process.cwd(), 'data', 'emails.json');

// Load existing emails from file
function loadEmails() {
  try {
    if (fs.existsSync(EMAIL_STORAGE_PATH)) {
      const data = fs.readFileSync(EMAIL_STORAGE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading emails:', error);
  }
  return [];
}

// Save emails to file
function saveEmails(emails) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(EMAIL_STORAGE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(EMAIL_STORAGE_PATH, JSON.stringify(emails, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving emails:', error);
    return false;
  }
}

// Load emails at startup
let emailList = loadEmails();

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

    // Check for duplicates
    const existingEmail = emailList.find(entry => entry.email === email);
    if (existingEmail) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Email already registered',
          success: true,
          duplicate: true
        })
      };
    }

    // Store email
    const emailEntry = {
      email,
      timestamp: new Date().toISOString(),
      selected_rune: selected_rune || null,
      is_free_pack: is_free_pack || false,
      ip: event.headers['client-ip'] || event.headers['x-forwarded-for'],
      userAgent: event.headers['user-agent']
    };

    emailList.push(emailEntry);
    
    // Save updated email list to file
    const saved = saveEmails(emailList);
    if (!saved) {
      console.warn('Failed to save email to persistent storage');
    }

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.runeflow.xyz',
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
              <a href="https://runeflow.xyz${downloadUrl}" style="background: linear-gradient(45deg, #4fffb8, #00d4ff); color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">📥 Download Your FlowRune Template</a>
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
              Need help? Contact us at <a href="mailto:support@runeflow.co" style="color: #4fffb8;">support@runeflow.co</a><br>
              Follow us: <a href="https://runeflow.co" style="color: #4fffb8;">runeflow.co</a> | Discord: discord.gg/runeflow
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
