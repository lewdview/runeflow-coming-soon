#!/bin/bash

echo "🚀 RuneFlow.xyz Deployment Status Check"
echo "========================================"
echo ""

# Check main domain
echo "🌐 Main Domain Status:"
echo "Domain: runeflow.xyz"
MAIN_HEADERS=$(curl -I https://runeflow.xyz 2>/dev/null | grep -E "(server|cache-status)" | head -2)
echo "$MAIN_HEADERS"

if echo "$MAIN_HEADERS" | grep -q "Netlify"; then
    echo "✅ Active Deployment: NETLIFY"
    ACTIVE="netlify"
elif echo "$MAIN_HEADERS" | grep -q "Railway"; then
    echo "✅ Active Deployment: RAILWAY"  
    ACTIVE="railway"
else
    echo "❓ Unknown deployment type"
    ACTIVE="unknown"
fi

echo ""
echo "🔍 Testing Active Deployment Functions:"
echo "========================================"

if [ "$ACTIVE" = "netlify" ]; then
    echo "Testing Netlify Functions..."
    echo ""
    
    echo "📡 Health Check:"
    HEALTH_RESPONSE=$(curl -s https://runeflow.xyz/.netlify/functions/health 2>/dev/null)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy\|status"; then
        echo "✅ Netlify health function: WORKING"
    else
        echo "❌ Netlify health function: NOT WORKING"
        echo "Response: ${HEALTH_RESPONSE:0:100}..."
    fi
    
    echo ""
    echo "📧 Email Capture Test:"
    EMAIL_RESPONSE=$(curl -s -X POST https://runeflow.xyz/.netlify/functions/capture-email \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","selected_rune":"test"}' 2>/dev/null)
    
    if echo "$EMAIL_RESPONSE" | grep -q "success\|captured"; then
        echo "✅ Netlify email function: WORKING"
    else
        echo "❌ Netlify email function: NOT WORKING" 
        echo "Response: ${EMAIL_RESPONSE:0:100}..."
    fi
    
elif [ "$ACTIVE" = "railway" ]; then
    echo "Testing Railway Endpoints..."
    echo ""
    
    echo "📡 Health Check:"
    HEALTH_RESPONSE=$(curl -s https://runeflow.xyz/health 2>/dev/null)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy\|status"; then
        echo "✅ Railway health endpoint: WORKING"
    else
        echo "❌ Railway health endpoint: NOT WORKING"
    fi
    
    echo ""
    echo "📧 Email Capture Test:"
    EMAIL_RESPONSE=$(curl -s -X POST https://runeflow.xyz/capture-email \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","selected_rune":"test"}' 2>/dev/null)
    
    if echo "$EMAIL_RESPONSE" | grep -q "success\|captured"; then
        echo "✅ Railway email endpoint: WORKING"
    else
        echo "❌ Railway email endpoint: NOT WORKING"
    fi
    
    echo ""
    echo "🔐 Admin Analytics Test:"
    ADMIN_RESPONSE=$(curl -s -H "Authorization: Bearer runeflow-admin-2025" https://runeflow.xyz/admin/analytics 2>/dev/null)
    if echo "$ADMIN_RESPONSE" | grep -q "totalSignups\|analytics"; then
        echo "✅ Railway admin analytics: WORKING"
    else
        echo "❌ Railway admin analytics: NOT WORKING"
    fi
fi

echo ""
echo "📊 Performance Test:"
echo "===================="
echo "Testing response time..."
START_TIME=$(date +%s%3N)
curl -s https://runeflow.xyz > /dev/null 2>&1
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))
echo "⚡ Response time: ${RESPONSE_TIME}ms"

echo ""
echo "💡 Recommendations:"
echo "==================="
if [ "$ACTIVE" = "netlify" ]; then
    echo "• Currently using Netlify (cost-effective)"
    echo "• Consider switching to Railway for full features"
    echo "• Check Netlify function logs if functions aren't working"
elif [ "$ACTIVE" = "railway" ]; then
    echo "• Currently using Railway (full features)"
    echo "• Monitor costs and usage"
    echo "• Netlify available as backup"
else
    echo "• Unable to determine active deployment"
    echo "• Check DNS settings and deployment status"
fi

echo ""
echo "🔗 Quick Links:"
echo "==============="
echo "• Netlify Dashboard: https://app.netlify.com"
echo "• Railway Dashboard: https://railway.app"
echo "• Domain: https://runeflow.xyz"
echo ""
