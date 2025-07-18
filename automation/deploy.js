#!/usr/bin/env node

/**
 * RuneFlow Deployment Script
 * Automated deployment to multiple platforms
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
require('dotenv').config();

class RuneFlowDeployer {
    constructor() {
        this.buildDir = path.join(__dirname, '..', 'dist');
        this.sourceDir = path.join(__dirname, '..');
        this.platforms = ['netlify', 'vercel', 'github-pages'];
    }

    async deploy(platform = 'netlify') {
        console.log(`🚀 Starting deployment to ${platform}...`);
        
        try {
            // Build the project
            await this.build();
            
            // Deploy to specified platform
            switch (platform) {
                case 'netlify':
                    await this.deployToNetlify();
                    break;
                case 'vercel':
                    await this.deployToVercel();
                    break;
                case 'github-pages':
                    await this.deployToGitHubPages();
                    break;
                default:
                    throw new Error(`Unsupported platform: ${platform}`);
            }
            
            console.log('✅ Deployment completed successfully!');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error);
            throw error;
        }
    }

    async build() {
        console.log('📦 Building project...');
        
        // Create build directory
        await fs.ensureDir(this.buildDir);
        
        // Copy essential files
        await this.copyFiles();
        
        // Optimize assets
        await this.optimizeAssets();
        
        // Generate deployment configs
        await this.generateConfigs();
        
        console.log('✅ Build completed!');
    }

    async copyFiles() {
        const filesToCopy = [
            'index.html',
            'assets/css/coming-soon.css',
            'assets/js/coming-soon.js',
            'package.json'
        ];
        
        for (const file of filesToCopy) {
            const src = path.join(this.sourceDir, file);
            const dest = path.join(this.buildDir, file);
            
            await fs.ensureDir(path.dirname(dest));
            await fs.copy(src, dest);
            
            console.log(`📄 Copied: ${file}`);
        }
    }

    async optimizeAssets() {
        console.log('⚡ Optimizing assets...');
        
        // Minify CSS
        await this.minifyCSS();
        
        // Minify JS
        await this.minifyJS();
        
        // Optimize HTML
        await this.optimizeHTML();
        
        // Generate sitemap
        await this.generateSitemap();
        
        // Generate robots.txt
        await this.generateRobotsTxt();
    }

    async minifyCSS() {
        const CleanCSS = require('clean-css');
        const cssPath = path.join(this.buildDir, 'assets/css/coming-soon.css');
        
        const css = await fs.readFile(cssPath, 'utf8');
        const minified = new CleanCSS().minify(css);
        
        await fs.writeFile(cssPath, minified.styles);
        console.log('✅ CSS minified');
    }

    async minifyJS() {
        const UglifyJS = require('uglify-js');
        const jsPath = path.join(this.buildDir, 'assets/js/coming-soon.js');
        
        const js = await fs.readFile(jsPath, 'utf8');
        const minified = UglifyJS.minify(js);
        
        if (minified.error) {
            console.warn('⚠️ JS minification warning:', minified.error);
        } else {
            await fs.writeFile(jsPath, minified.code);
            console.log('✅ JS minified');
        }
    }

    async optimizeHTML() {
        const { minify } = require('html-minifier');
        const htmlPath = path.join(this.buildDir, 'index.html');
        
        const html = await fs.readFile(htmlPath, 'utf8');
        const minified = minify(html, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true
        });
        
        await fs.writeFile(htmlPath, minified);
        console.log('✅ HTML optimized');
    }

    async generateSitemap() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://runeflow.co/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
        
        await fs.writeFile(path.join(this.buildDir, 'sitemap.xml'), sitemap);
        console.log('✅ Sitemap generated');
    }

    async generateRobotsTxt() {
        const robots = `User-agent: *
Allow: /

Sitemap: https://runeflow.co/sitemap.xml`;
        
        await fs.writeFile(path.join(this.buildDir, 'robots.txt'), robots);
        console.log('✅ Robots.txt generated');
    }

    async generateConfigs() {
        // Netlify config
        const netlifyConfig = {
            build: {
                publish: "dist"
            },
            redirects: [
                {
                    from: "/api/*",
                    to: "/.netlify/functions/:splat",
                    status: 200
                }
            ],
            headers: [
                {
                    for: "/*",
                    values: {
                        "X-Frame-Options": "DENY",
                        "X-XSS-Protection": "1; mode=block",
                        "X-Content-Type-Options": "nosniff",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    }
                }
            ]
        };
        
        await fs.writeFile(
            path.join(this.buildDir, 'netlify.toml'),
            `[build]
  publish = "."
  command = "echo 'Build complete'"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"`
        );
        
        // Vercel config
        const vercelConfig = {
            name: "runeflow-coming-soon",
            version: 2,
            builds: [
                {
                    src: "index.html",
                    use: "@vercel/static"
                }
            ],
            routes: [
                {
                    src: "/(.*)",
                    dest: "/$1"
                }
            ]
        };
        
        await fs.writeFile(
            path.join(this.buildDir, 'vercel.json'),
            JSON.stringify(vercelConfig, null, 2)
        );
        
        console.log('✅ Deployment configs generated');
    }

    async deployToNetlify() {
        console.log('🌐 Deploying to Netlify...');
        
        if (!process.env.NETLIFY_ACCESS_TOKEN) {
            throw new Error('NETLIFY_ACCESS_TOKEN not found in environment variables');
        }
        
        // Create a zip file of the build
        const archiver = require('archiver');
        const zipPath = path.join(__dirname, '..', 'deploy.zip');
        
        await this.createZip(this.buildDir, zipPath);
        
        // Deploy to Netlify
        const formData = new FormData();
        formData.append('file', fs.createReadStream(zipPath));
        
        const response = await axios.post(
            `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
                    'Content-Type': 'application/zip'
                }
            }
        );
        
        console.log('✅ Netlify deployment successful!');
        console.log('🌐 URL:', response.data.url);
        
        // Clean up
        await fs.remove(zipPath);
        
        return response.data;
    }

    async deployToVercel() {
        console.log('▲ Deploying to Vercel...');
        
        if (!process.env.VERCEL_ACCESS_TOKEN) {
            throw new Error('VERCEL_ACCESS_TOKEN not found in environment variables');
        }
        
        // Use Vercel CLI for deployment
        return new Promise((resolve, reject) => {
            const cmd = `cd ${this.buildDir} && npx vercel --prod --token ${process.env.VERCEL_ACCESS_TOKEN}`;
            
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('✅ Vercel deployment successful!');
                    console.log('🌐 URL:', stdout.trim());
                    resolve(stdout.trim());
                }
            });
        });
    }

    async deployToGitHubPages() {
        console.log('🐙 Deploying to GitHub Pages...');
        
        // This would typically use gh-pages package
        return new Promise((resolve, reject) => {
            const cmd = `cd ${this.buildDir} && npx gh-pages -d . -r https://github.com/webhalla/runeflow.co.git`;
            
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('✅ GitHub Pages deployment successful!');
                    resolve(stdout);
                }
            });
        });
    }

    async createZip(sourceDir, zipPath) {
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = fs.createWriteStream(zipPath);
        
        return new Promise((resolve, reject) => {
            archive
                .directory(sourceDir, false)
                .on('error', reject)
                .pipe(stream);
            
            stream.on('close', resolve);
            archive.finalize();
        });
    }

    async triggerSocialMediaAnnouncement() {
        console.log('📢 Triggering social media announcement...');
        
        try {
            const SocialMediaBlast = require('../social-media-campaigns/social-blast');
            const socialBlast = new SocialMediaBlast();
            
            await socialBlast.executeBlast('launch_announcement');
            console.log('✅ Social media announcement sent!');
            
        } catch (error) {
            console.error('❌ Social media announcement failed:', error);
        }
    }
}

// CLI usage
if (require.main === module) {
    const deployer = new RuneFlowDeployer();
    const platform = process.argv[2] || 'netlify';
    
    deployer.deploy(platform)
        .then(async () => {
            console.log('🎉 Deployment pipeline completed!');
            
            // Trigger social media announcement
            await deployer.triggerSocialMediaAnnouncement();
            
            console.log('🚀 RuneFlow is now live!');
        })
        .catch(error => {
            console.error('💥 Deployment failed:', error);
            process.exit(1);
        });
}

module.exports = RuneFlowDeployer;
