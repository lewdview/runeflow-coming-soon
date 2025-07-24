# Netlify Environment Variables

## Step 1: Set up Netlify Environment Variables

Go to your Netlify site dashboard → Site settings → Environment variables

### Required Variables (Production Ready)
```
NODE_VERSION=18

# Email Configuration (CONFIGURED - WORKING WITH IONOS)
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=giveME1221!sex
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team
ADMIN_EMAIL=hello@runeflow.xyz
ADMIN_KEY=runeflow-admin-2025

# Database Configuration (Optional - for storing email captures)
DATABASE_URL=postgresql://username:password@host:port/database
# OR use individual database settings:
DB_HOST=your-postgres-host
DB_USER=runeflow_api
DB_PASS=your-database-password
DB_NAME=runeflow
DB_PORT=5432
```

### Optional Variables (Add if needed)
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

## Step 2: Netlify Deploy Steps (runeflow.xyz already configured)

### Your Setup:
- GitHub repository is already connected to Netlify
- Custom domain runeflow.xyz is already configured
- Build settings are already configured:
  - Build command: `npm run build-static`
  - Publish directory: `dist`
  - Functions directory: `netlify/functions`

### To Deploy:
1. Add/update environment variables in Netlify dashboard (Site settings → Environment variables)
2. Push to main branch to trigger automatic deployment:
   ```bash
   git add .
   git commit -m "Update for Netlify deployment"
   git push origin main
   ```

### Manual Deploy (if needed):
1. Run locally: `npm run build-static`
2. Drag the `dist` folder to Netlify dashboard
3. Redeploy

## Step 3: Test Your Deployment

Your functions will be available at:
- `https://runeflow.xyz/.netlify/functions/health`
- `https://runeflow.xyz/.netlify/functions/capture-email`
- Main site: `https://runeflow.xyz`

## What's Different from Railway?

- **Railway**: Full Node.js server running 24/7
- **Netlify**: Static site + serverless functions (only run when called)
- **Cost**: Netlify has generous free tier, Railway charges for continuous running
- **Performance**: Both are fast, Netlify functions have cold start delay
- **Database**: Both need external database for persistent storage

## Need Help?
- Netlify docs: https://docs.netlify.com/functions/overview/
- Test your functions using the Netlify dev CLI: `npx netlify dev`
