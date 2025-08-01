const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.pool = null;
        this.isPostgres = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');
        this.dbPath = './database/rune_rush.db'; // SQLite fallback
    }

    async connect() {
        if (this.isPostgres) {
            // PostgreSQL connection
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });
            
            try {
                await this.pool.query('SELECT NOW()');
                console.log('Connected to PostgreSQL database');
                return;
            } catch (err) {
                console.error('Error connecting to PostgreSQL:', err);
                throw err;
            }
        } else {
            // SQLite connection (fallback)
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
    }

    async migrate() {
        if (this.isPostgres) {
            // For PostgreSQL, we'll create tables if they don't exist
            const createTables = `
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    license_key VARCHAR(50) UNIQUE NOT NULL,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    is_lifetime BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    amount INTEGER NOT NULL,
                    currency VARCHAR(3) DEFAULT 'usd',
                    product_type VARCHAR(50) NOT NULL,
                    stripe_payment_intent_id VARCHAR(255),
                    paypal_payment_id VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS analytics (
                    id SERIAL PRIMARY KEY,
                    event_type VARCHAR(50) NOT NULL,
                    user_id INTEGER REFERENCES users(id),
                    order_id INTEGER REFERENCES orders(id),
                    metadata JSONB,
                    ip_address INET,
                    user_agent TEXT,
                    referrer VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS email_sequences (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    sequence_type VARCHAR(50) NOT NULL,
                    email_subject VARCHAR(255) NOT NULL,
                    email_template VARCHAR(100) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    scheduled_at TIMESTAMP NOT NULL,
                    sent_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS downloads (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    file_path VARCHAR(500) NOT NULL,
                    ip_address INET,
                    user_agent TEXT,
                    download_token VARCHAR(100) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS files (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    display_name VARCHAR(255) NOT NULL,
                    s3_key VARCHAR(500),
                    file_size INTEGER,
                    content_type VARCHAR(100),
                    product_type VARCHAR(50) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS refunds (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER REFERENCES orders(id),
                    stripe_refund_id VARCHAR(255),
                    amount INTEGER NOT NULL,
                    reason VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            
            try {
                await this.pool.query(createTables);
                console.log('Database migration completed successfully');
            } catch (err) {
                console.error('Migration failed:', err);
                throw err;
            }
        } else {
            // SQLite migration
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
    }

    convertSqlToPostgres(sql, params) {
        // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
        let pgSql = sql;
        let paramIndex = 1;
        while (pgSql.includes('?')) {
            pgSql = pgSql.replace('?', `$${paramIndex}`);
            paramIndex++;
        }
        return pgSql;
    }

    async query(sql, params = []) {
        if (this.isPostgres) {
            try {
                const pgSql = this.convertSqlToPostgres(sql, params);
                const result = await this.pool.query(pgSql, params);
                return result.rows;
            } catch (err) {
                throw err;
            }
        } else {
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
    }

    async run(sql, params = []) {
        if (this.isPostgres) {
            try {
                const pgSql = this.convertSqlToPostgres(sql, params);
                let finalSql = pgSql;
                
                // Add RETURNING id for INSERT statements
                if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
                    finalSql = pgSql + ' RETURNING id';
                }
                
                const result = await this.pool.query(finalSql, params);
                return { 
                    id: result.rows[0]?.id, 
                    changes: result.rowCount 
                };
            } catch (err) {
                throw err;
            }
        } else {
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
    }

    async get(sql, params = []) {
        if (this.isPostgres) {
            try {
                const pgSql = this.convertSqlToPostgres(sql, params);
                const result = await this.pool.query(pgSql, params);
                return result.rows[0] || null;
            } catch (err) {
                throw err;
            }
        } else {
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
        const sql = 'SELECT * FROM downloads WHERE download_token = ? AND expires_at > NOW()';
        return await this.get(sql, [token]);
    }

    async getDownloadsByIP(ip_address, timeWindow = '24 hours') {
        const sql = `
            SELECT COUNT(*) as count 
            FROM downloads 
            WHERE ip_address = ? AND created_at > NOW() - INTERVAL '${timeWindow}'
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
            WHERE status = 'pending' AND scheduled_at <= NOW()
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
        const sql = 'SELECT * FROM files WHERE product_type = ? AND is_active = TRUE';
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
            AND created_at >= NOW() - INTERVAL '${days} days'
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
            AND created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at), product_type
            ORDER BY date DESC
        `;
        return await this.query(sql);
    }
}

module.exports = new Database();
