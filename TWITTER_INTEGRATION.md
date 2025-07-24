# Twitter Integration for RuneFlow.xyz

## Twitter OAuth Callback URL

For Twitter API integration and OAuth authentication, use this callback URL in your Twitter App settings:

```
https://runeflow.xyz/auth/twitter/callback
```

## Setup Instructions

### 1. Twitter Developer App Configuration

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App or edit your existing RuneFlow app
3. In the App settings, under **Authentication settings**:
   - **Callback URL:** `https://runeflow.xyz/auth/twitter/callback`
   - **Website URL:** `https://runeflow.xyz`
   - **Terms of Service:** `https://runeflow.xyz#terms`
   - **Privacy Policy:** `https://runeflow.xyz#privacy`

### 2. Required Environment Variables

Add these to your Netlify Environment Variables:

```bash
# Twitter API Configuration
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Twitter OAuth 2.0 (if using OAuth 2.0)
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

### 3. OAuth Flow

1. **User initiates OAuth:** User clicks "Connect Twitter" on your site
2. **Redirect to Twitter:** User is redirected to Twitter's OAuth page
3. **User authorizes:** User grants permissions to your app
4. **Callback handled:** Twitter redirects to `https://runeflow.xyz/auth/twitter/callback`
5. **Token exchange:** Your callback function exchanges the code for access tokens
6. **User authenticated:** User is now connected to Twitter

### 4. Callback Function Features

The Twitter callback function (`netlify/functions/twitter-callback.js`) handles:

- ✅ OAuth success responses
- ❌ OAuth error handling
- 🔄 State parameter validation
- 📝 Comprehensive logging
- 🎨 Styled success/error pages
- 🔒 Secure token handling

### 5. Testing the Integration

#### Test the Callback URL
```bash
curl "https://runeflow.xyz/auth/twitter/callback?code=test123&state=verify"
```

#### Test Error Handling
```bash
curl "https://runeflow.xyz/auth/twitter/callback?error=access_denied&error_description=User+denied+access"
```

### 6. Integration with n8n Templates

Once Twitter is connected, users can use Twitter-enabled automation templates:

- **Social Media Posting:** Auto-post to Twitter from various triggers
- **Content Scheduling:** Schedule tweets based on events
- **Mention Monitoring:** Track mentions and respond automatically
- **Analytics Collection:** Gather Twitter metrics and analytics
- **Cross-platform Posting:** Post to Twitter + other social platforms

### 7. Security Features

- **CORS Protection:** Proper CORS headers for security
- **State Validation:** Prevents CSRF attacks
- **Error Logging:** Comprehensive error tracking
- **Token Security:** Secure handling of OAuth tokens
- **User Privacy:** No sensitive data exposed in logs

### 8. Troubleshooting

#### Common Issues:

1. **"Invalid Callback URL"**
   - Ensure the callback URL in Twitter Developer Portal matches exactly: `https://runeflow.xyz/auth/twitter/callback`
   - Check that your Twitter app is approved and active

2. **"OAuth Error"**
   - Verify your Twitter API keys are correct
   - Check that your app has the necessary permissions
   - Ensure callback URL is whitelisted

3. **"Missing Parameters"**
   - Twitter should include `code` parameter in successful callbacks
   - Check that OAuth flow is initiated correctly

#### Debug Logs:
Check Netlify function logs for detailed OAuth flow information:
```
🐦 Twitter OAuth Callback received: { method, path, query, headers }
✅ Twitter OAuth code received: [code]
❌ Twitter OAuth error: [error details]
```

### 9. Next Steps

After successful Twitter integration:

1. **Template Selection:** Choose Twitter automation templates
2. **Workflow Setup:** Configure n8n workflows with Twitter nodes
3. **Testing:** Test Twitter posting and monitoring
4. **Go Live:** Deploy your Twitter automation workflows

## Support

For Twitter integration issues:
- Check [Twitter Developer Documentation](https://developer.twitter.com/en/docs)
- Review Netlify function logs
- Contact support at `hello@runeflow.xyz`

---

**RuneFlow.xyz** - Ancient Power. Modern Automation. 🌊⚡
