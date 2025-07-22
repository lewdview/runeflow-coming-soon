#!/usr/bin/env node

/**
 * RuneFlow Optimization Script
 * Optimizes assets for production deployment
 */

const fs = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');

class RuneFlowOptimizer {
    constructor() {
        this.sourceDir = path.join(__dirname, '..');
        this.buildDir = path.join(__dirname, '..', 'dist');
    }

    async optimize() {
        console.log('🔧 Starting RuneFlow optimization...');
        
        try {
            // Ensure build directory exists
            await fs.ensureDir(this.buildDir);
            
            // Copy essential files
            await this.copyFiles();
            
            // Optimize assets
            await this.optimizeAssets();
            
            // Generate additional files
            await this.generateAdditionalFiles();
            
            console.log('✅ Optimization completed successfully!');
            
        } catch (error) {
            console.error('❌ Optimization failed:', error);
            process.exit(1);
        }
    }

    async copyFiles() {
        console.log('📁 Copying files...');
        
        const filesToCopy = [
            'index.html',
            'assets/css/coming-soon.css',
            'assets/js/coming-soon.js',
            'assets/images',
            'package.json',
            '.env.example'
        ];
        
        for (const file of filesToCopy) {
            const src = path.join(this.sourceDir, file);
            const dest = path.join(this.buildDir, file);
            
            if (await fs.pathExists(src)) {
                await fs.ensureDir(path.dirname(dest));
                await fs.copy(src, dest);
                console.log(`📄 Copied: ${file}`);
            } else {
                console.log(`⚠️  Skipped (not found): ${file}`);
            }
        }
        
        // Copy API directory if it exists
        const apiSrc = path.join(this.sourceDir, 'api');
        const apiDest = path.join(this.buildDir, 'api');
        if (await fs.pathExists(apiSrc)) {
            await fs.copy(apiSrc, apiDest);
            console.log('📄 Copied: api/');
        }
        
        // Copy automation directory (server files)
        const automationSrc = path.join(this.sourceDir, 'automation');
        const automationDest = path.join(this.buildDir, 'automation');
        if (await fs.pathExists(automationSrc)) {
            await fs.copy(automationSrc, automationDest);
            console.log('📄 Copied: automation/');
        }
    }

    async optimizeAssets() {
        console.log('⚡ Optimizing assets...');
        
        // Minify HTML
        await this.optimizeHTML();
        
        // Minify CSS
        await this.minifyCSS();
        
        // Minify JS
        await this.minifyJS();
        
        console.log('✅ Assets optimized!');
    }

    async optimizeHTML() {
        const htmlPath = path.join(this.buildDir, 'index.html');
        
        if (await fs.pathExists(htmlPath)) {
            const html = await fs.readFile(htmlPath, 'utf8');
            const minified = minify(html, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                minifyCSS: true,
                minifyJS: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                sortAttributes: true,
                sortClassName: true
            });
            
            await fs.writeFile(htmlPath, minified);
            console.log('✅ HTML optimized');
        }
    }

    async minifyCSS() {
        const cssPath = path.join(this.buildDir, 'assets/css/coming-soon.css');
        
        if (await fs.pathExists(cssPath)) {
            const css = await fs.readFile(cssPath, 'utf8');
            const result = new CleanCSS({
                level: 2,
                returnPromise: false
            }).minify(css);
            
            if (result.errors.length > 0) {
                console.warn('⚠️ CSS minification warnings:', result.errors);
            }
            
            await fs.writeFile(cssPath, result.styles);
            console.log('✅ CSS minified');
        }
    }

    async minifyJS() {
        const jsPath = path.join(this.buildDir, 'assets/js/coming-soon.js');
        
        if (await fs.pathExists(jsPath)) {
            const js = await fs.readFile(jsPath, 'utf8');
            const minified = UglifyJS.minify(js, {
                compress: {
                    drop_console: false,
                    drop_debugger: true
                },
                mangle: true
            });
            
            if (minified.error) {
                console.warn('⚠️ JS minification warning:', minified.error);
            } else {
                await fs.writeFile(jsPath, minified.code);
                console.log('✅ JS minified');
            }
        }
    }

    async generateAdditionalFiles() {
        console.log('📝 Generating additional files...');
        
        // Generate sitemap
        await this.generateSitemap();
        
        // Generate robots.txt
        await this.generateRobotsTxt();
        
        // Generate manifest.json
        await this.generateManifest();
        
        console.log('✅ Additional files generated!');
    }

    async generateSitemap() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://runeflow.xyz/</loc>
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

Sitemap: https://runeflow.xyz/sitemap.xml`;
        
        await fs.writeFile(path.join(this.buildDir, 'robots.txt'), robots);
        console.log('✅ Robots.txt generated');
    }

    async generateManifest() {
        const manifest = {
            "name": "RuneFlow - Ancient Automation Power",
            "short_name": "RuneFlow",
            "description": "The Ultimate n8n Template Marketplace - Ancient Power. Modern Automation.",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#000000",
            "theme_color": "#8B4513",
            "icons": [
                {
                    "src": "/assets/images/favicon-32x32.png",
                    "sizes": "32x32",
                    "type": "image/png"
                },
                {
                    "src": "/assets/images/favicon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ]
        };
        
        await fs.writeFile(
            path.join(this.buildDir, 'manifest.json'), 
            JSON.stringify(manifest, null, 2)
        );
        console.log('✅ Manifest.json generated');
    }
}

// Run optimization if called directly
if (require.main === module) {
    const optimizer = new RuneFlowOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = RuneFlowOptimizer;
