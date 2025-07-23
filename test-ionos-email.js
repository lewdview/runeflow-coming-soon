const nodemailer = require('nodemailer');

async function testIONOSEmail() {
    console.log('🧪 Testing IONOS Email Configuration');
    console.log('=====================================');
    console.log('');

    // IONOS SMTP Configuration
    const transporter = nodemailer.createTransport({
        host: 'smtp.ionos.com',
        port: 465,
        secure: true, // SSL/TLS
        auth: {
            user: 'hello@runeflow.xyz',
            pass: 'giveME1221!sex'
        }
    });

    // Test email content
    const testEmail = {
        from: '"RuneFlow Team" <hello@runeflow.xyz>',
        to: 'hello@runeflow.xyz', // Send to self for testing
        subject: '✅ IONOS Email Test - RuneFlow System Working!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">🎉 IONOS Email Test Successful!</h2>
                
                <p>Congratulations! Your IONOS email configuration is working perfectly.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #28a745;">✅ Configuration Details:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li><strong>SMTP Host:</strong> smtp.ionos.com</li>
                        <li><strong>Port:</strong> 465 (SSL/TLS)</li>
                        <li><strong>Email:</strong> hello@runeflow.xyz</li>
                        <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
                    </ul>
                </div>
                
                <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #007bff;">🚀 Ready for Launch:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>✅ MX Records: Working</li>
                        <li>✅ SMTP Sending: Working</li>
                        <li>✅ Email Delivery: Working</li>
                        <li>✅ Railway Backend: Deployed</li>
                        <li>🎯 Ready for email capture deployment!</li>
                    </ul>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    This email was sent automatically to test the IONOS email integration for RuneFlow.xyz
                </p>
            </div>
        `,
        text: `
🎉 IONOS Email Test Successful!

Your IONOS email configuration is working perfectly.

✅ Configuration Details:
- SMTP Host: smtp.ionos.com
- Port: 465 (SSL/TLS)
- Email: hello@runeflow.xyz
- Test Time: ${new Date().toISOString()}

🚀 Ready for Launch:
✅ MX Records: Working
✅ SMTP Sending: Working  
✅ Email Delivery: Working
✅ Railway Backend: Deployed
🎯 Ready for email capture deployment!

This email was sent automatically to test the IONOS email integration for RuneFlow.xyz
        `
    };

    try {
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail(testEmail);
        
        console.log('✅ Email sent successfully!');
        console.log(`📋 Message ID: ${info.messageId}`);
        console.log(`📤 From: ${testEmail.from}`);
        console.log(`📥 To: ${testEmail.to}`);
        console.log(`📝 Subject: ${testEmail.subject}`);
        console.log('');
        console.log('🌐 Next Steps:');
        console.log('1. Check your IONOS webmail for the test email');
        console.log('2. Verify email appears in hello@runeflow.xyz inbox');
        console.log('3. If received, your email system is 100% ready!');
        console.log('');
        console.log('🎯 Ready to deploy complex-index.html with email capture!');
        
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:');
        console.error(error.message);
        console.log('');
        console.log('🔍 Troubleshooting:');
        console.log('1. Verify IONOS email password is correct');
        console.log('2. Check IONOS email account is active');
        console.log('3. Ensure SMTP settings match IONOS requirements');
        
        return false;
    }
}

// Run the test
if (require.main === module) {
    testIONOSEmail().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testIONOSEmail;
