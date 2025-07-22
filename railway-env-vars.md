# Railway Environment Variables

Copy these into Railway's environment variable dashboard:

## Required Variables (Production Ready)
```
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Email Configuration (CONFIGURED - READY TO USE)
SMTP_HOST=mail.runeflow.xyz
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=giveME1221!sex
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team
ADMIN_EMAIL=hello@runeflow.xyz
ADMIN_KEY=runeflow-admin-2025
```

## Optional Variables (Add if needed)
```
# Social Media (Add if you want automation)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=your_ga_id
GOOGLE_TAG_MANAGER_ID=your_gtm_id

# Notifications (Optional)
DISCORD_WEBHOOK_URL=your_discord_webhook_url
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## Railway Deploy Steps (runeflow.xyz already configured):
1. Your GitHub repository is already connected to Railway
2. Add/update the required environment variables above in Railway dashboard
3. Deploy - Railway will automatically detect it's a Node.js app
4. Your app will be available at: https://runeflow.xyz (custom domain already configured)

## Quick Deploy Commands:
```bash
# Push to main branch to trigger Railway deployment
git add .
git commit -m "Update environment variables and deploy"
git push origin main
```

## Railway Dashboard Links:
- Project: https://railway.app/project/your-project-id
- Environment Variables: Railway Dashboard → Your Project → Variables
- Logs: Railway Dashboard → Your Project → Deployments → View Logs
