const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DATABASE_URL || './database/rune_rush.db';
    }

    async connect() {
        return new Promise((resolve, reject) => {
            // Ensure database directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    resolve();
                }
            });
        });
    }

    async migrate() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('Migration failed:', err);
                    reject(err);
                } else {
                    console.log('Database migration completed successfully');
                    resolve();
                }
            });
        });
    }

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // User operations
    async createUser(userData) {
        const { email, license_key, first_name, last_name, is_lifetime = 0 } = userData;
        const sql = `
            INSERT INTO users (email, license_key, first_name, last_name, is_lifetime)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [email, license_key, first_name, last_name, is_lifetime]);
    }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return await this.get(sql, [email]);
    }

    async getUserByLicenseKey(license_key) {
        const sql = 'SELECT * FROM users WHERE license_key = ?';
        return await this.get(sql, [license_key]);
    }

    // Order operations
    async createOrder(orderData) {
        const { user_id, amount, currency, product_type, stripe_payment_intent_id, paypal_payment_id } = orderData;
        const sql = `
            INSERT INTO orders (user_id, amount, currency, product_type, stripe_payment_intent_id, paypal_payment_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [user_id, amount, currency, product_type, stripe_payment_intent_id, paypal_payment_id]);
    }

    async updateOrderStatus(orderId, status) {
        const sql = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        return await this.run(sql, [status, orderId]);
    }

    async getOrderByPaymentId(paymentId, provider = 'stripe') {
        const column = provider === 'stripe' ? 'stripe_payment_intent_id' : 'paypal_payment_id';
        const sql = `SELECT * FROM orders WHERE ${column} = ?`;
        return await this.get(sql, [paymentId]);
    }

    // Download operations
    async createDownload(downloadData) {
        const { user_id, file_path, ip_address, user_agent, download_token, expires_at } = downloadData;
        const sql = `
            INSERT INTO downloads (user_id, file_path, ip_address, user_agent, download_token, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [user_id, file_path, ip_address, user_agent, download_token, expires_at]);
    }

    async getDownloadByToken(token) {
        const sql = 'SELECT * FROM downloads WHERE download_token = ? AND expires_at > datetime("now")';
        return await this.get(sql, [token]);
    }

    async getDownloadsByIP(ip_address, timeWindow = '24 hours') {
        const sql = `
            SELECT COUNT(*) as count 
            FROM downloads 
            WHERE ip_address = ? AND created_at > datetime('now', '-${timeWindow}')
        `;
        const result = await this.get(sql, [ip_address]);
        return result ? result.count : 0;
    }

    // Analytics operations
    async logAnalytics(analyticsData) {
        const { event_type, user_id, order_id, metadata, ip_address, user_agent, referrer } = analyticsData;
        const sql = `
            INSERT INTO analytics (event_type, user_id, order_id, metadata, ip_address, user_agent, referrer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [event_type, user_id, order_id, JSON.stringify(metadata), ip_address, user_agent, referrer]);
    }

    // Email sequence operations
    async scheduleEmail(emailData) {
        const { user_id, sequence_type, email_subject, email_template, scheduled_at } = emailData;
        const sql = `
            INSERT INTO email_sequences (user_id, sequence_type, email_subject, email_template, scheduled_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [user_id, sequence_type, email_subject, email_template, scheduled_at]);
    }

    async getPendingEmails() {
        const sql = `
            SELECT * FROM email_sequences 
            WHERE status = 'pending' AND scheduled_at <= datetime('now')
            ORDER BY scheduled_at ASC
        `;
        return await this.query(sql);
    }

    async markEmailAsSent(emailId) {
        const sql = 'UPDATE email_sequences SET status = "sent", sent_at = CURRENT_TIMESTAMP WHERE id = ?';
        return await this.run(sql, [emailId]);
    }

    // File operations
    async getFilesByProductType(product_type) {
        const sql = 'SELECT * FROM files WHERE product_type = ? AND is_active = 1';
        return await this.query(sql, [product_type]);
    }

    async createFile(fileData) {
        const { filename, display_name, s3_key, file_size, content_type, product_type } = fileData;
        const sql = `
            INSERT INTO files (filename, display_name, s3_key, file_size, content_type, product_type)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [filename, display_name, s3_key, file_size, content_type, product_type]);
    }

    // Revenue analytics
    async getRevenueStats(days = 30) {
        const sql = `
            SELECT 
                COUNT(*) as total_orders,
                SUM(amount) as total_revenue,
                AVG(amount) as avg_order_value,
                product_type
            FROM orders 
            WHERE status = 'completed' 
            AND created_at >= datetime('now', '-${days} days')
            GROUP BY product_type
        `;
        return await this.query(sql);
    }

    async getConversionStats(days = 30) {
        const sql = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(amount) as revenue,
                product_type
            FROM orders 
            WHERE status = 'completed' 
            AND created_at >= datetime('now', '-${days} days')
            GROUP BY DATE(created_at), product_type
            ORDER BY date DESC
        `;
        return await this.query(sql);
    }
}

module.exports = new Database();
