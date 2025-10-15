#!/bin/bash

# Railway Setup Script for Smart Document Analyzer
# This script sets up the database and runs migrations

set -e

echo "🚀 Setting up Smart Document Analyzer on Railway..."

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

echo "📦 Generating Prisma client..."
railway run npx prisma generate

echo "🗄️ Running database migrations..."
railway run npx prisma migrate deploy

echo "✅ Setup completed successfully!"
echo "🌐 Your application should now be working properly"
