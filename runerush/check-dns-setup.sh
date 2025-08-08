#!/bin/bash

# DNS and SSL Verification Script for Cloudflare + Netlify Setup
# This script helps verify your DNS configuration

echo "============================================================"
echo "🔍 DNS & SSL Configuration Checker"
echo "============================================================"
echo ""

# Domains to check
DOMAINS=("runerush.xyz" "www.runerush.xyz" "runeflow.xyz" "www.runeflow.xyz")

# Function to check DNS records
check_dns() {
    local domain=$1
    echo "📡 Checking DNS for: $domain"
    echo "----------------------------"
    
    # Get A records
    echo "A Records:"
    dig +short A $domain
    
    # Get CNAME records
    echo "CNAME Records:"
    dig +short CNAME $domain
    
    # Get nameservers
    echo "Nameservers:"
    dig +short NS $domain | head -2
    
    echo ""
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    echo "🔒 Checking SSL for: $domain"
    echo "----------------------------"
    
    # Check if HTTPS is accessible
    if curl -Is https://$domain | head -1 | grep -q "200\|301\|302"; then
        echo "✅ HTTPS is accessible"
        
        # Get certificate issuer
        echo "Certificate Issuer:"
        echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null | cut -d'=' -f2-
    else
        echo "❌ HTTPS is not accessible or returning error"
    fi
    
    echo ""
}

# Function to check HTTP to HTTPS redirect
check_redirect() {
    local domain=$1
    echo "🔄 Checking HTTP→HTTPS redirect for: $domain"
    echo "----------------------------"
    
    response=$(curl -Is http://$domain | head -1)
    if echo "$response" | grep -q "301\|302"; then
        echo "✅ HTTP redirects to HTTPS"
    else
        echo "⚠️  No automatic redirect from HTTP to HTTPS"
    fi
    
    echo ""
}

# Main checks
echo "🌍 CURRENT DNS CONFIGURATION"
echo "============================================================"
echo ""

for domain in "${DOMAINS[@]}"; do
    echo "🔍 CHECKING: $domain"
    echo "============================================================"
    check_dns $domain
    check_ssl $domain
    check_redirect $domain
    echo ""
done

# Check Cloudflare status
echo "☁️  CLOUDFLARE VERIFICATION"
echo "============================================================"
echo ""

# Check if using Cloudflare nameservers
for domain in "runerush.xyz" "runeflow.xyz"; do
    echo "Checking if $domain uses Cloudflare:"
    if dig +short NS $domain | grep -q "cloudflare"; then
        echo "✅ Using Cloudflare nameservers"
    else
        echo "❌ Not using Cloudflare nameservers"
    fi
done

echo ""
echo "📋 NETLIFY REQUIREMENTS"
echo "============================================================"
echo ""
echo "For Netlify to work with Cloudflare, you need:"
echo ""
echo "1. DNS Records pointing to Netlify:"
echo "   - A record: 75.2.60.5 (or your Netlify IP)"
echo "   - CNAME: [your-site].netlify.app"
echo ""
echo "2. Cloudflare Settings:"
echo "   - Proxy: DNS Only (Gray Cloud) ⚠️ CRITICAL"
echo "   - SSL/TLS: Full (not Full Strict)"
echo "   - Always Use HTTPS: ON"
echo ""
echo "3. Common Netlify IPs:"
echo "   - 75.2.60.5"
echo "   - 104.198.14.52"
echo ""

echo "🔧 NEXT STEPS"
echo "============================================================"
echo ""
echo "1. Log into Cloudflare Dashboard"
echo "2. Check each DNS record has 'DNS only' (gray cloud)"
echo "3. Verify SSL/TLS is set to 'Full'"
echo "4. In Netlify, ensure custom domain is verified"
echo "5. Wait 5-10 minutes for propagation"
echo ""
echo "✨ Check complete!"
echo ""
