#!/bin/bash

echo "🚀 RuneRush AWS Deployment Script"
echo "=================================="

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI not found. Installing..."
    pip install awsebcli --upgrade --user
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run: aws configure"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Initialize Elastic Beanstalk (first time only)
if [ ! -f .elasticbeanstalk/config.yml ]; then
    echo "🔧 Initializing Elastic Beanstalk application..."
    eb init runerush-app --platform node.js --region us-east-1
fi

# Create environment (first time only)
if ! eb status runerush-prod &> /dev/null; then
    echo "🌍 Creating production environment..."
    eb create runerush-prod \
        --instance-type t3.small \
        --min-instances 1 \
        --max-instances 3 \
        --cname runerush-api
fi

# Deploy application
echo "🚀 Deploying RuneRush to AWS..."
eb deploy runerush-prod

# Get deployment status
echo "📊 Deployment Status:"
eb status runerush-prod
eb health runerush-prod

echo ""
echo "🎉 Deployment Complete!"
echo "📍 Your RuneRush app is live at:"
eb open runerush-prod

echo ""
echo "🔧 Next Steps:"
echo "1. Set up your domain: eb setenv FRONTEND_URL=https://yourdomain.com"
echo "2. Configure SSL certificate in AWS Certificate Manager"
echo "3. Update DNS to point to your Elastic Beanstalk URL"
echo "4. Upload template files to S3 bucket"
echo "5. Test payment flow with Stripe test mode"

echo ""
echo "📋 Useful Commands:"
echo "  eb logs        - View application logs"
echo "  eb config      - Edit environment configuration"
echo "  eb deploy      - Deploy new version"
echo "  eb terminate   - Terminate environment (be careful!)"
