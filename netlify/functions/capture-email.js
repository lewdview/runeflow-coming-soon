const nodemailer = require('nodemailer');

// Simple in-memory storage for demo (use database in production)
let emailList = [];

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, selected_rune, is_free_pack } = JSON.parse(event.body);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
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
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
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

    // Email configuration
    const transporter = nodemailer.createTransporter({
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
        subject: '🎉 Welcome to RuneFlow - Your Automation Templates Await!',
        html: `
          <h1>Welcome to RuneFlow! 🚀</h1>
          <p>Thank you for joining our automation community!</p>
          <p>Selected Rune: <strong>${selected_rune || 'General Template'}</strong></p>
          <p>We'll notify you when RuneFlow launches with your free templates.</p>
          <p>Best regards,<br>The RuneFlow Team</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the whole request if email fails
    }

    // Return success with download URL
    let downloadUrl = null;
    if (is_free_pack && selected_rune) {
      downloadUrl = `/assets/downloads/${selected_rune}-template.json`;
    } else {
      downloadUrl = '/assets/downloads/starter-rune-template.json';
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
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
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        success: false
      })
    };
  }
};
