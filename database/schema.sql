-- RuneFlow Template Collection Database Schema
-- PostgreSQL database for managing template metadata, user analytics, and system operations

-- Drop existing tables if they exist
DROP TABLE IF EXISTS template_downloads CASCADE;
DROP TABLE IF EXISTS template_ratings CASCADE;
DROP TABLE IF EXISTS template_usage_analytics CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS template_integrations CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS template_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(7),
    parent_category_id VARCHAR(50) REFERENCES categories(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id),
    subcategory VARCHAR(100),
    rune_symbol VARCHAR(10),
    rune_meaning VARCHAR(200),
    difficulty VARCHAR(20) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    status VARCHAR(20) CHECK (status IN ('Active', 'Beta', 'Deprecated', 'Coming Soon')) DEFAULT 'Active',
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    description TEXT NOT NULL,
    long_description TEXT,
    author VARCHAR(100) NOT NULL DEFAULT 'RuneFlow Team',
    estimated_setup_time VARCHAR(50),
    file_size VARCHAR(20),
    pricing_tier VARCHAR(20) CHECK (pricing_tier IN ('Free', 'Pro', 'Enterprise')) DEFAULT 'Free',
    included_executions INTEGER DEFAULT 100,
    cost_per_execution DECIMAL(10,4) DEFAULT 0,
    support_level VARCHAR(20) CHECK (support_level IN ('Community', 'Pro', 'Enterprise')) DEFAULT 'Community',
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    preview_image VARCHAR(500),
    workflow_screenshot VARCHAR(500),
    demo_url VARCHAR(500),
    documentation_url VARCHAR(500),
    video_tutorial_url VARCHAR(500),
    community_forum_url VARCHAR(500),
    zip_file_path VARCHAR(500),
    json_workflow_path VARCHAR(500),
    readme_path VARCHAR(500),
    setup_guide_path VARCHAR(500),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7),
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template tags junction table
CREATE TABLE template_tags (
    template_id VARCHAR(100) REFERENCES templates(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- Integrations table
CREATE TABLE integrations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    auth_type VARCHAR(50),
    icon VARCHAR(500),
    is_supported BOOLEAN DEFAULT true,
    setup_guide_url VARCHAR(500),
    api_docs_url VARCHAR(500),
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template integrations junction table
CREATE TABLE template_integrations (
    template_id VARCHAR(100) REFERENCES templates(id) ON DELETE CASCADE,
    integration_id VARCHAR(50) REFERENCES integrations(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    configuration_notes TEXT,
    PRIMARY KEY (template_id, integration_id)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200),
    subscription_tier VARCHAR(20) CHECK (subscription_tier IN ('Free', 'Pro', 'Enterprise', 'Lifetime')) DEFAULT 'Free',
    subscription_status VARCHAR(20) CHECK (subscription_status IN ('Active', 'Cancelled', 'Expired', 'Trial')) DEFAULT 'Active',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    credits_remaining INTEGER DEFAULT 100,
    total_credits_purchased INTEGER DEFAULT 100,
    api_key VARCHAR(64) UNIQUE,
    is_whitelisted BOOLEAN DEFAULT false,
    signup_source VARCHAR(100),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions history table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_provider VARCHAR(50),
    payment_provider_id VARCHAR(200),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template downloads table
CREATE TABLE template_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100) NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    download_source VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template ratings table
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100) NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review TEXT,
    is_verified_download BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, user_id)
);

-- Template usage analytics table
CREATE TABLE template_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100) NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    execution_type VARCHAR(20) CHECK (execution_type IN ('Demo', 'Live', 'Test')) NOT NULL,
    execution_status VARCHAR(20) CHECK (execution_status IN ('Success', 'Failed', 'Partial', 'Cancelled')) NOT NULL,
    execution_time_ms INTEGER,
    credits_consumed INTEGER DEFAULT 0,
    error_message TEXT,
    integration_used VARCHAR(50),
    workflow_step_count INTEGER,
    data_processed_mb DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_difficulty ON templates(difficulty);
CREATE INDEX idx_templates_pricing_tier ON templates(pricing_tier);
CREATE INDEX idx_templates_rating ON templates(rating DESC);
CREATE INDEX idx_templates_download_count ON templates(download_count DESC);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX idx_template_downloads_template_id ON template_downloads(template_id);
CREATE INDEX idx_template_downloads_created_at ON template_downloads(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_template_usage_execution_type ON template_usage_analytics(execution_type);
CREATE INDEX idx_template_usage_status ON template_usage_analytics(execution_status);
CREATE INDEX idx_template_usage_created_at ON template_usage_analytics(created_at DESC);

-- Insert initial categories
INSERT INTO categories (id, name, description, icon, color, display_order) VALUES
('email-marketing', 'Email Marketing', 'Automated email sequences, welcome series, and subscriber management', '📧', '#ff6b35', 1),
('data-integration', 'Data Integration', 'Connect and synchronize data between different systems and APIs', '🔗', '#4ecdc4', 2),
('ecommerce', 'E-commerce', 'Automated order processing, inventory management, and customer service', '🛒', '#ffab00', 3),
('social-media', 'Social Media', 'Content scheduling, monitoring, and engagement automation', '📱', '#8b5cf6', 4),
('crm-automation', 'CRM Automation', 'Customer relationship management and sales process automation', '👥', '#10b981', 5),
('analytics-reporting', 'Analytics & Reporting', 'Data analysis, reporting, and business intelligence automation', '📊', '#f59e0b', 6);

-- Insert initial tags
INSERT INTO tags (name, color, description) VALUES
('email-automation', '#ff6b35', 'Email marketing and automation workflows'),
('lead-generation', '#10b981', 'Lead capture and nurturing processes'),
('starter-pack', '#8b5cf6', 'Beginner-friendly templates for getting started'),
('data-transformation', '#4ecdc4', 'Data processing and transformation workflows'),
('api-integration', '#6366f1', 'API connectivity and integration templates'),
('webhook', '#f59e0b', 'Webhook-based automation workflows'),
('crm-sync', '#ef4444', 'CRM synchronization and management'),
('analytics', '#06b6d4', 'Analytics and reporting automation'),
('social-media', '#ec4899', 'Social media management and posting'),
('ecommerce', '#f97316', 'E-commerce and online store automation'),
('notification', '#84cc16', 'Alert and notification systems'),
('scheduling', '#a855f7', 'Time-based and scheduled workflows');

-- Insert initial integrations
INSERT INTO integrations (id, name, type, category, auth_type, is_supported, popularity_score) VALUES
('gmail', 'Gmail', 'Email Service', 'email-services', 'OAuth2', true, 95),
('outlook', 'Outlook', 'Email Service', 'email-services', 'OAuth2', true, 85),
('sendgrid', 'SendGrid', 'Email Service', 'email-services', 'API Key', true, 75),
('hubspot', 'HubSpot', 'CRM', 'crm-systems', 'API Key', true, 90),
('salesforce', 'Salesforce', 'CRM', 'crm-systems', 'OAuth2', true, 95),
('google-sheets', 'Google Sheets', 'Spreadsheet', 'data-storage', 'Service Account', true, 100),
('airtable', 'Airtable', 'Database', 'data-storage', 'API Key', true, 80),
('slack', 'Slack', 'Communication', 'communication', 'OAuth2', true, 85),
('discord', 'Discord', 'Communication', 'communication', 'Webhook', true, 70),
('stripe', 'Stripe', 'Payment', 'payment', 'API Key', true, 90);

-- Insert initial templates
INSERT INTO templates (
    id, name, category_id, subcategory, rune_symbol, rune_meaning,
    difficulty, description, long_description, estimated_setup_time,
    file_size, zip_file_path, json_workflow_path
) VALUES (
    'flowrune-automation-template',
    'FlowRune - The Automation Master',
    'email-marketing',
    'Lead Generation',
    'ᚠ',
    'Wealth, Abundance, Flow',
    'Beginner',
    'Comprehensive email automation workflow for lead capture, nurturing, and conversion tracking',
    'FlowRune harnesses the ancient power of wealth and abundance to create seamless lead generation flows. This template automates the entire process from initial contact capture through nurturing sequences and conversion tracking.',
    '10 minutes',
    '18.1 KB',
    '/assets/downloads/FlowRune-Automation-Template.zip',
    '/templates/workflows/flowrune-automation.json'
), (
    'ansuz-messenger-template',
    'Ansuz - The Messenger',
    'email-marketing',
    'Welcome Sequences',
    'ᚨ',
    'Divine Communication, Messages, Signals',
    'Beginner',
    'Complete email automation workflow for new subscriber onboarding with advanced lead enrichment',
    'Ansuz channels the power of divine communication to create seamless messaging workflows. Perfect for welcoming new subscribers with personalized sequences based on their profile and behavior.',
    '5 minutes',
    '7.5 KB',
    '/assets/downloads/Ansuz-Messenger-Template.zip',
    '/templates/workflows/ansuz-messenger.json'
), (
    'laguz-adapter-template',
    'Laguz - The Flow Adapter',
    'data-integration',
    'API Transformation',
    'ᛚ',
    'Flow, Water, Adaptation, Flexibility',
    'Intermediate',
    'Flexible data transformation and API integration template for connecting disparate systems',
    'Laguz embodies the fluid nature of water, adapting to any container. This template provides powerful data transformation capabilities, allowing you to seamlessly connect different APIs and data formats.',
    '15 minutes',
    '10.8 KB',
    '/assets/downloads/Laguz-Adapter-Template.zip',
    '/templates/workflows/laguz-adapter.json'
);

-- Link templates to tags
INSERT INTO template_tags (template_id, tag_id) VALUES
('flowrune-automation-template', (SELECT id FROM tags WHERE name = 'email-automation')),
('flowrune-automation-template', (SELECT id FROM tags WHERE name = 'lead-generation')),
('flowrune-automation-template', (SELECT id FROM tags WHERE name = 'starter-pack')),
('ansuz-messenger-template', (SELECT id FROM tags WHERE name = 'email-automation')),
('ansuz-messenger-template', (SELECT id FROM tags WHERE name = 'starter-pack')),
('ansuz-messenger-template', (SELECT id FROM tags WHERE name = 'notification')),
('laguz-adapter-template', (SELECT id FROM tags WHERE name = 'data-transformation')),
('laguz-adapter-template', (SELECT id FROM tags WHERE name = 'api-integration')),
('laguz-adapter-template', (SELECT id FROM tags WHERE name = 'webhook'));

-- Link templates to integrations
INSERT INTO template_integrations (template_id, integration_id, is_required) VALUES
('flowrune-automation-template', 'gmail', true),
('flowrune-automation-template', 'google-sheets', true),
('flowrune-automation-template', 'slack', false),
('ansuz-messenger-template', 'gmail', true),
('ansuz-messenger-template', 'hubspot', true),
('ansuz-messenger-template', 'slack', true),
('ansuz-messenger-template', 'google-sheets', true),
('laguz-adapter-template', 'airtable', false),
('laguz-adapter-template', 'google-sheets', false);

-- Create stored procedures for common operations

-- Function to update template rating
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE templates 
    SET 
        rating = (
            SELECT ROUND(AVG(rating::numeric), 2) 
            FROM template_ratings 
            WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM template_ratings 
            WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.template_id, OLD.template_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for template rating updates
DROP TRIGGER IF EXISTS trigger_update_template_rating ON template_ratings;
CREATE TRIGGER trigger_update_template_rating
    AFTER INSERT OR UPDATE OR DELETE ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_template_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE templates 
    SET 
        download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = NEW.template_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for download count updates
DROP TRIGGER IF EXISTS trigger_increment_download_count ON template_downloads;
CREATE TRIGGER trigger_increment_download_count
    AFTER INSERT ON template_downloads
    FOR EACH ROW
    EXECUTE FUNCTION increment_download_count();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag usage count updates
DROP TRIGGER IF EXISTS trigger_update_tag_usage_count ON template_tags;
CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON template_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- Views for analytics and reporting

-- Template statistics view
CREATE OR REPLACE VIEW template_stats AS
SELECT 
    t.id,
    t.name,
    t.category_id,
    c.name as category_name,
    t.difficulty,
    t.rating,
    t.rating_count,
    t.download_count,
    COUNT(DISTINCT td.id) as total_downloads,
    COUNT(DISTINCT tr.id) as total_ratings,
    AVG(CASE WHEN tua.execution_status = 'Success' THEN 1.0 ELSE 0.0 END) as success_rate,
    COUNT(DISTINCT tua.id) as total_executions
FROM templates t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN template_downloads td ON t.id = td.template_id
LEFT JOIN template_ratings tr ON t.id = tr.template_id
LEFT JOIN template_usage_analytics tua ON t.id = tua.template_id
GROUP BY t.id, t.name, t.category_id, c.name, t.difficulty, t.rating, t.rating_count, t.download_count;

-- Popular templates view
CREATE OR REPLACE VIEW popular_templates AS
SELECT 
    t.*,
    c.name as category_name,
    c.icon as category_icon,
    COUNT(td.id) as downloads_last_30_days
FROM templates t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN template_downloads td ON t.id = td.template_id 
    AND td.created_at > NOW() - INTERVAL '30 days'
WHERE t.status = 'Active'
GROUP BY t.id, c.name, c.icon
ORDER BY downloads_last_30_days DESC, t.rating DESC, t.download_count DESC;

-- User analytics view
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
    u.id,
    u.email,
    u.subscription_tier,
    u.credits_remaining,
    COUNT(DISTINCT td.template_id) as templates_downloaded,
    COUNT(DISTINCT tr.template_id) as templates_rated,
    COUNT(tua.id) as total_executions,
    SUM(tua.credits_consumed) as credits_used,
    u.created_at
FROM users u
LEFT JOIN template_downloads td ON u.id = td.user_id
LEFT JOIN template_ratings tr ON u.id = tr.user_id
LEFT JOIN template_usage_analytics tua ON u.id = tua.user_id
GROUP BY u.id, u.email, u.subscription_tier, u.credits_remaining, u.created_at;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO runeflow_api;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO runeflow_api;
