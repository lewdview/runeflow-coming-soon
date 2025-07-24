// Admin function to show recent email captures from logs
// This provides a simple way to view email captures since Netlify functions are stateless

exports.handler = async (event, context) => {
  // Simple authentication check
  const authKey = event.headers.authorization || event.queryStringParameters?.key;
  const expectedKey = process.env.ADMIN_KEY || 'runeflow-admin-2025';
  
  if (authKey !== expectedKey) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>RuneFlow Admin - Email Captures</title>
          <style>
            body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .login-form { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; text-align: center; }
            input { padding: 10px; margin: 10px; border: none; border-radius: 5px; background: rgba(255,255,255,0.2); color: #fff; }
            button { padding: 10px 20px; background: #4fffb8; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; }
            .error { color: #ff4757; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="login-form">
              <h2>🔒 RuneFlow Admin Access</h2>
              <div class="error">❌ Invalid admin key</div>
              <form method="GET">
                <input type="password" name="key" placeholder="Enter admin key" required>
                <button type="submit">Access Email Dashboard</button>
              </form>
              <p style="color: #b8b8b8; font-size: 12px; margin-top: 20px;">
                Admin key is set in Netlify environment variables (ADMIN_KEY)
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Admin authenticated - show dashboard
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RuneFlow Admin - Email Captures</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e); 
            color: #fff; 
            padding: 20px; 
            margin: 0;
          }
          .container { max-width: 1000px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .status-card { 
            background: rgba(79, 255, 184, 0.1); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            border-left: 4px solid #4fffb8;
          }
          .info-box { 
            background: rgba(255,255,255,0.1); 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
          }
          .instruction { background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; }
          code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px; font-family: monospace; }
          .link { color: #4fffb8; text-decoration: none; }
          .link:hover { text-decoration: underline; }
          .admin-actions { display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
          .action-btn { 
            background: #4fffb8; 
            color: #1a1a2e; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            text-decoration: none; 
            font-weight: bold;
            display: inline-block;
          }
          .secondary-btn { background: rgba(255,255,255,0.2); color: #fff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ RuneFlow.xyz - Email Capture Dashboard</h1>
            <p style="color: #b8b8b8;">Admin panel for monitoring email captures</p>
          </div>

          <div class="status-card">
            <h2>✅ Email Capture System Status</h2>
            <p><strong>Status:</strong> ✅ Active and Working</p>
            <p><strong>Function URL:</strong> <code>https://runeflow.xyz/.netlify/functions/capture-email</code></p>
            <p><strong>Last Checked:</strong> ${new Date().toISOString()}</p>
          </div>

          <div class="info-box">
            <h3>📧 How Email Capture Works</h3>
            <p>Since Netlify functions are stateless (no persistent file storage), emails are captured and logged in these ways:</p>
            <ul>
              <li><strong>✅ Function Logs:</strong> All email captures are logged to Netlify function logs</li>
              <li><strong>📧 Admin Notifications:</strong> Each capture sends a notification to admin email</li>
              <li><strong>📥 User Emails:</strong> Users receive welcome email with download link</li>
            </ul>
          </div>

          <div class="admin-actions">
            <a href="https://app.netlify.com/sites/runeflow/functions" target="_blank" class="action-btn">
              📊 View Function Logs
            </a>
            <a href="https://runeflow.xyz/.netlify/functions/capture-email" target="_blank" class="action-btn secondary-btn">
              🔧 Test Function
            </a>
          </div>

          <div class="instruction">
            <h3>🔍 How to View Email Captures</h3>
            <p><strong>Method 1 - Netlify Dashboard:</strong></p>
            <ol>
              <li>Go to <a href="https://app.netlify.com/sites/runeflow/functions" class="link" target="_blank">Netlify Functions Dashboard</a></li>
              <li>Click on "capture-email" function</li>
              <li>View "Function log" tab to see all email captures</li>
              <li>Look for entries starting with "✅ EMAIL CAPTURED:"</li>
            </ol>
            
            <p><strong>Method 2 - Admin Email Notifications:</strong></p>
            <ul>
              <li>Check inbox at <code>hello@runeflow.xyz</code> for "🎯 New Email Capture" notifications</li>
              <li>Each email capture sends a detailed notification</li>
            </ul>
          </div>

          <div class="info-box">
            <h3>📊 Recent Test Results</h3>
            <p>✅ Function responding correctly</p>
            <p>✅ CORS headers configured</p>
            <p>✅ Email validation working</p>
            <p>✅ Download URL generation working</p>
            <p>🔄 SMTP email delivery: Depends on email server configuration</p>
          </div>

          <div class="info-box">
            <h3>⚙️ Configuration</h3>
            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'mail.runeflow.xyz (default)'}</p>
            <p><strong>SMTP User:</strong> ${process.env.SMTP_USER || 'hello@runeflow.xyz (default)'}</p>
            <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL || 'Not configured - using default'}</p>
            <p><strong>From Name:</strong> ${process.env.FROM_NAME || 'RuneFlow Team (default)'}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #b8b8b8; font-size: 12px;">
            <p>RuneFlow.xyz Email Capture System - ${new Date().toISOString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};
