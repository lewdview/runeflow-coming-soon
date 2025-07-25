# 📪 Ansuz - The Messenger

**Rune:** ᚨᚾᛊᚢᛉ (Ansuz) - The Messenger Rune  
**Ancient Meaning:** Communication + Wisdom = Effective Messaging Automation  
**Modern Power:** Consolidated Email Campaign Setup  
**Value:** $49 (FREE in RuneFlow Starter Pack)

---

## 🎯 What This Template Does

Automates email signup and onboarding, sends customized welcome emails, logs data to Google Sheets, and triggers notifications.

### ✨ Key Features

- 💌 **Automated Welcome Emails** - Sends personalized onboarding emails
- 🗃️ **CRM Tagging** - Categorizes contacts in HubSpot
- ⏰ **Scheduled Follow-Ups** - Delays and multi-step sequences
- 📊 **Google Sheets Logging** - Tracks signups and data
- 🔔 **Slack Notifications** - Alerts for new signups

---

## 📁 Files Included

1. **`ansuz-messenger-workflow.json`** - Complete n8n workflow
2. **`example-email-config.json`** - Sample email configuration
3. **`README.md`** - This documentation

---

## ⚡ Quick Start

### 1. **Import Workflow**
1. Open your n8n instance
2. Click "Import from File"
3. Select "ansuz-messenger-workflow.json"
4. Click "Import"

### 2. **Configure Email Sending**
1. In n8n, create new SMTP email credentials
2. Use the structure in `example-email-config.json`
3. Test sending a welcome email to yourself

### 3. **Set Up CRM and Tracking**
1. Add your HubSpot API key to the workflow settings
2. Connect to your Google Sheets and import tracking template

### 4. **Customize Welcome Email**
1. Edit email content directly in the workflow
2. Use dynamic placeholders like `{{ $json.name }}` for personalization

### 5. **Test  26 Run**
1. Add test data in Set nodes to simulate a signup
2. Execute the workflow
3. Verify email and Slack notifications
4. Check Google Sheets for appended data

---

## 💡 Customization Options

### Change Notification Channels
Modify Slack channel or add new webhook integrations

### Add More Email Steps
Integrate additional email steps using the EmailSend node

### Enhance CRM Integration
Add more fields and customization options for CRM tagging

### Explore Multi-Step Sequences
Create rich sequences for user onboarding, tutorials, and offers

---

## ❓ Troubleshooting

### Common Issues

**Emails Not Sending**
- Verify SMTP credentials
- Check recipient email format

**Google Sheets Not Logging**
- Check Google Sheets API setup
- Verify sheet permissions

**Slack Notifications Failing**
- Confirm Slack authentication
- Check channel name and permissions

### Getting Help
- 📧 **Email:** support@runeflow.xyz
- 💬 **Discord:** discord.gg/runeflow  
- 🌐 **Docs:** https://docs.runeflow.xyz

---

**Connect effectively with the wisdom of Ansuz!**

*— The RuneFlow Masters*

© 2025 RuneFlow.xyz - Ancient Power. Modern Automation.
