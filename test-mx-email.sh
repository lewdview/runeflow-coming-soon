#!/bin/bash

echo "🧪 Testing MX Records for hello@runeflow.xyz"
echo "=============================================="
echo ""

echo "📧 Step 1: Checking MX Records..."
echo "Command: dig MX runeflow.xyz"
echo "Expected: 10 mxint01.1and1.com, 10 mxint02.1and1.com"
echo ""
dig MX runeflow.xyz
echo ""

echo "📧 Step 2: Testing Email Delivery..."
echo "This will attempt to send a test email to hello@runeflow.xyz"
echo ""

# Create test email
TEST_EMAIL="Subject: MX Test - RuneFlow Email Working! $(date)

Hello RuneFlow Team!

This is an automated test to verify MX records are working.

✅ Domain: runeflow.xyz
✅ Email: hello@runeflow.xyz
✅ Time: $(date)
✅ Test Status: MX Record Verification

If you receive this, your email setup is working perfectly!

Next steps:
1. ✅ MX Records Working  
2. 🚀 Ready for email capture deployment
3. 📧 Customer emails will be delivered

Best regards,
RuneFlow Test System"

echo "$TEST_EMAIL"
echo ""
echo "🔍 To send this email manually:"
echo "1. Copy the email content above"
echo "2. Send it to hello@runeflow.xyz from your Gmail"
echo "3. Check your IONOS webmail for delivery"
echo ""
echo "🌐 IONOS Webmail Access:"
echo "- Login to your IONOS account"
echo "- Go to Email section"
echo "- Check hello@runeflow.xyz inbox"
echo ""
echo "⏰ Note: MX records can take 15-60 minutes to propagate"
