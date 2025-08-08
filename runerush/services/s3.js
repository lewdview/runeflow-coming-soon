const AWS = require('aws-sdk');
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class S3Service {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
        });
        this.bucketName = process.env.S3_BUCKET_NAME;
    }

    /**
     * Generate secure signed URL for file download
     * @param {string} s3Key - S3 object key
     * @param {number} expiresIn - Expiration time in seconds (default: 24 hours)
     * @returns {string} Signed URL
     */
    async generateSignedUrl(s3Key, expiresIn = 24 * 60 * 60) {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: s3Key,
                Expires: expiresIn,
                ResponseContentDisposition: 'attachment'
            };

            const url = await this.s3.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.error('Failed to generate signed URL:', error);
            throw new Error('Failed to generate download link');
        }
    }

    /**
     * Create secure download token and track access
     * @param {number} userId - User ID
     * @param {string} s3Key - S3 object key
     * @param {string} ipAddress - Client IP address
     * @param {string} userAgent - Client user agent
     * @returns {object} Download token and expiry
     */
    async createDownloadToken(userId, s3Key, ipAddress, userAgent) {
        try {
            // Check IP-based download limits
            const downloadsFromIP = await db.getDownloadsByIP(ipAddress);
            const maxDownloads = parseInt(process.env.MAX_DOWNLOADS_PER_IP) || 3;

            if (downloadsFromIP >= maxDownloads) {
                throw new Error('Download limit exceeded for this IP address');
            }

            // Generate unique download token
            const downloadToken = uuidv4();
            const expiryHours = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRY?.replace('h', '')) || 24;
            const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

            // Store download record
            await db.createDownload({
                user_id: userId,
                file_path: s3Key,
                ip_address: ipAddress,
                user_agent: userAgent,
                download_token: downloadToken,
                expires_at: expiresAt
            });

            return {
                download_token: downloadToken,
                expires_at: expiresAt,
                download_url: `${process.env.FRONTEND_URL}/api/download/${downloadToken}`
            };
        } catch (error) {
            console.error('Failed to create download token:', error);
            throw error;
        }
    }

    /**
     * Validate download token and generate temporary signed URL
     * @param {string} token - Download token
     * @returns {object} Download details and signed URL
     */
    async validateAndGenerateDownload(token) {
        try {
            const download = await db.getDownloadByToken(token);
            
            if (!download) {
                throw new Error('Invalid or expired download token');
            }

            // Generate signed URL with short expiry (15 minutes)
            const signedUrl = await this.generateSignedUrl(download.file_path, 15 * 60);

            return {
                signed_url: signedUrl,
                file_path: download.file_path,
                user_id: download.user_id
            };
        } catch (error) {
            console.error('Download validation failed:', error);
            throw error;
        }
    }

    /**
     * Get downloadable files for user based on their purchase type
     * @param {number} userId - User ID
     * @returns {Array} Array of downloadable files with tokens
     */
    async getUserDownloadableFiles(userId, ipAddress, userAgent) {
        try {
            const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
            if (!user) {
                throw new Error('User not found');
            }

            // Determine which files user has access to based on purchase history
            const userOrders = await db.query("SELECT DISTINCT product_type FROM orders WHERE user_id = ? AND status = 'completed'", [userId]);
            const purchasedTypes = userOrders.map(order => order.product_type);
            
            const productTypes = ['core']; // Everyone gets core files
            
            // Check for specific purchases
            if (purchasedTypes.includes('complete_collection')) {
                // Complete collection gets everything
                productTypes.push('pro_bundle', 'complete_collection', 'main', 'upsell');
            } else if (purchasedTypes.includes('pro_bundle') || user.is_lifetime) {
                // Pro bundle or lifetime gets pro files
                productTypes.push('pro_bundle', 'upsell');
            } else if (purchasedTypes.includes('main')) {
                // Legacy main product support
                productTypes.push('main');
            }

            const files = [];
            for (const productType of productTypes) {
                const productFiles = await db.getFilesByProductType(productType);
                files.push(...productFiles);
            }

            // Create download tokens for each file
            const downloadableFiles = [];
            for (const file of files) {
                try {
                    const downloadInfo = await this.createDownloadToken(
                        userId, 
                        file.s3_key, 
                        ipAddress, 
                        userAgent
                    );

                    downloadableFiles.push({
                        id: file.id,
                        display_name: file.display_name,
                        file_size: file.file_size,
                        content_type: file.content_type,
                        product_type: file.product_type,
                        download_url: downloadInfo.download_url,
                        expires_at: downloadInfo.expires_at
                    });
                } catch (error) {
                    console.error(`Failed to create download for file ${file.id}:`, error);
                    // Continue with other files
                }
            }

            return downloadableFiles;
        } catch (error) {
            console.error('Failed to get user downloadable files:', error);
            throw error;
        }
    }

    /**
     * Upload file to S3 (for admin use)
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} key - S3 key
     * @param {string} contentType - MIME type
     * @returns {object} Upload result
     */
    async uploadFile(fileBuffer, key, contentType) {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                ServerSideEncryption: 'AES256'
            };

            const result = await this.s3.upload(params).promise();
            
            return {
                location: result.Location,
                etag: result.ETag,
                key: result.Key
            };
        } catch (error) {
            console.error('File upload failed:', error);
            throw new Error('File upload failed');
        }
    }

    /**
     * Delete file from S3 (for admin use)
     * @param {string} key - S3 key
     * @returns {boolean} Success status
     */
    async deleteFile(key) {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key
            };

            await this.s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('File deletion failed:', error);
            throw new Error('File deletion failed');
        }
    }

    /**
     * Check if file exists in S3
     * @param {string} key - S3 key
     * @returns {boolean} File exists
     */
    async fileExists(key) {
        try {
            await this.s3.headObject({
                Bucket: this.bucketName,
                Key: key
            }).promise();
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Get file metadata
     * @param {string} key - S3 key
     * @returns {object} File metadata
     */
    async getFileMetadata(key) {
        try {
            const result = await this.s3.headObject({
                Bucket: this.bucketName,
                Key: key
            }).promise();

            return {
                size: result.ContentLength,
                lastModified: result.LastModified,
                contentType: result.ContentType,
                etag: result.ETag
            };
        } catch (error) {
            console.error('Failed to get file metadata:', error);
            throw new Error('Failed to get file information');
        }
    }

    /**
     * Create presigned POST URL for direct file uploads (admin)
     * @param {string} key - S3 key
     * @param {string} contentType - MIME type
     * @param {number} maxSize - Maximum file size in bytes
     * @returns {object} Presigned POST data
     */
    async createPresignedPost(key, contentType, maxSize = 100 * 1024 * 1024) {
        try {
            const params = {
                Bucket: this.bucketName,
                Fields: {
                    key: key,
                    'Content-Type': contentType
                },
                Conditions: [
                    ['content-length-range', 0, maxSize],
                    ['eq', '$Content-Type', contentType]
                ],
                Expires: 3600 // 1 hour
            };

            return await this.s3.createPresignedPost(params);
        } catch (error) {
            console.error('Failed to create presigned POST:', error);
            throw new Error('Failed to create upload URL');
        }
    }
}

module.exports = new S3Service();
