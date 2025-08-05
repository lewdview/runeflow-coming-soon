#!/usr/bin/env node

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Services (create mock services if they don't exist)
let db, stripeService, emailService, s3Service;
try {
  db = require('../runerush/database/db');
  stripeService = require('../runerush/services/stripe');
  emailService = require('../runerush/services/email');
  s3Service = require('../runerush/services/s3');
} catch (error) {
  console.warn('Some RuneRush services not found, creating mock services');
  db = {
    getUserByLicenseKey: async () => null,
    logAnalytics: async () => {},
    createContactSubmission: async () => 'mock-id'
  };
  stripeService = {
    handleWebhook: async () => {},
    createCheckoutSession: async () => ({ url: 'mock-url' })
  };
  emailService = {
    sendContactNotification: async () => {},
    sendContactAutoReply: async () => {}
  };
  s3Service = {};
}

// Utils
const getClientIP = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
const createApiResponse = (success, data, message, errors) => ({
  success,
  data,
  message,
  errors: errors || undefined,
  timestamp: new Date().toISOString()
});

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection using Railway PostgreSQL or local fallback
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://db_user:password@localhost:5432/runeflow',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Load static template data
const templateDataPath = path.join(__dirname, '../database/template-database.json');
let staticTemplateData = {};
try {
  staticTemplateData = JSON.parse(fs.readFileSync(templateDataPath, 'utf8'));
} catch (error) {
  console.error('Error loading template data:', error);
}

// Payment and User Routes

// Stripe webhook handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        await stripeService.handleWebhook(req.body, signature);
        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).json({ error: 'Webhook error' });
    }
});

// Payments
app.post('/api/payments/stripe/create-checkout', [
    body('email').isEmail().normalizeEmail(),
    body('first_name').trim().isLength({ min: 1 }),
    body('last_name').trim().isLength({ min: 1 }),
    body('product_type').isIn(['core', 'pro_bundle', 'pro_upgrade', 'complete_collection']),
    body('success_url').isURL(),
    body('cancel_url').isURL()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(createApiResponse(
                false, null, 'Validation error', errors.array()
            ));
        }

        const { email, first_name, last_name, product_type, success_url, cancel_url } = req.body;

        const checkoutSession = await stripeService.createCheckoutSession(
            product_type,
            { email, first_name, last_name },
            success_url,
            cancel_url
        );

        // Log analytics
        await db.logAnalytics({
            event_type: 'checkout_initiated',
            user_id: null,
            metadata: { product_type, payment_method: 'stripe_checkout' },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(true, checkoutSession, 'Checkout session created successfully'));

    } catch (error) {
        console.error('Checkout session creation failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to create checkout session'
        ));
    }
});


// Middleware

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    templates: staticTemplateData.metadata?.total_templates || 0
  });
});

// Get all templates with pagination and filtering
app.get('/api/v1/templates', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      search,
      sort = 'name'
    } = req.query;

    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.status = 'Active'
    `;

    const params = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND t.difficulty = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    if (search) {
      query += ` AND (t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting
    const validSorts = ['name', 'created_at', 'download_count', 'rating'];
    const sortBy = validSorts.includes(sort) ? sort : 'name';
    query += ` ORDER BY t.${sortBy} DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM templates t 
      WHERE t.status = 'Active'
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND t.category_id = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (difficulty) {
      countQuery += ` AND t.difficulty = $${countParamIndex}`;
      countParams.push(difficulty);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (t.name ILIKE $${countParamIndex} OR t.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalTemplates = parseInt(countResult.rows[0].count);

    res.json({
      templates: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTemplates,
        pages: Math.ceil(totalTemplates / limit),
        hasNext: page * limit < totalTemplates,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get template by ID
app.get('/api/v1/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon,
             c.description as category_description
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.status = 'Active'
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get integrations for this template
    const integrationsQuery = `
      SELECT i.*, ti.is_required
      FROM integrations i
      JOIN template_integrations ti ON i.id = ti.integration_id
      WHERE ti.template_id = $1
    `;
    const integrations = await pool.query(integrationsQuery, [id]);

    const template = {
      ...result.rows[0],
      integrations: integrations.rows
    };

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all categories
app.get('/api/v1/categories', async (req, res) => {
  try {
    const query = `
      SELECT c.*, COUNT(t.id) as template_count
      FROM categories c
      LEFT JOIN templates t ON c.id = t.category_id AND t.status = 'Active'
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.description, c.icon, c.color, c.display_order
      ORDER BY c.display_order, c.name
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category by ID with templates
app.get('/api/v1/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get category info
    const categoryQuery = 'SELECT * FROM categories WHERE id = $1 AND is_active = true';
    const categoryResult = await pool.query(categoryQuery, [id]);

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get templates in this category
    const templatesQuery = `
      SELECT id, name, description, difficulty, estimated_setup_time, 
             file_size, download_count, rating, rating_count
      FROM templates 
      WHERE category_id = $1 AND status = 'Active'
      ORDER BY download_count DESC, rating DESC
    `;
    const templatesResult = await pool.query(templatesQuery, [id]);

    res.json({
      ...categoryResult.rows[0],
      templates: templatesResult.rows,
      template_count: templatesResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all integrations
app.get('/api/v1/integrations', async (req, res) => {
  try {
    const query = `
      SELECT i.*, COUNT(ti.template_id) as template_count
      FROM integrations i
      LEFT JOIN template_integrations ti ON i.id = ti.integration_id
      WHERE i.is_supported = true
      GROUP BY i.id
      ORDER BY i.popularity_score DESC, i.name
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get template file structure
app.get('/api/v1/templates/:id/files', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
    
    if (template.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const templateData = template.rows[0];
    const templateName = templateData.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    
    // Map template names/categories to actual directories
    const templateDirMap = {
      'ai': 'AI_Research',
      'artificial': 'AI_Research',
      'research': 'AI_Research',
      'automation': 'Automation',
      'business': 'Business_Intelligence',
      'intelligence': 'Business_Intelligence',
      'cloud': 'Cloud_Services',
      'services': 'Cloud_Services',
      'crm': 'CRM_Integration',
      'customer': 'CRM_Integration',
      'data': 'Data_Analysis',
      'analysis': 'Data_Analysis',
      'database': 'Database_Management',
      'management': 'Database_Management',
      'development': 'Development_Tools',
      'tools': 'Development_Tools',
      'ecommerce': 'Ecommerce',
      'commerce': 'Ecommerce',
      'email': 'Email_Marketing',
      'marketing': 'Email_Marketing',
      'finance': 'Finance_Accounting',
      'accounting': 'Finance_Accounting',
      'integration': 'Integration_Hub',
      'hub': 'Integration_Hub',
      'mobile': 'Mobile_IoT',
      'iot': 'Mobile_IoT',
      'monitoring': 'Monitoring_Alerts',
      'alerts': 'Monitoring_Alerts',
      'notifications': 'Notifications',
      'notification': 'Notifications',
      'reporting': 'Reporting',
      'report': 'Reporting',
      'security': 'Security_Compliance',
      'compliance': 'Security_Compliance',
      'social': 'Social_Media',
      'media': 'Social_Media',
      'task': 'Task_Management',
      'management': 'Task_Management',
      'web': 'Web_Scraping',
      'scraping': 'Web_Scraping'
    };
    
    // Try to find matching directory based on template name or category
    let templateDir = 'Automation'; // Default
    const searchText = (templateName + ' ' + (templateData.category_name || '')).toLowerCase();
    
    for (const [key, dir] of Object.entries(templateDirMap)) {
      if (searchText.includes(key)) {
        templateDir = dir;
        break;
      }
    }
    
const templatePath = path.join('/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_runeflow_organized', templateDir);
    
    // Check if directory exists
    if (!fs.existsSync(templatePath)) {
      return res.json({ 
        template: templateData.name,
        directory: templateDir,
        files: [],
        error: 'Template directory not found'
      });
    }
    
    // Recursively read directory structure
    function readDirStructure(dirPath, relativePath = '') {
      const items = [];
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          // Skip hidden files and system files
          if (entry.name.startsWith('.') || entry.name.startsWith('_')) {
            continue;
          }
          
          const fullPath = path.join(dirPath, entry.name);
          const relPath = path.join(relativePath, entry.name).replace(/\\/g, '/');
          
          if (entry.isDirectory()) {
            const children = readDirStructure(fullPath, relPath);
            items.push({
              name: entry.name,
              type: 'directory',
              path: relPath,
              children: children
            });
          } else {
            // Get file stats
            const stats = fs.statSync(fullPath);
            const ext = path.extname(entry.name).toLowerCase();
            
            items.push({
              name: entry.name,
              type: 'file',
              path: relPath,
              size: stats.size,
              extension: ext,
              modified: stats.mtime.toISOString()
            });
          }
        }
        
        return items.sort((a, b) => {
          // Directories first, then files, both alphabetically
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
      }
    }
    
    const fileStructure = readDirStructure(templatePath);
    
    res.json({
      template: templateData.name,
      directory: templateDir,
      path: templatePath,
      files: fileStructure
    });
  } catch (error) {
    console.error('File structure error:', error);
    res.status(500).json({ error: 'Failed to load file structure' });
  }
});

// Template download with real files
app.get('/api/v1/templates/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Get template info including file path
    const templateQuery = 'SELECT name, file_path, category_id FROM templates WHERE id = $1';
    const templateResult = await pool.query(templateQuery, [id]);

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Get category name for file path
    const categoryQuery = 'SELECT name FROM categories WHERE id = $1';
    const categoryResult = await pool.query(categoryQuery, [template.category_id]);
    const categoryName = categoryResult.rows[0]?.name || 'Unknown';

    // Construct the actual file path
    const templatesBasePath = '/Volumes/extremeUno/webhalla_complete/webhalla_website/n8n_templates_runeflow_organized';
    const filePath = path.join(templatesBasePath, categoryName.replace(/\s+/g, '_'), template.file_path);
    
    console.log(`Looking for template file at: ${filePath}`);

    // Check if the actual file exists
    if (fs.existsSync(filePath)) {
      // Increment download count
      await pool.query('UPDATE templates SET download_count = download_count + 1 WHERE id = $1', [id]);
      
      try {
        // Read and parse the actual JSON file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const templateData = JSON.parse(fileContent);
        
        // Set headers for download
        const cleanName = template.name.replace(/[^a-zA-Z0-9-_]/g, '_');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanName}.json"`);
        res.setHeader('Content-Type', 'application/json');
        
        // Send the actual template data
        res.json(templateData);
      } catch (parseError) {
        console.error('Error parsing template file:', parseError);
        // If JSON parsing fails, send as raw text
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Disposition', `attachment; filename="${template.name}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.send(fileContent);
      }
    } else {
      console.log(`Template file not found at: ${filePath}`);
      
      // Fallback: try to find the file by searching
      const { execSync } = require('child_process');
      try {
        const searchCommand = `find "${templatesBasePath}" -name "*${template.file_path}*" -type f | head -1`;
        const foundPath = execSync(searchCommand, { encoding: 'utf8' }).trim();
        
        if (foundPath && fs.existsSync(foundPath)) {
          console.log(`Found template at: ${foundPath}`);
          const fileContent = fs.readFileSync(foundPath, 'utf8');
          const templateData = JSON.parse(fileContent);
          
          // Increment download count
          await pool.query('UPDATE templates SET download_count = download_count + 1 WHERE id = $1', [id]);
          
          const cleanName = template.name.replace(/[^a-zA-Z0-9-_]/g, '_');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanName}.json"`);
          res.setHeader('Content-Type', 'application/json');
          res.json(templateData);
        } else {
          throw new Error('File not found');
        }
      } catch (searchError) {
        console.error('Error searching for template file:', searchError);
        
        // Final fallback: create a basic template structure
        const fallbackTemplate = {
          name: template.name,
          id: id,
          meta: {
            description: 'RuneFlow automation template - Original file not found, showing template structure',
            created_at: new Date().toISOString(),
            templateId: id
          },
          workflow: {
            nodes: [],
            connections: {},
            settings: {
              executionOrder: 'v1'
            }
          }
        };
        
        res.setHeader('Content-Disposition', `attachment; filename="${template.name}_fallback.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(fallbackTemplate);
      }
    }
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Information and Contact Routes

app.get('/api/user/:license_key', async (req, res) => {
    try {
        const { license_key } = req.params;

        const user = await db.getUserByLicenseKey(license_key);
        if (!user) {
            return res.status(404).json(createApiResponse(
                false, null, 'User not found'
            ));
        }

        // Return safe user data
        const userData = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_lifetime: user.is_lifetime,
            created_at: user.created_at
        };

        res.json(createApiResponse(true, userData, 'User retrieved successfully'));

    } catch (error) {
        console.error('User retrieval failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to retrieve user'
        ));
    }
});

// Handle contact form submissions
app.post('/api/contact', [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('category').isIn(['questions', 'support', 'partners']).withMessage('Valid category is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(createApiResponse(
                false, null, 'Validation error', errors.array()
            ));
        }

        const { name, email, subject, message, category } = req.body;
        const ip_address = getClientIP(req);
        const user_agent = req.get('User-Agent');

        // Store contact submission in database
        const contactId = await db.createContactSubmission({
            name,
            email,
            subject,
            message,
            category,
            ip_address,
            user_agent,
            referrer: req.get('Referer')
        });

        // Send notification email to admin
        await emailService.sendContactNotification({
            name,
            email,
            subject,
            message,
            category,
            contactId
        });

        // Send auto-reply to user
        await emailService.sendContactAutoReply({
            name,
            email,
            category
        });

        // Log analytics
        await db.logAnalytics({
            event_type: 'contact_form_submitted',
            user_id: null,
            metadata: { category, subject_length: subject.length, message_length: message.length },
            ip_address,
            user_agent,
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(
            true,
            { contactId },
            'Thank you for your message! We\'ll get back to you soon.'
        ));

    } catch (error) {
        console.error('Contact form submission failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to send message. Please try again later.'
        ));
    }
});


// Download Templates and Files
app.get('/api/v1/export', async (req, res) => {
  try {
    const { format = 'json', category = 'All', difficulty = 'All' } = req.query;
    
    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        ARRAY_AGG(i.name) FILTER (WHERE i.name IS NOT NULL) as integrations
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN template_integrations ti ON t.id = ti.template_id
      LEFT JOIN integrations i ON ti.integration_id = i.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (category !== 'All') {
      conditions.push(`c.name = $${params.length + 1}`);
      params.push(category);
    }
    
    if (difficulty !== 'All') {
      conditions.push(`t.difficulty = $${params.length + 1}`);
      params.push(difficulty);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY t.id, c.name ORDER BY t.name';
    
    const result = await pool.query(query, params);
    const templates = result.rows;
    
    if (format === 'csv') {
      // Generate CSV
      const headers = ['Name', 'Category', 'Difficulty', 'Description', 'Downloads', 'Rating', 'File Size', 'Setup Time'];
      let csv = headers.join(',') + '\n';
      
      templates.forEach(template => {
        const row = [
          `"${template.name.replace(/"/g, '""')}"`,
          `"${template.category_name}"`,
          `"${template.difficulty}"`,
          `"${template.description.replace(/"/g, '""')}"`,
          template.download_count,
          template.rating,
          `"${template.file_size}"`,
          `"${template.estimated_setup_time}"`
        ];
        csv += row.join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="runeflow_templates.csv"');
      res.send(csv);
      
    } else {
      // JSON format (default)
      const exportData = {
        export_info: {
          timestamp: new Date().toISOString(),
          total_templates: templates.length,
          filters: { category, difficulty },
          format: format
        },
        templates: templates
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="runeflow_templates.json"');
      res.json(exportData);
    }
    
  } catch (error) {
    console.error('Error exporting templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search templates
app.get('/api/v1/search', async (req, res) => {
  try {
    const { q, category, difficulty, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    let query = `
      SELECT t.id, t.name, t.description, t.category_id, t.difficulty,
             t.estimated_setup_time, t.download_count, t.rating,
             c.name as category_name, c.icon as category_icon
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.status = 'Active'
      AND (t.name ILIKE $1 OR t.description ILIKE $1)
    `;

    const params = [`%${q.trim()}%`];
    let paramIndex = 2;

    if (category) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND t.difficulty = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    query += ` ORDER BY t.download_count DESC, t.rating DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      query: q,
      results: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get database statistics
app.get('/api/v1/stats', async (req, res) => {
  try {
    const queries = await Promise.all([
      pool.query('SELECT COUNT(*) FROM templates WHERE status = \'Active\''),
      pool.query('SELECT COUNT(*) FROM categories WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM integrations WHERE is_supported = true'),
      pool.query('SELECT difficulty, COUNT(*) FROM templates WHERE status = \'Active\' GROUP BY difficulty'),
      pool.query('SELECT category_id, COUNT(*) FROM templates WHERE status = \'Active\' GROUP BY category_id ORDER BY count DESC LIMIT 5'),
      pool.query('SELECT AVG(rating) as avg_rating FROM templates WHERE rating > 0'),
    ]);

    const [templates, categories, integrations, difficulties, topCategories, avgRating] = queries;

    // Format difficulty distribution
    const difficultyDistribution = {};
    difficulties.rows.forEach(row => {
      difficultyDistribution[row.difficulty] = parseInt(row.count);
    });

    // Format top categories
    const topCategoriesFormatted = {};
    topCategories.rows.forEach(row => {
      topCategoriesFormatted[row.category_id] = parseInt(row.count);
    });

    res.json({
      total_templates: parseInt(templates.rows[0].count),
      total_categories: parseInt(categories.rows[0].count),
      total_integrations: parseInt(integrations.rows[0].count),
      avg_rating: parseFloat(avgRating.rows[0].avg_rating) || 0,
      difficulty_distribution: difficultyDistribution,
      top_categories: topCategoriesFormatted,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download template (increment counter)
app.post('/api/v1/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_email, source = 'api' } = req.body;

    // Check if template exists
    const templateQuery = 'SELECT id, name, zip_file_path FROM templates WHERE id = $1 AND status = \'Active\'';
    const templateResult = await pool.query(templateQuery, [id]);

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Record download
    const downloadQuery = `
      INSERT INTO template_downloads (template_id, user_id, user_email, download_source, ip_address)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    await pool.query(downloadQuery, [
      id,
      user_id || null,
      user_email || null,
      source,
      clientIP
    ]);

    const template = templateResult.rows[0];
    res.json({
      message: 'Download recorded successfully',
      template: {
        id: template.id,
        name: template.name,
        download_url: template.zip_file_path
      }
    });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🔥 RuneFlow Template API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🔍 Templates API: http://localhost:${port}/api/v1/templates`);
  console.log(`📁 Categories API: http://localhost:${port}/api/v1/categories`);
  console.log(`🌟 Total templates in database: ${staticTemplateData.metadata?.total_templates || 'Unknown'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

module.exports = app;
