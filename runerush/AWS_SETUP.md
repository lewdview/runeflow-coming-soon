# RuneRUSH AWS S3 Setup Guide

## 🚀 Quick Setup Steps

### 1. Create IAM User and Policy

1. **Go to AWS IAM Console** → Users → Create User
2. **User name**: `runerush-s3-access`
3. **Access type**: Programmatic access
4. **Create Policy** with this JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "RuneRUSHS3FullAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject", 
                "s3:DeleteObject",
                "s3:GetObjectVersion",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetObjectAcl",
                "s3:PutObjectAcl",
                "s3:GetBucketVersioning"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME",
                "arn:aws:s3:::YOUR_BUCKET_NAME/*"
            ]
        }
    ]
}
```

5. **Attach policy** to user
6. **Download credentials** (Access Key ID + Secret Access Key)

### 2. Update Environment Variables

Add these to your `.env` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-runerush-bucket-name

# Download Configuration
MAX_DOWNLOADS_PER_IP=3
DOWNLOAD_TOKEN_EXPIRY=24h
FRONTEND_URL=https://your-domain.com
```

### 3. S3 Bucket Structure

Your files should be uploaded to S3 with this structure:
```
your-bucket-name/
└── templates/
    ├── RuneRUSH_Core_50_Social_Media_Ad_Templates.zip
    ├── RuneRUSH_Pro_100_Templates_Core_Plus_Premium.zip
    └── RuneRUSH_Complete_8000_Plus_Templates_All_Collections.zip
```

### 4. Seed Database with File Information

```bash
# Add files to database
node scripts/seed-files.js

# Test S3 connection and downloads
node scripts/test-s3-downloads.js
```

## 🔧 System Architecture

### License Key Flow:
1. **Customer purchases** → Stripe webhook creates user with license key
2. **Customer visits downloads page** → Enters license key  
3. **System validates key** → Determines access level (Core/Pro/Complete)
4. **Generate download tokens** → Creates secure, expiring download links
5. **Customer clicks download** → Redirects to S3 signed URL

### Product Access Logic:
- **Core**: Gets core templates only
- **Pro Bundle**: Gets core + pro templates  
- **Complete Collection**: Gets all templates
- **Lifetime users**: Get everything

### Security Features:
- ✅ IP-based download limits (3 per IP per 24h)
- ✅ Expiring download tokens (24h default)
- ✅ Signed S3 URLs (15 min expiry)
- ✅ Rate limiting on API endpoints
- ✅ License key validation

## 🧪 Testing

### Test API Endpoints:

```bash
# Test file configuration
GET /api/test/downloads

# Get user downloads (replace with real license key)
GET /api/downloads?license_key=RR-XXXX-XXXX-XXXX

# Get user info
GET /api/user/RR-XXXX-XXXX-XXXX
```

### Test Download Flow:

1. **Get files for user**:
```bash
curl "https://your-domain.com/api/downloads?license_key=RR-XXXX-XXXX-XXXX"
```

2. **Download file** (use token from response):
```bash
curl "https://your-domain.com/api/download/TOKEN_HERE"
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Download limit exceeded"**
   - User hit IP limit (3 downloads/24h)
   - Reset with: `DELETE FROM downloads WHERE ip_address = 'x.x.x.x'`

2. **"Invalid license key"** 
   - Check user exists: `SELECT * FROM users WHERE license_key = 'RR-XXXX-XXXX-XXXX'`

3. **"File not found in S3"**
   - Verify S3 keys match database: `SELECT s3_key FROM files`
   - Test S3 access: `node scripts/test-s3-downloads.js`

4. **"Access Denied"**
   - Check IAM policy has correct bucket ARN
   - Verify AWS credentials in .env

## 📊 Database Schema

```sql
-- Files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,  
    s3_key VARCHAR(500),                -- Path in S3 bucket
    file_size INTEGER,                  -- Size in bytes
    content_type VARCHAR(100),          -- MIME type
    product_type VARCHAR(50) NOT NULL,  -- core, pro_bundle, complete_collection
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Downloads table (tracks access)
CREATE TABLE downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    download_token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment Checklist

- [ ] IAM user created with proper S3 permissions
- [ ] S3 bucket created and files uploaded
- [ ] Environment variables configured
- [ ] Database seeded with file information
- [ ] S3 connection tested
- [ ] Download flow tested end-to-end
- [ ] License key system validated
- [ ] IP limits configured
- [ ] Monitoring/logging enabled
