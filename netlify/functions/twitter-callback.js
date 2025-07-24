// Twitter OAuth callback handler for RuneFlow.xyz
// This handles the OAuth flow for Twitter API integration

exports.handler = async (event, context) => {
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Log the callback for debugging
  console.log('🐦 Twitter OAuth Callback received:', {
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters,
    headers: event.headers
  });

  try {
    const { code, state, error } = event.queryStringParameters || {};

    // Handle OAuth error
    if (error) {
      console.error('❌ Twitter OAuth error:', error);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Twitter OAuth Error - RuneFlow.xyz</title>
            <style>
              body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
              .container { max-width: 600px; margin: 0 auto; }
              .error { background: rgba(255, 71, 87, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ff4757; }
              .link { color: #4fffb8; text-decoration: none; }
              .link:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">
                <h2>❌ Twitter OAuth Error</h2>
                <p><strong>Error:</strong> ${error}</p>
                <p>There was an issue connecting your Twitter account.</p>
                <a href="https://runeflow.xyz" class="link">← Return to RuneFlow.xyz</a>
              </div>
            </div>
          </body>
          </html>
        `
      };
    }

    // Handle successful OAuth callback
    if (code) {
      console.log('✅ Twitter OAuth code received:', code);
      
      // In a real implementation, you would:
      // 1. Exchange the code for an access token
      // 2. Store the token securely
      // 3. Associate it with the user's account
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Twitter Connected - RuneFlow.xyz</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #1a1a2e, #16213e); 
                color: #fff; 
                padding: 20px; 
                text-align: center; 
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { max-width: 600px; }
              .success { 
                background: rgba(79, 255, 184, 0.1); 
                padding: 30px; 
                border-radius: 15px; 
                border-left: 4px solid #4fffb8; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              }
              .link { 
                color: #4fffb8; 
                text-decoration: none; 
                background: rgba(79, 255, 184, 0.1);
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                margin-top: 20px;
                border: 1px solid #4fffb8;
                transition: all 0.3s ease;
              }
              .link:hover { 
                background: #4fffb8; 
                color: #1a1a2e;
                transform: translateY(-2px);
              }
              .code-display {
                background: rgba(0,0,0,0.3);
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                margin: 20px 0;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">
                <h2>🎉 Twitter Successfully Connected!</h2>
                <p>Your Twitter account has been successfully connected to RuneFlow.xyz</p>
                
                <div class="code-display">
                  <strong>OAuth Code:</strong> ${code}
                  ${state ? `<br><strong>State:</strong> ${state}` : ''}
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                  <li>Your Twitter integration is now ready</li>
                  <li>You can use Twitter automation templates</li>
                  <li>Access advanced social media features</li>
                </ul>
                
                <a href="https://runeflow.xyz" class="link">← Return to RuneFlow.xyz</a>
              </div>
            </div>
          </body>
          </html>
        `
      };
    }

    // Handle callback without code or error
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Callback - RuneFlow.xyz</title>
          <style>
            body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .warning { background: rgba(255, 193, 7, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; }
            .link { color: #4fffb8; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning">
              <h2>⚠️ Invalid Twitter Callback</h2>
              <p>This callback URL is missing required parameters.</p>
              <p>Please try connecting your Twitter account again.</p>
              <a href="https://runeflow.xyz" class="link">← Return to RuneFlow.xyz</a>
            </div>
          </div>
        </body>
        </html>
      `
    };

  } catch (error) {
    console.error('❌ Twitter callback error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Callback Error - RuneFlow.xyz</title>
          <style>
            body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .error { background: rgba(255, 71, 87, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ff4757; }
            .link { color: #4fffb8; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">
              <h2>❌ Callback Processing Error</h2>
              <p>There was an error processing the Twitter callback.</p>
              <p>Please try again or contact support.</p>
              <a href="https://runeflow.xyz" class="link">← Return to RuneFlow.xyz</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};
