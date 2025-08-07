const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { createApiResponse, getClientIP } = require('../utils/helpers');
const db = require('../database/db');

const router = express.Router();

/**
 * Get daily template page by token
 */
router.get('/daily/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Validate token and get template data
        const templateData = await getTemplateByToken(token);
        
        if (!templateData) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Template Expired - RuneFlow Daily</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 min-h-screen flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                        <div class="text-6xl mb-6">⏰</div>
                        <h1 class="text-2xl font-bold text-gray-800 mb-4">Template Expired</h1>
                        <p class="text-gray-600 mb-6">This daily template has expired or the access token is invalid.</p>
                        <a href="https://twitter.com/runeflowplates" 
                           class="inline-block bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                            Follow for More Templates
                        </a>
                    </div>
                </body>
                </html>
            `);
        }

        // Generate download page HTML
        const html = generateDownloadPageHTML(templateData, token);
        res.send(html);
        
    } catch (error) {
        console.error('Error serving daily template page:', error);
        res.status(500).send('Internal server error');
    }
});

/**
 * Download template file directly
 */
router.get('/daily/:token/download', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Validate token and get template data
        const templateData = await getTemplateByToken(token);
        
        if (!templateData) {
            return res.status(404).json(createApiResponse(
                false, null, 'Template token is invalid or expired'
            ));
        }

        // Check download limits (if we had them)
        // For now, we'll allow unlimited downloads within the 24-hour window
        
        // Find template file
        const templateFile = await findTemplateFile(templateData.template_id);
        
        if (!templateFile) {
            return res.status(404).json(createApiResponse(
                false, null, 'Template file not found'
            ));
        }

        // Increment download count
        await incrementDownloadCount(token);

        // Log the download
        await db.logAnalytics({
            event_type: 'daily_template_download',
            user_id: null,
            metadata: { 
                template_id: templateData.template_id,
                template_name: templateData.template_name,
                access_token: token
            },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        // Set download headers
        const filename = `${templateData.template_name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/json');

        // Stream the file
        res.sendFile(templateFile);
        
        console.log(`📥 Daily template downloaded: ${templateData.template_name}`);
        
    } catch (error) {
        console.error('Error downloading daily template:', error);
        res.status(500).json(createApiResponse(
            false, null, 'An error occurred while downloading the template'
        ));
    }
});

/**
 * Get template info without downloading
 */
router.get('/daily/:token/info', async (req, res) => {
    try {
        const { token } = req.params;
        
        const templateData = await getTemplateByToken(token);
        
        if (!templateData) {
            return res.status(404).json(createApiResponse(
                false, null, 'Template token is invalid or expired'
            ));
        }

        res.json(createApiResponse(true, {
            name: templateData.template_name,
            category: templateData.template_category,
            nodes_count: templateData.nodes_count,
            quality_score: templateData.quality_score,
            downloads_count: templateData.downloads_count || 0,
            expires_at: templateData.access_expires_at,
            post_date: templateData.post_date
        }));
        
    } catch (error) {
        console.error('Error getting daily template info:', error);
        res.status(500).json(createApiResponse(
            false, null, 'An error occurred while getting template info'
        ));
    }
});

/**
 * Admin route to get today's template status
 */
router.get('/daily-admin/today', async (req, res) => {
    try {
        // Simple authentication check
        const adminKey = req.query.key;
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(401).json(createApiResponse(
                false, null, 'Unauthorized'
            ));
        }

        const today = new Date().toISOString().split('T')[0];
        const result = await db.query(`
            SELECT * FROM daily_templates 
            WHERE post_date = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [today]);

        if (result.rows.length === 0) {
            return res.json(createApiResponse(true, {
                posted: false,
                message: 'No template posted today yet'
            }));
        }

        const template = result.rows[0];
        res.json(createApiResponse(true, {
            posted: true,
            template: {
                name: template.template_name,
                category: template.template_category,
                tweet_id: template.tweet_id,
                access_token: template.access_token,
                downloads: template.downloads_count || 0,
                expires_at: template.access_expires_at,
                created_at: template.created_at
            }
        }));
        
    } catch (error) {
        console.error('Error getting today status:', error);
        res.status(500).json(createApiResponse(
            false, null, 'An error occurred'
        ));
    }
});

// Helper functions

/**
 * Get template data by access token
 */
async function getTemplateByToken(token) {
    try {
        const result = await db.query(`
            SELECT * FROM daily_templates 
            WHERE access_token = $1 
            AND access_expires_at > CURRENT_TIMESTAMP
        `, [token]);

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error getting template by token:', error);
        return null;
    }
}

/**
 * Find template file on disk
 */
async function findTemplateFile(templateId) {
    const possiblePaths = [
        path.join(__dirname, '../templates/complete', `${templateId}.json`),
        path.join(__dirname, '../templates/RUNERUSH_COMPLETE_VAULT', `${templateId}.json`),
        path.join(__dirname, '../templates/processed_complete_vault', `${templateId}.json`),
        path.join(__dirname, '../templates/runeflow_core_collection', `${templateId}.json`),
        path.join(__dirname, '../templates/runeflow_pro_collection', `${templateId}.json`),
        path.join(__dirname, '../templates/RUNERUSH_COMPLETE_UPDATED', `${templateId}.json`)
    ];

    for (const filePath of possiblePaths) {
        try {
            await fs.access(filePath);
            return filePath;
        } catch (error) {
            continue;
        }
    }

    console.error(`Template file not found for ID: ${templateId}`);
    return null;
}

/**
 * Increment download count for a template
 */
async function incrementDownloadCount(token) {
    try {
        await db.query(`
            UPDATE daily_templates 
            SET downloads_count = COALESCE(downloads_count, 0) + 1
            WHERE access_token = $1
        `, [token]);
    } catch (error) {
        console.error('Error incrementing download count:', error);
    }
}

/**
 * Generate beautiful download page HTML
 */
function generateDownloadPageHTML(templateData, token) {
    const expiresAt = new Date(templateData.access_expires_at).toLocaleString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Template: ${templateData.template_name} - RuneFlow</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glow { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
        .pulse-animation { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .8; }
        }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl glow max-w-2xl w-full overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-500 to-blue-600 p-8 text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-black opacity-10"></div>
            <div class="relative z-10">
                <div class="text-6xl mb-4">🔮</div>
                <div class="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4 pulse-animation">
                    ⏰ TODAY ONLY
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">${templateData.template_name}</h1>
                <p class="text-blue-100 text-lg">📁 ${templateData.template_category || 'Automation Template'}</p>
            </div>
        </div>

        <!-- Content -->
        <div class="p-8">
            <!-- Description -->
            <div class="bg-gray-50 rounded-2xl p-6 mb-8">
                <p class="text-gray-700 text-lg leading-relaxed">
                    🚀 Discover the power of automation with this carefully crafted n8n template. 
                    Built with precision and tested for reliability, this workflow will transform 
                    how you handle your daily tasks.
                </p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-4 mb-8">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border-l-4 border-blue-500">
                    <div class="text-3xl font-bold text-blue-600">${templateData.nodes_count || 25}</div>
                    <div class="text-blue-600 font-medium">Nodes</div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border-l-4 border-green-500">
                    <div class="text-3xl font-bold text-green-600">${templateData.quality_score || 8}/10</div>
                    <div class="text-green-600 font-medium">Quality</div>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border-l-4 border-purple-500">
                    <div class="text-3xl font-bold text-purple-600">${templateData.downloads_count || 0}</div>
                    <div class="text-purple-600 font-medium">Downloads</div>
                </div>
            </div>

            <!-- Download Button -->
            <div class="text-center mb-8">
                <a href="/daily/${token}/download" 
                   class="inline-block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg glow">
                    📥 Download Template
                </a>
            </div>

            <!-- Expiration Warning -->
            <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-8">
                <div class="flex items-center">
                    <div class="text-red-500 text-2xl mr-3">⏱️</div>
                    <div>
                        <h3 class="text-red-800 font-bold">Limited Time Access</h3>
                        <p class="text-red-700">This template expires: <strong>${expiresAt}</strong></p>
                    </div>
                </div>
            </div>

            <!-- How to Use -->
            <div class="bg-blue-50 rounded-2xl p-6 mb-8">
                <h3 class="text-blue-800 font-bold text-lg mb-4">🛠️ How to Use This Template</h3>
                <div class="space-y-3 text-blue-700">
                    <div class="flex items-start">
                        <span class="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                        <p>Download the JSON file by clicking the button above</p>
                    </div>
                    <div class="flex items-start">
                        <span class="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                        <p>Open your n8n instance and go to Templates → Import</p>
                    </div>
                    <div class="flex items-start">
                        <span class="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                        <p>Upload the JSON file and configure your credentials</p>
                    </div>
                    <div class="flex items-start">
                        <span class="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                        <p>Test and activate your new automation workflow!</p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center border-t border-gray-200 pt-6">
                <p class="text-gray-600 mb-4">Follow us for more daily templates:</p>
                <div class="space-x-4">
                    <a href="https://twitter.com/runeflowplates" target="_blank" 
                       class="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                        🐦 @runeflowplates
                    </a>
                    <a href="https://runeflow.xyz" target="_blank" 
                       class="inline-block bg-purple-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-600 transition-colors">
                        🌐 RuneFlow.xyz
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Auto-refresh if expiring soon -->
    <script>
        const expiresAt = new Date('${templateData.access_expires_at}').getTime();
        const now = new Date().getTime();
        const timeLeft = expiresAt - now;
        
        // If less than 1 hour left, refresh when it expires
        if (timeLeft > 0 && timeLeft < 3600000) {
            setTimeout(() => {
                location.reload();
            }, timeLeft + 1000); // Add 1 second buffer
        }
    </script>
</body>
</html>`;
}

module.exports = router;
