const fs = require('fs-extra');
const path = require('path');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');

console.log('🏗️  Building static version for shared hosting...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Copy static assets
console.log('📁 Copying static assets...');
fs.copySync(path.join(__dirname, 'assets'), path.join(distDir, 'assets'));
fs.copySync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));

// Read and process HTML
console.log('🔧 Processing HTML...');
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Update HTML for static deployment
html = html.replace(/\/api\//g, '/api/');
html = html.replace('http://localhost:3000', '');

// Minify CSS
console.log('📦 Minifying CSS...');
const cssPath = path.join(distDir, 'assets/css/coming-soon.css');
const css = fs.readFileSync(cssPath, 'utf8');
const minifiedCSS = new CleanCSS().minify(css);
fs.writeFileSync(cssPath, minifiedCSS.styles);

// Minify JavaScript
console.log('📦 Minifying JavaScript...');
const jsPath = path.join(distDir, 'assets/js/coming-soon.js');
const js = fs.readFileSync(jsPath, 'utf8');

// Update JavaScript for static deployment
const staticJs = js.replace(/http:\/\/localhost:3000/g, '');
const minifiedJS = UglifyJS.minify(staticJs);
if (minifiedJS.error) {
    console.warn('⚠️  JavaScript minification failed, using original');
    fs.writeFileSync(jsPath, staticJs);
} else {
    fs.writeFileSync(jsPath, minifiedJS.code);
}

// Create serverless functions for email capture
console.log('🔄 Creating serverless functions...');
const apiDir = path.join(distDir, 'api');
fs.ensureDirSync(apiDir);

// Create PHP version for shared hosting
const phpEmailHandler = `<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Save to file (you might want to use a database instead)
$data = [
    'email' => $email,
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

file_put_contents('../../data/emails.json', json_encode($data) . "\\n", FILE_APPEND | LOCK_EX);

// Send email (configure with your SMTP settings)
$to = 'bryan@webhalla.com';
$subject = 'New RuneFlow Signup';
$message = "New email signup: " . $email;
$headers = 'From: noreply@' . $_SERVER['HTTP_HOST'];

mail($to, $subject, $message, $headers);

echo json_encode(['success' => true, 'message' => 'Email added to waitlist']);
?>`;

fs.writeFileSync(path.join(apiDir, 'waitlist.php'), phpEmailHandler);

// Create simple HTML form fallback
const htmlFormFallback = `<!DOCTYPE html>
<html>
<head>
    <title>RuneFlow Waitlist</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
        input[type="email"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #005a8b; }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Join the RuneFlow Waitlist</h2>
        <form action="api/waitlist.php" method="POST">
            <input type="email" name="email" placeholder="Enter your email address" required>
            <button type="submit">Join Waitlist</button>
        </form>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'signup.html'), htmlFormFallback);

// Create data directory
const dataDir = path.join(distDir, 'data');
fs.ensureDirSync(dataDir);
fs.writeFileSync(path.join(dataDir, 'emails.json'), '');

// Create .htaccess for Apache servers
const htaccess = `RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>`;

fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess);

// Write final HTML
fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Create upload instructions
const uploadInstructions = `# Upload Instructions for Static Hosting

## 📁 Files to Upload

Upload the contents of the 'dist' folder to your hosting:

### Via FTP/SFTP:
1. Connect to your hosting via FTP
2. Navigate to public_html/ (or your domain's root folder)
3. Upload all files from dist/ folder

### Via cPanel File Manager:
1. Login to cPanel
2. Open File Manager
3. Navigate to public_html/
4. Upload and extract all files from dist/ folder

## 🔧 Configuration Required

### 1. Email Setup
- Edit api/waitlist.php with your email settings
- Test the contact form at: your-domain.com/signup.html

### 2. Domain Configuration
- Point your domain to your hosting server
- Enable SSL certificate in your hosting control panel

### 3. File Permissions
Set these permissions:
- Folders: 755
- Files: 644
- api/waitlist.php: 644
- data/ folder: 755 (writable)

## 🧪 Testing

After upload, test:
1. Visit your domain - should load the landing page
2. Test email signup at: your-domain.com/signup.html
3. Check if data/emails.json is being created

## 📊 Monitoring

- Check data/emails.json for new signups
- Monitor your hosting logs for errors
- Set up email forwarding for notifications

## 🚨 Troubleshooting

Common issues:
1. **PHP not working**: Enable PHP in your hosting control panel
2. **Emails not sending**: Configure SMTP settings in waitlist.php
3. **Permission errors**: Set correct file permissions
4. **Forms not submitting**: Check .htaccess configuration

Need help? Contact bryan@webhalla.com
`;

fs.writeFileSync(path.join(distDir, 'UPLOAD_INSTRUCTIONS.md'), uploadInstructions);

console.log('✅ Static build complete!');
console.log('📁 Files are ready in the "dist" folder');
console.log('📖 Read UPLOAD_INSTRUCTIONS.md for next steps');
console.log('🌐 Upload the contents of dist/ folder to your hosting');
