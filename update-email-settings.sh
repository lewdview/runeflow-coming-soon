#!/bin/bash

echo "🚀 RuneFlow Gmail SMTP Setup Helper"
echo "===================================="
echo ""

echo "📋 Current email settings in .env:"
echo "-----------------------------------"
grep -E "SMTP_|FROM_" .env
echo ""

echo "📧 What you need to do:"
echo "======================"
echo "1. Go to Gmail → Profile → Manage Google Account"
echo "2. Security → 2-Step Verification (enable if needed)"
echo "3. Security → App passwords → Generate for 'Mail'"
echo "4. Copy the 16-character password"
echo ""

read -p "📝 Enter your Gmail address: " GMAIL_USER
read -p "🔑 Enter your 16-character Gmail App Password: " GMAIL_PASS

echo ""
echo "🔄 Updating .env file with Gmail SMTP settings..."

# Backup original .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"

# Update SMTP settings
sed -i.tmp "s/SMTP_HOST=.*/SMTP_HOST=smtp.gmail.com/" .env
sed -i.tmp "s/SMTP_USER=.*/SMTP_USER=$GMAIL_USER/" .env
sed -i.tmp "s/SMTP_PASS=.*/SMTP_PASS=$GMAIL_PASS/" .env
rm .env.tmp

echo "✅ .env file updated with Gmail settings!"
echo ""

echo "📧 New email settings:"
echo "---------------------"
grep -E "SMTP_|FROM_" .env
echo ""

echo "🧪 Testing email configuration..."
node test-email.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Gmail SMTP is working!"
    echo "✅ Ready to deploy with working email"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Deploy to Railway with these settings"
    echo "2. Test email capture on live site"
    echo "3. Monitor email functionality"
else
    echo ""
    echo "❌ Email test failed. Please check:"
    echo "• Gmail app password is correct (16 characters)"
    echo "• 2-Factor authentication is enabled"
    echo "• App password was generated for 'Mail'"
    echo ""
    echo "🔄 Restoring original .env..."
    cp .env.backup.* .env 2>/dev/null || echo "No backup found"
fi
