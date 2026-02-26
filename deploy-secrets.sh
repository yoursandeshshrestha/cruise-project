#!/bin/bash

# Script to set up all required Supabase secrets for Edge Functions
# This script reads values from .env file and sets them as Supabase secrets

set -e  # Exit on any error

echo "================================================"
echo "  Supabase Secrets Setup Script"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your configuration."
    exit 1
fi

# Source the .env file to get values
set -a
source .env
set +a

echo "📋 Setting Supabase secrets from .env file..."
echo ""

# Function to set a secret with error handling
set_secret() {
    local key=$1
    local value=$2

    if [ -z "$value" ]; then
        echo "⚠️  Warning: $key is empty, skipping..."
        return
    fi

    echo "Setting $key..."
    if supabase secrets set "$key=$value" 2>&1; then
        echo "✅ $key set successfully"
    else
        echo "❌ Failed to set $key"
    fi
    echo ""
}

# Set Stripe secrets
echo "🔐 Setting Stripe secrets..."
set_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
set_secret "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

# Set Mailgun secrets
echo "📧 Setting Mailgun secrets..."
set_secret "MAILGUN_API_KEY" "$MAILGUN_API_KEY"
set_secret "MAILGUN_DOMAIN" "$MAILGUN_DOMAIN"
set_secret "MAILGUN_FROM_EMAIL" "$MAILGUN_FROM_EMAIL"

echo ""
echo "================================================"
echo "✅ Secrets deployment complete!"
echo "================================================"
echo ""
echo "ℹ️  Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are"
echo "   automatically available to Edge Functions (system-managed)"
echo ""
echo "📋 Listing all secrets..."
supabase secrets list

echo ""
echo "💡 Tip: If any secret is missing or incorrect, you can set it manually:"
echo "   supabase secrets set KEY=value"
echo ""
