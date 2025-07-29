const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique license key
 * Format: RR-XXXX-XXXX-XXXX
 */
function generateLicenseKey() {
    const segments = [];
    for (let i = 0; i < 3; i++) {
        const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
        segments.push(segment);
    }
    return `RR-${segments.join('-')}`;
}

/**
 * Validate license key format
 */
function isValidLicenseKey(licenseKey) {
    const pattern = /^RR-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    return pattern.test(licenseKey);
}

/**
 * Generate secure random string
 */
function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
    const forwardedIPs = req.headers['x-forwarded-for'];
    if (forwardedIPs) {
        // Split by comma and get the first IP
        return forwardedIPs.split(',')[0].trim();
    }
    return req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize filename for S3
 */
function sanitizeFilename(filename) {
    return filename
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Generate S3 key for file upload
 */
function generateS3Key(productType, filename) {
    const timestamp = Date.now();
    const sanitized = sanitizeFilename(filename);
    return `${productType}/${timestamp}-${sanitized}`;
}

/**
 * Format currency amount (cents to dollars)
 */
function formatCurrency(cents, currency = 'USD') {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
    }).format(amount);
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate download filename
 */
function generateDownloadFilename(originalFilename, userLicenseKey) {
    const ext = originalFilename.split('.').pop();
    const base = originalFilename.replace(/\.[^/.]+$/, '');
    return `${base}-${userLicenseKey}.${ext}`;
}

/**
 * Create pagination object
 */
function createPagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
        current_page: page,
        per_page: limit,
        total_items: total,
        total_pages: totalPages,
        has_next: hasNext,
        has_prev: hasPrev,
        next_page: hasNext ? page + 1 : null,
        prev_page: hasPrev ? page - 1 : null
    };
}

/**
 * Validate and sanitize pagination params
 */
function sanitizePaginationParams(query) {
    let { page = 1, limit = 20 } = query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    
    // Ensure valid ranges
    page = Math.max(1, isNaN(page) ? 1 : page);
    limit = Math.max(1, Math.min(100, isNaN(limit) ? 20 : limit));
    
    return { page, limit };
}

/**
 * Generate JWT token
 */
function generateJWT(payload, expiresIn = '24h') {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 */
function verifyJWT(token) {
    const jwt = require('jsonwebtoken');
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Create API response object
 */
function createApiResponse(success, data = null, message = '', errors = []) {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    if (errors.length > 0) {
        response.errors = errors;
    }
    
    return response;
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Generate random string
 */
function generateRandomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}

/**
 * Validate and parse date
 */
function parseDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Format date for display
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

/**
 * Check if object is empty
 */
function isEmpty(obj) {
    return obj === null || obj === undefined || 
           (typeof obj === 'object' && Object.keys(obj).length === 0) ||
           (typeof obj === 'string' && obj.trim().length === 0) ||
           (Array.isArray(obj) && obj.length === 0);
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove undefined/null values from object
 */
function cleanObject(obj) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

module.exports = {
    generateLicenseKey,
    isValidLicenseKey,
    generateSecureToken,
    hashPassword,
    verifyPassword,
    getClientIP,
    isValidEmail,
    sanitizeFilename,
    generateS3Key,
    formatCurrency,
    formatFileSize,
    generateDownloadFilename,
    createPagination,
    sanitizePaginationParams,
    generateJWT,
    verifyJWT,
    createApiResponse,
    sleep,
    retryWithBackoff,
    escapeHtml,
    generateRandomString,
    parseDate,
    formatDate,
    isEmpty,
    deepClone,
    cleanObject
};
