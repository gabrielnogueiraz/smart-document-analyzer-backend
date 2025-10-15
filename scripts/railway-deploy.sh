#!/bin/bash

# Railway Deploy Script for Smart Document Analyzer
# This script handles the deployment process for Railway

set -e

echo "🚀 Starting Railway deployment for Smart Document Analyzer..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "railway login"
    exit 1
fi

# Initialize Railway project if not already initialized
if [ ! -f ".railway/project.json" ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at the Railway URL"
echo "📊 Check the Railway dashboard for logs and monitoring"
