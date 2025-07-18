# RuneFlow Deployment Instructions

## Prerequisites
- Node.js v16+ installed on your server
- SSH access to your server
- Domain pointing to your server

## Deployment Steps

### 1. Upload Files
Upload the entire 'runeflow' folder to your server:
```bash
scp -r runeflow/ user@your-server.com:/path/to/deployment/
```

### 2. SSH into Your Server
```bash
ssh user@your-server.com
cd /path/to/deployment/runeflow
```

### 3. Install Dependencies
```bash
source ~/.nvm/nvm.sh  # If using NVM
npm install
```

### 4. Configure Environment
Edit the .env file with your settings:
```bash
nano .env
```

### 5. Start the Application
```bash
# For development
npm start

# For production (with PM2)
npm install -g pm2
pm2 start automation/server.js --name runeflow
pm2 save
pm2 startup
```

### 6. Configure Reverse Proxy (Optional)
If you want to use port 80/443, configure Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Testing

1. Visit your domain to see the coming soon page
2. Test email signup functionality
3. Check server logs for any errors

## Monitoring

- Check logs: `pm2 logs runeflow`
- Monitor status: `pm2 status`
- Restart if needed: `pm2 restart runeflow`

## Troubleshooting

### Common Issues:
1. **Port already in use**: Change PORT in .env file
2. **Permission errors**: Check file permissions
3. **Module not found**: Run `npm install` again
4. **Email not sending**: Check SMTP settings in .env

### Support:
For issues, contact bryan@webhalla.com
