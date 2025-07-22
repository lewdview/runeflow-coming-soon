# 📧 Gmail SMTP Setup Guide for RuneFlow

## 🚀 Step-by-Step Gmail Setup

### Step 1: Enable 2-Factor Authentication
1. Go to **Gmail** in your browser
2. Click your profile picture → **"Manage your Google Account"**
3. Go to **"Security"** in the left sidebar
4. Find **"2-Step Verification"** and click it
5. Follow the prompts to enable it (if not already enabled)

### Step 2: Generate App Password
1. Still in **Security** section
2. Look for **"App passwords"** (may need to scroll down)
3. Click **"App passwords"**
4. You may need to enter your password again
5. Select **"Mail"** from the dropdown
6. Click **"Generate"**
7. **COPY THE 16-CHARACTER PASSWORD** that appears
8. **Save this password** - you won't see it again!

### Step 3: Update Your .env File
Replace your current email settings with Gmail SMTP:

**BEFORE (broken):**
```env
SMTP_HOST=mail.runeflow.xyz
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=giveME1221!sex
```

**AFTER (working):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team
```

### Step 4: Test the Setup
```bash
node test-email.js
```

## 🔍 Visual Guide

### Finding App Passwords:
1. **Gmail → Profile Picture → Manage Google Account**
2. **Security (left sidebar)**
3. **Scroll down to "App passwords"**
4. **Select "Mail" → Generate**

### What the App Password Looks Like:
- **Format**: `abcd efgh ijkl mnop` (16 characters with spaces)
- **Example**: `xyzw abcd 1234 5678`
- **Use without spaces**: `xyzwabcd12345678`

## ⚠️ Important Notes

1. **Use App Password, NOT your Gmail password**
2. **2FA must be enabled first**
3. **Keep the app password secret**
4. **You can still use hello@runeflow.xyz as the "from" email**

## 🧪 Expected Test Results

When working, you'll see:
```
✅ SMTP Connection: SUCCESS
✅ Test Email Sent Successfully!
🎉 EMAIL CREDENTIALS ARE WORKING! 🎉
```

## 🚨 Common Issues

**"App passwords" not showing?**
- Make sure 2FA is fully enabled
- Try refreshing the page
- Some accounts need to wait 10-15 minutes after enabling 2FA

**"Invalid credentials" error?**
- Double-check the app password (no spaces)
- Make sure you're using the app password, not regular password
- Try generating a new app password

## ✅ Success Checklist

- [ ] 2FA enabled on Gmail
- [ ] App password generated and saved
- [ ] .env file updated with Gmail settings
- [ ] Test email sent successfully
- [ ] Ready to deploy with working email!
