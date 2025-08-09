const sgMail = require('@sendgrid/mail');
const db = require('../database/db');
const s3Service = require('./s3');

class EmailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.fromEmail = process.env.FROM_EMAIL;
        this.fromName = process.env.FROM_NAME;
    }

    /**
     * Send welcome email with download links
     */
    async sendWelcomeEmail(user, productType = 'main') {
        try {
            const downloadFiles = await s3Service.getUserDownloadableFiles(
                user.id, 
                '127.0.0.1', // Server IP for system-generated tokens
                'System'
            );

            const emailData = {
                to: user.email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: productType === 'main' 
                    ? '🎉 Your RuneFlow Templates Are Ready!' 
                    : '🚀 Welcome to RuneFlow Lifetime Vault Access!',
                html: this.getWelcomeEmailTemplate(user, downloadFiles, productType),
                text: this.getWelcomeEmailText(user, downloadFiles, productType)
            };

            await sgMail.send(emailData);
            console.log(`✅ Welcome email sent to ${user.email}`);

        } catch (error) {
            console.error('Failed to send welcome email:', error);
            throw error;
        }
    }

    /**
     * Send upsell email
     */
    async sendUpsellEmail(user) {
        try {
            const emailData = {
                to: user.email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: '🚀 EXCLUSIVE: Upgrade to Lifetime Vault Access (24hrs only)',
                html: this.getUpsellEmailTemplate(user),
                text: this.getUpsellEmailText(user)
            };

            await sgMail.send(emailData);
            console.log(`✅ Upsell email sent to ${user.email}`);

        } catch (error) {
            console.error('Failed to send upsell email:', error);
            throw error;
        }
    }

    /**
     * Send follow-up email
     */
    async sendFollowUpEmail(user) {
        try {
            const emailData = {
                to: user.email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: 'How are your n8n automations going?',
                html: this.getFollowUpEmailTemplate(user),
                text: this.getFollowUpEmailText(user)
            };

            await sgMail.send(emailData);
            console.log(`✅ Follow-up email sent to ${user.email}`);

        } catch (error) {
            console.error('Failed to send follow-up email:', error);
            throw error;
        }
    }

    /**
     * Send contact notification to admin
     */
    async sendContactNotification(contactData) {
        try {
            const { name, email, subject, message, category, contactId } = contactData;
            
            // Determine admin email based on category
            let adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
            let categoryEmoji = '📧';
            
            switch (category) {
                case 'support':
                    adminEmail = process.env.SUPPORT_EMAIL || adminEmail;
                    categoryEmoji = '🛟';
                    break;
                case 'partners':
                    adminEmail = process.env.PARTNERSHIPS_EMAIL || adminEmail;
                    categoryEmoji = '🤝';
                    break;
                case 'questions':
                default:
                    categoryEmoji = '❓';
                    break;
            }
            
            const emailData = {
                to: adminEmail,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: `${categoryEmoji} New ${category.charAt(0).toUpperCase() + category.slice(1)} Inquiry - ${subject}`,
                html: this.getContactNotificationTemplate(contactData),
                text: this.getContactNotificationText(contactData),
                replyTo: email
            };
            
            await sgMail.send(emailData);
            console.log(`✅ Contact notification sent to admin for ${category} inquiry from ${email}`);
            
        } catch (error) {
            console.error('Failed to send contact notification:', error);
            throw error;
        }
    }
    
    /**
     * Send auto-reply to contact form submitter
     */
    async sendContactAutoReply(contactData) {
        try {
            const { name, email, category } = contactData;
            
            const emailData = {
                to: email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: '✅ We received your message - RuneFlow Support',
                html: this.getContactAutoReplyTemplate(contactData),
                text: this.getContactAutoReplyText(contactData)
            };
            
            await sgMail.send(emailData);
            console.log(`✅ Auto-reply sent to ${email} for ${category} inquiry`);
            
        } catch (error) {
            console.error('Failed to send contact auto-reply:', error);
            // Don't throw here - auto-reply failure shouldn't break the contact form
        }
    }

    /**
     * Process scheduled emails
     */
    async processScheduledEmails() {
        try {
            const pendingEmails = await db.getPendingEmails();
            
            for (const email of pendingEmails) {
                try {
                    const user = await db.get('SELECT * FROM users WHERE id = ?', [email.user_id]);
                    if (!user) continue;

                    // Send email based on template type
                    switch (email.email_template) {
                        case 'upsell_offer':
                            await this.sendUpsellEmail(user);
                            break;
                        case 'follow_up_day_3':
                            await this.sendFollowUpEmail(user);
                            break;
                        case 'lifetime_welcome':
                            await this.sendWelcomeEmail(user, 'upsell');
                            break;
                        default:
                            console.log(`Unknown email template: ${email.email_template}`);
                            continue;
                    }

                    // Mark as sent
                    await db.markEmailAsSent(email.id);

                } catch (error) {
                    console.error(`Failed to send scheduled email ${email.id}:`, error);
                    // Mark as failed
                    await db.run('UPDATE email_sequences SET status = "failed" WHERE id = ?', [email.id]);
                }
            }

        } catch (error) {
            console.error('Failed to process scheduled emails:', error);
        }
    }

    /**
     * Welcome email HTML template
     */
    getWelcomeEmailTemplate(user, downloadFiles, productType) {
        const downloadLinks = downloadFiles.map(file => `
            <tr>
                <td style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #1a202c; font-size: 16px; font-weight: 600;">
                                ${file.display_name}
                            </h3>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                ${this.formatFileSize(file.file_size)} • ${file.product_type.toUpperCase()}
                            </p>
                        </div>
                        <a href="${file.download_url}" 
                           style="background: linear-gradient(135deg, #10b981, #059669); 
                                  color: white; padding: 12px 24px; text-decoration: none; 
                                  border-radius: 8px; font-weight: 600; font-size: 14px;
                                  display: inline-block;">
                            Download
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to RuneFlow!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                        ⚡ RUNEFLOW
                    </h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                        ${productType === 'main' ? 'Your Templates Are Ready!' : 'Welcome to Lifetime Access!'}
                    </p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Hi ${user.first_name || 'there'}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${productType === 'main' 
                            ? 'Thank you for purchasing RuneFlow templates! Your premium n8n automation templates are ready for download. Each template has been battle-tested and optimized for maximum efficiency.'
                            : 'Welcome to the exclusive RuneFlow Lifetime Vault! You now have access to our premium collection of automation templates, courses, and ongoing updates.'
                        }
                    </p>

                    <!-- Download Section -->
                    <div style="background: #f7fafc; border-radius: 12px; overflow: hidden; margin: 30px 0;">
                        <div style="background: #4299e1; color: white; padding: 20px; text-align: center;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
                                📦 Your Downloads
                            </h3>
                        </div>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${downloadLinks}
                        </table>
                    </div>

                    <!-- License Info -->
                    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                            🔑 Your License Key
                        </h3>
                        <p style="color: #064e3b; margin: 0; font-family: 'JetBrains Mono', monospace; background: white; padding: 10px; border-radius: 4px; font-size: 14px;">
                            ${user.license_key}
                        </p>
                    </div>

                    <!-- Important Notes -->
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                            ⚠️ Important Notes
                        </h3>
                        <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Download links expire in 24 hours for security</li>
                            <li style="margin-bottom: 8px;">Save files to your local drive immediately</li>
                            <li style="margin-bottom: 8px;">Commercial license included - use for client work</li>
                            <li>Need help? Reply to this email for support</li>
                        </ul>
                    </div>

                    ${productType === 'main' ? `
                    <!-- Upsell CTA -->
                    <div style="text-align: center; margin: 40px 0;">
                        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; padding: 30px; color: white;">
                            <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">
                                🚀 Want Even More?
                            </h3>
                            <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">
                                Upgrade to Lifetime Vault Access for $497 and get 200+ additional templates, 
                                video courses, and lifetime updates!
                            </p>
                            <a href="${process.env.FRONTEND_URL}/upsell?user=${user.license_key}" 
                               style="background: white; color: #d97706; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 8px; font-weight: 600; 
                                      font-size: 16px; display: inline-block;">
                                Upgrade Now →
                            </a>
                        </div>
                    </div>
                    ` : ''}

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                        Happy automating! 🎉<br>
                        <strong>The RuneFlow Team</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px; margin: 0;">
                        © 2025 RuneFlow. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Welcome email text version
     */
    getWelcomeEmailText(user, downloadFiles, productType) {
        const downloadList = downloadFiles.map(file => 
            `- ${file.display_name} (${this.formatFileSize(file.file_size)})\n  Download: ${file.download_url}`
        ).join('\n\n');

        return `
RUNEFLOW - Your Templates Are Ready!

Hi ${user.first_name || 'there'}!

${productType === 'main' 
    ? 'Thank you for purchasing RuneFlow templates! Your premium n8n automation templates are ready for download.'
    : 'Welcome to the exclusive RuneFlow Lifetime Vault! You now have access to our premium collection.'
}

YOUR DOWNLOADS:
${downloadList}

YOUR LICENSE KEY: ${user.license_key}

IMPORTANT NOTES:
- Download links expire in 24 hours
- Save files to your local drive immediately  
- Commercial license included
- Need help? Reply to this email

${productType === 'main' ? `
UPGRADE OPPORTUNITY:
Want even more? Upgrade to Lifetime Vault Access for $497:
${process.env.FRONTEND_URL}/upsell?user=${user.license_key}
` : ''}

Happy automating!
The RuneFlow Team

© 2025 RuneFlow. All rights reserved.
        `.trim();
    }

    /**
     * Upsell email HTML template
     */
    getUpsellEmailTemplate(user) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exclusive Lifetime Upgrade Offer</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #0f172a;">
            <div style="max-width: 600px; margin: 0 auto; background: white;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">
                        🚨 EXCLUSIVE OFFER
                    </h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">
                        24 Hours Only - Then It's Gone Forever
                    </p>
                </div>

                <div style="padding: 40px 20px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">
                        Hi ${user.first_name || 'there'}! 
                    </h2>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        I noticed you just grabbed the RuneFlow templates - smart move! 
                        But I have something even better for you...
                    </p>

                    <!-- Offer Box -->
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; padding: 30px; color: white; text-align: center; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700;">
                            LIFETIME VAULT ACCESS
                        </h3>
                        <p style="margin: 0 0 20px 0; font-size: 18px; opacity: 0.9;">
                            200+ Premium Templates + Video Courses + Lifetime Updates
                        </p>
                        <div style="font-size: 36px; font-weight: 900; margin: 20px 0;">
                            <span style="text-decoration: line-through; opacity: 0.7;">$997</span>
                            $497
                        </div>
                        <a href="${process.env.FRONTEND_URL}/upsell?user=${user.license_key}" 
                           style="background: white; color: #d97706; padding: 20px 40px; 
                                  text-decoration: none; border-radius: 8px; font-weight: 700; 
                                  font-size: 18px; display: inline-block; margin-top: 20px;">
                            UPGRADE NOW →
                        </a>
                    </div>

                    <!-- Benefits -->
                    <div style="margin: 30px 0;">
                        <h3 style="color: #1a202c; font-size: 20px; margin: 0 0 20px 0;">
                            What You Get:
                        </h3>
                        <ul style="color: #4a5568; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                            <li>200+ additional premium n8n templates</li>
                            <li>5-hour video masterclass series</li>
                            <li>Monthly template drops (forever)</li>
                            <li>Private Discord community access</li>
                            <li>1-on-1 setup calls with experts</li>
                            <li>White-label rights for agencies</li>
                        </ul>
                    </div>

                    <!-- Urgency -->
                    <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <h4 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
                            ⏰ This Offer Expires in 24 Hours
                        </h4>
                        <p style="color: #7f1d1d; margin: 0; font-size: 14px;">
                            After that, the price goes back to $997 and you'll lose this exclusive discount.
                        </p>
                    </div>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                        Don't miss out on this exclusive opportunity!<br>
                        <strong>The RuneFlow Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Upsell email text version
     */
    getUpsellEmailText(user) {
        return `
EXCLUSIVE 24-HOUR OFFER

Hi ${user.first_name || 'there'}!

I noticed you just grabbed the RuneFlow templates - smart move!
But I have something even better for you...

LIFETIME VAULT ACCESS
200+ Premium Templates + Video Courses + Lifetime Updates

Regular Price: $997
Your Price (24hrs only): $497

WHAT YOU GET:
- 200+ additional premium n8n templates
- 5-hour video masterclass series  
- Monthly template drops (forever)
- Private Discord community access
- 1-on-1 setup calls with experts
- White-label rights for agencies

⏰ THIS OFFER EXPIRES IN 24 HOURS
After that, the price goes back to $997 and you'll lose this exclusive discount.

UPGRADE NOW: ${process.env.FRONTEND_URL}/upsell?user=${user.license_key}

Don't miss out!
The RuneFlow Team
        `.trim();
    }

    /**
     * Follow-up email HTML template
     */
    getFollowUpEmailTemplate(user) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>How are your automations going?</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background: white;">
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">
                        Hi ${user.first_name || 'there'}! 👋
                    </h2>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        It's been a few days since you downloaded your RuneFlow templates. 
                        How are your n8n automations going?
                    </p>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        I'd love to hear about:
                    </p>

                    <ul style="color: #4a5568; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 0 0 30px 0;">
                        <li>Which templates you've implemented</li>
                        <li>Any time savings you've experienced</li>
                        <li>Questions or challenges you're facing</li>
                    </ul>

                    <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">
                            Need Help? 🤝
                        </h3>
                        <p style="color: #064e3b; margin: 0; font-size: 16px;">
                            Reply to this email with any questions. I personally read every message 
                            and will help you get the most out of your templates!
                        </p>
                    </div>

                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                        Keep automating!<br>
                        <strong>The RuneFlow Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Follow-up email text version
     */
    getFollowUpEmailText(user) {
        return `
Hi ${user.first_name || 'there'}!

It's been a few days since you downloaded your RuneFlow templates.
How are your n8n automations going?

I'd love to hear about:
- Which templates you've implemented
- Any time savings you've experienced  
- Questions or challenges you're facing

NEED HELP?
Reply to this email with any questions. I personally read every message 
and will help you get the most out of your templates!

Keep automating!
The RuneFlow Team
        `.trim();
    }

    /**
     * Helper method to format file sizes
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new EmailService();
