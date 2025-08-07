-- Twitter Bot Database Schema

-- Table to track daily template posts
CREATE TABLE IF NOT EXISTS daily_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(255) NOT NULL,
    template_name VARCHAR(500) NOT NULL,
    template_category VARCHAR(255),
    nodes_count INTEGER,
    quality_score INTEGER,
    post_date DATE NOT NULL,
    tweet_id VARCHAR(255),
    tweet_text TEXT,
    access_token VARCHAR(255) UNIQUE,
    access_expires_at TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    retweets_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track template access tokens for daily downloads
CREATE TABLE IF NOT EXISTS template_access_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    daily_template_id INTEGER REFERENCES daily_templates(id),
    expires_at TIMESTAMP NOT NULL,
    downloads_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track template posting queue and rotation
CREATE TABLE IF NOT EXISTS template_queue (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(255) NOT NULL,
    template_name VARCHAR(500) NOT NULL,
    template_category VARCHAR(255),
    nodes_count INTEGER,
    quality_score INTEGER,
    priority_score INTEGER DEFAULT 0,
    last_posted DATE,
    times_posted INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track engagement metrics
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id SERIAL PRIMARY KEY,
    daily_template_id INTEGER REFERENCES daily_templates(id),
    metric_type VARCHAR(50), -- 'views', 'likes', 'retweets', 'downloads'
    metric_value INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_templates_post_date ON daily_templates(post_date);
CREATE INDEX IF NOT EXISTS idx_daily_templates_access_token ON daily_templates(access_token);
CREATE INDEX IF NOT EXISTS idx_template_access_tokens_token ON template_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_template_access_tokens_expires ON template_access_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_template_queue_last_posted ON template_queue(last_posted);
CREATE INDEX IF NOT EXISTS idx_template_queue_priority ON template_queue(priority_score DESC);
